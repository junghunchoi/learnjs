const globalFileList = [];

const uploadFiles = (() => {
  const fileRequests = new WeakMap();
  const ENDPOINTS = {
    UPLOAD: 'http://localhost:1234/upload',
    UPLOAD_STATUS: 'http://localhost:1234/upload-status',
    UPLOAD_REQUEST: 'http://localhost:1234/upload-request',
  };
  const defaultOptions = {
    url: ENDPOINTS.UPLOAD,
    startingByte: 0,
    fileName: '',
    onAbort() {},
    onProgress() {},
    onError() {},
    onComplete() {},
  };

  const uploadFileChunks = (file, options, currentChunkIndex = 0) => {
    const chunkSize = 1024 * 1024 * 100; // 청크 크기 설정값 1MB

    setDownloadProgress(file.name, `${options.startingByte}|${options.startingByte + chunkSize}|${file.size}`);

    // 현재 청크 인덱스 * 파일크기가 파일 사이즈보다
    if (currentChunkIndex * chunkSize <= file.size) {
      const chunk = file.slice(currentChunkIndex * chunkSize, (currentChunkIndex + 1) * chunkSize);

      uploadChunk(chunk, currentChunkIndex, file, options)
        .then(() => {
          console.log('updateFileElement');
          console.log((options.startingByte * 100) / file.size)
          options.startingByte += chunk.size;
          updateFileElement(
            {
              ...options,
              size: options.startingByte,
              total: file.size,
              percentage: (options.startingByte * 100) / file.size,
              element: progressBox,
            },
            file,
          );
        })
        // .then(() => {
        //   console.log('updateProgressBox');
        //   updateProgressBox(file);
        // })
        .then(() => {
          console.log('Chunk upload complete.');
          uploadFileChunks(file, options, currentChunkIndex + 1);

        })
        .catch((error) => {
          console.error('Chunk upload failed:', error);

        });
    }
  };

  async function uploadChunk(chunk, chunkIndex, file, options) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('fileChunk', chunk);
      formData.append('fileName', file.name);

      const req = new XMLHttpRequest();
      req.open('POST', options.url, true);
      req.setRequestHeader(
          'Content-Range',
          `bytes=${options.startingByte}-${options.startingByte + chunk.size}/${file.size}`,
      );
      req.setRequestHeader('X-File-Id', encodeURI(file.name));

      req.onload = (e) => {
        if (req.status === 200) {
          // options.onComplete(e, file);
          resolve();
        } else {
          // options.onError(e, file);

        }
        clearDownloadProgress(encodeURI(file.name));
      };

      req.ontimeout = (e) => options.onError(e, file);

      req.onabort = (e) => options.onAbort(e, file);

      req.onerror = (e) => options.onError(e, file);

      fileRequests.get(file).request = req;

      req.send(formData);
    });
  }

  // 청크업로드하기전에 미리 request하여 임시 파일을 생성하던가 파일 존재 여부를 체크해야한다.
  const uploadFile = (file, options) => {
    options = { ...options, ...file }; // res = {fileName: "test.txt"}
    fileRequests.set(file, { request: null, options });

    uploadFileChunks(file, options);
  };

  const abortFileUpload = async (file) => {
    const fileReq = fileRequests.get(file);

    if (fileReq && fileReq.request) {
      fileReq.request.abort();
      return true;
    }

    return false;
  };

  const retryFileUpload = (file) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileName=${fileReq.options.fileName}`)
        .then((res) => res.json())
        .then((res) => {
          // if uploaded we continue
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch(() => {
          // if never uploaded we start
          uploadFileChunks(file, fileReq.options);
        });
    }
  };

  const resumeFileUpload = (file) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileName=${fileReq.options.fileName}`)
        .then((res) => res.json())
        .then((res) => {
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch((e) => {
          fileReq.options.onError({ ...e, file });
        });
    }
  };

  // 업로드 현황 업데이터
  const files = new Map();
  const progressBox = document.createElement('div');

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.innerHTML = `
				<h3>Uploading 0 Files</h3>
				<p class="upload-progress">
					<span class="uploads-percentage">0%</span>
					<span class="success-count">0</span>
					<span class="failed-count">0</span>
					<span class="paused-count">0</span>
				</p>
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  const updateProgressBox = (file) => {
    const [title, uploadProgress, expandBtn, progressBar] = progressBox.children;

    if (files.size > 0) {
      let totalUploadedFiles = 0;
      let totalUploadingFiles = 0;
      let totalFailedFiles = 0;
      let totalPausedFiles = 0;
      let totalChunkSize = 0;
      let totalUploadedChunkSize = 0;
      const [uploadedPerc, successCount, failedCount, pausedCount] = uploadProgress.children;

      files.forEach((fileObj) => {
        if (fileObj.status === 'FAILED') {
          totalFailedFiles += 1;
        } else {
          if (fileObj.status === 'COMPLETED') {
            totalUploadedFiles += 1;
          } else if (fileObj.status === 'FILE_STATUS.PAUSED') {
            totalPausedFiles += 1;
          } else {
            totalUploadingFiles += 1;
          }
          totalChunkSize += fileObj.total;
          totalUploadedChunkSize += fileObj.size;
        }
      });

      const percentage =
        totalChunkSize > 0 ? Math.min(100, Math.round((totalUploadedChunkSize * 100) / totalChunkSize)) : 0;

      title.textContent =
        percentage === 100
          ? `Uploaded ${totalUploadedFiles} File${totalUploadedFiles !== 1 ? 's' : ''}`
          : `Uploading ${totalUploadingFiles}/${files.size} File${files.size !== 1 ? 's' : ''}`;
      uploadedPerc.textContent = `${percentage}%`;
      successCount.textContent = totalUploadedFiles;
      failedCount.textContent = totalFailedFiles;
      pausedCount.textContent = totalPausedFiles;
      progressBox.style.backgroundSize = `${percentage}%`;
      expandBtn.style.display = 'inline-block';
      uploadProgress.style.display = 'block';
      progressBar.style.display = 'block';
    } else {
      title.textContent = 'No Upload in Progress';
      expandBtn.style.display = 'none';
      uploadProgress.style.display = 'none';
      progressBar.style.display = 'none';
    }
  };

  const updateFileElement = (fileObject,file) => {
    requestAnimationFrame(() => {
      const element = file.element;
      const processBar = element.getElementsByClassName('progress-bar')[0];
      // status.textContent =
      //     fileObject.status === "COMPLETED"
      //         ? fileObject.status
      //         : `${Math.round(fileObject.percentage)}%`;
      // status.className = `status ${fileObject.status}`;
      processBar.style.width = fileObject.percentage + '%';
      processBar.style.background = 'green';
      // fileObject.status === "COMPLETED"
      //     ? 'green'
      //     : fileObject.status === "FAILED"
      //         ? 'red'
      //         : '#222';
      // pauseBtn.style.display =
      //     fileObject.status === "UPLOADING" ? 'inline-block' : 'none';
      // retryBtn.style.display = fileObject.status === "FAILED" ? 'inline-block' : 'none';
      // resumeBtn.style.display = fileObject.status === "PAUSED" ? 'inline-block' : 'none';
      // clearBtn.style.display =
      //     fileObject.status === "COMPLETED" || fileObject.status === "PAUSED"
      //         ? 'inline-block'
      //         : 'none';
      updateProgressBox();
    });
  };
  // 업데이트 종료

  //uploadFiles return
  return (files, options = defaultOptions) => {
    [...files].forEach((file) => uploadFile(file, { ...defaultOptions, ...options }));

    return {
      abortFileUpload,
      retryFileUpload,
      resumeFileUpload,
    };
  };
})();

const uploadAndTrackFiles = (() => {
  const files = new Map();
  const progressBox = document.createElement('div');
  let uploader = null;

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  const setFileElement = (file) => {
    const extIndex = file.name.lastIndexOf('.');
    const fileElement = document.createElement('div');
    fileElement.className = 'file-progress';
    fileElement.innerHTML = `
			<div class="file-details" style="position: relative">
				<p>
					<span class="status">pending</span>
					<span class="file-name">${file.name.slice(25)}</span>
					<span class="file-ext"></span>
				</p>
				<div class="progress-bar" style="width: 0;"></div>
			</div>
			<div class="file-actions">
				<button type="button" class="retry-btn" style="display: none">Retry</button>
				<button type="button" class="cancel-btn" style="display: none">Pause</button>
				<button type="button" class="resume-btn" style="display: none">Resume</button>
				<button type="button" class="clear-btn" style="display: none">Clear</button>
			</div>
		`;

    files.set(file, {
      element: fileElement,
      size: file.size,
      percentage: 0,
      uploadedChunkSize: 0,
    });

    progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);

    return fileElement;
  };

  return (globalFileList) => {
    for (let i = 0; i < globalFileList.length; i++) {
      globalFileList[i].element = setFileElement(globalFileList[i]);
    }
    document.body.appendChild(progressBox);

    uploader = uploadFiles(globalFileList);
  };
})();

const fileInput = document.getElementsByClassName('upload-btn');

fileInput[0].addEventListener('click', (e) => {
  e.preventDefault();
  if (globalFileList.length === 0) {
    alert('파일을 첨부한 후 전송버튼을 눌러주세요.');
    return;
  }

  uploadAndTrackFiles(globalFileList);
  e.currentTarget.value = '';
  globalFileList.length = 0;
});

/////////////////////////////////////////////////////////////////

// 저장된 파일 리스트 반환
document.addEventListener('DOMContentLoaded', function () {
  const $downloadList = document.getElementsByClassName('download-list-area')[0];
  fetch('http://localhost:1234/files')
    .then((response) => response.json())
    .then((files) => {
      for (let i = 0; i < files.length; i++) {
        $downloadList.appendChild(createListElement(files[i]));
        // console.log(createListElement(files[i]));
      }
    })
    .catch((error) => console.error('Error fetching files:', error));
});

// 받아온 리스트를 체크박스로 선택할 수 있는 li로 생성하는 함수
function createListElement(file) {
  const ul = document.createElement('ul');
  const li = document.createElement('li');
  const convertFileName = file.slice(25);

  li.className = 'list-group-item d-flex justify-content-between align-items-center';
  li.innerHTML = `
		<div class="custom-control custom-checkbox">
			<input type="checkbox" class="custom-control-input" id="${file}" name="file" value="${convertFileName}">
			<label class="custom-control-label" for="${file}">${convertFileName}</label>
		</div>
	`;
  ul.appendChild(li);
  return ul;
}

document.getElementsByClassName('download-btn')[0].addEventListener('click', (e) => {
  return fetch('http://localhost:1234/download', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileList: getCheckedFileList(),
    }),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((error) => console.error('Error fetching files:', error));
});

const getCheckedFileList = () => {
  const checkboxes = document.querySelectorAll(".download-list-area input[type='checkbox']");
  const checked = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

  return checked.map((checkbox) => checkbox.id);
};

// 이어올리기 로컬스토리지
function setDownloadProgress(fileName, bytesDownloaded) {
  localStorage.setItem(fileName, bytesDownloaded.toString());
}

function getDownloadProgress(fileName) {
  return parseInt(localStorage.getItem(fileName)) || 0;
}

function clearDownloadProgress(fileName) {
  localStorage.removeItem(fileName);
}
