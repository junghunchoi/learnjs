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
    currentChunkIndex: 0,
    onAbort() {},
    onProgress() {},
    onError() {},
    onComplete() {},
  };

  const uploadFileChunks = async (file, options) => {
    const chunkSize = (1024 * 1024 * 1); // 청크 크기 설정값 1MB
    const currentChunkIndex = options.currentChunkIndex;

    setDownloadProgress(file.name, `${options.startingByte}|${options.startingByte + chunkSize}|${file.size}`);
    if (currentChunkIndex * chunkSize <= file.size) {
      // const chunk = file.slice(currentChunkIndex * chunkSize, (currentChunkIndex + 1) * chunkSize);
      const chunk = file.slice(options.startingByte, options.startingByte + chunkSize);
      try {
        await uploadChunk(chunk, currentChunkIndex, file, options);
        if (options.startingByte !== file.size) {
          options.currentChunkIndex = currentChunkIndex + 1;
          await uploadFileChunks(file, options); // 재귀 호출
        }
      } catch (error) {
        console.error('error', error);
      }
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
      options.startingByte += chunk.size;

          if (options.startingByte === file.size) {
            options.onComplete({
              ...options,
              status: 'COMPLETE',
              percentage: (options.startingByte * 100) / file.size,
              progressElement: progressBox,
              file: file,
            });

            clearDownloadProgress(encodeURI(file.name));
          } else {
            options.onProgress({
              ...options,
              status: 'UPLOADING',
              percentage: (options.startingByte * 100) / file.size,
              progressElement: progressBox,
              file: file,
            });
          }

      req.onload = () => {
        if (req.status === 200) {
          // HTTP 상태 코드가 200일 경우
          resolve(req.response);
        } else {
          // 다른 HTTP 상태 코드일 경우
          reject(new Error(`Upload failed with status: ${req.status}`));
        }
      };

      req.ontimeout = (e) => options.onError(file);

      req.onabort = (e) => options.onAbort(file);

      req.onerror = (e) => options.onError(file);

      fileRequests.get(file).request = req;

      req.send(formData);
    });
  }

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

  const resumeFileUpload = (file) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}`)
        .then((res) => {res.json();})
        .then((res) => {
          console.log('res', res)
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded)
          });
        })
        .catch((e) => {
          console.log('error', e);
          fileReq.options.onError({ ...e, file });
        });
    }
  };

  const clearFileUpload = async (file) => {
    const fileReq = fileRequests.get(file);

    if (fileReq) {
      await abortFileUpload(file);
      fileRequests.delete(file);

      return true;
    }

    return false;
  };

  // 업로드 현황 업데이터
  const files = new Map();
  const progressBox = document.createElement('div');

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.textContent = 'Uploading...';
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

  return (files, options = defaultOptions) => {
    [...files].forEach((file) => uploadFile(file, { ...defaultOptions, ...options }));

    return {
      abortFileUpload,
      // retryFileUpload,
      resumeFileUpload,
      clearFileUpload,
    };
  };
})();

const uploadAndTrackFiles = (() => {
  const files = new Map();
  const $progressArea = document.getElementsByClassName('progress-area')[0];
  const progressBox = document.createElement('div');
  let uploader = null;

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  const setFileElement = (file) => {
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

    const [
      _,
      {
        children: [, pauseBtn, resumeBtn, clearBtn],
      },
    ] = fileElement.children;

    files.set(file, {
      element: fileElement,
      size: file.size,
      status: 'PENDING',
      percentage: 0,
      uploadedChunkSize: 0,
    });

    clearBtn.addEventListener('click', () => {
      uploader.clearFileUpload(file);
      files.delete(file);
      fileElement.remove();
    });
    pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
    resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
    progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);

    return fileElement;
  };

  const updateFileElement = (fileObject) => {
    const [
      ,
      {
        children: [, pauseBtn, resumeBtn, clearBtn],
      }, // .file-actions
    ] = fileObject.element.children;

    console.log(fileObject.file, fileObject.status, fileObject.percentage)

    const element = fileObject.element;
    const processBar = element.getElementsByClassName('progress-bar')[0];

    processBar.style.width = fileObject.percentage + '%';
    processBar.style.background = 'green';
    pauseBtn.style.display = fileObject.status === 'UPLOADING' ? 'inline-block' : 'none';
    resumeBtn.style.display = fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
    clearBtn.style.display =
        fileObject.status === 'COMPLETED' || fileObject.status === 'PAUSED' ? 'inline-block' : 'none';

    // requestAnimationFrame(() => {
    //   const element = fileObject.element;
    //   const processBar = element.getElementsByClassName('progress-bar')[0];
    //
    //   processBar.style.width = fileObject.percentage + '%';
    //   processBar.style.background = 'green';
    //   pauseBtn.style.display = fileObject.status === 'UPLOADING' ? 'inline-block' : 'none';
    //   resumeBtn.style.display = fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
    //   clearBtn.style.display =
    //     fileObject.status === 'COMPLETED' || fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
    // });
  };

  const onComplete = (file) => {
    const fileObj = files.get(file.file);

    fileObj.status = 'COMPLETED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  };

  const onProgress = (file) => {
    const fileObj = files.get(file.file);

    fileObj.status = 'UPLOADING';
    fileObj.percentage = file.percentage;

    updateFileElement(fileObj);
  };

  const onError = (file) => {
    const fileObj = files.get(file.file);

    fileObj.status = 'FAILED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  };

  const onAbort = (file) => {
    const fileObj = files.get(file);
    fileObj.status = 'PAUSED';

    updateFileElement(fileObj);
  };

  const checkProgressedFiles = () => {
    const progressedFiles = [];
    const localStorageList = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i).slice(25);
      const value = localStorage.getItem(key);
      localStorageList.push({ key, value });
    }

    for (let i = 0; i < globalFileList.length; i++) {
      for (const localStorageListKey in localStorageList) {
        if (globalFileList[i].name.slice(25) === localStorageList[localStorageListKey].key) {
          globalFileList[i].startingByte = localStorageList[localStorageListKey].value.split('|')[0];
          return;
        }
      }
    }
  };

  return (globalFileList) => {
    for (let i = 0; i < globalFileList.length; i++) {
      globalFileList[i].element = setFileElement(globalFileList[i]);
    }
    $progressArea.appendChild(progressBox);

    uploader = uploadFiles(globalFileList, {
      onProgress,
      onError,
      onAbort,
      onComplete,
    });
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
