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
          console.log((options.startingByte * 100) / file.size);
          options.startingByte += chunk.size;
          // debugger
          options.onProgress({
            ...options,
            status: 'UPLOADING',
            percentage: (options.startingByte * 100) / file.size,
            progressElement: progressBox,
            file: file
          })
        })
        .then(() => {
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
        }
        clearDownloadProgress(encodeURI(file.name));
      };

      req.ontimeout = (e) => options.onError(file);

      req.onabort = (e) => options.onAbort(file);

      req.onerror = (e) => options.onError(file);

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
      retryFileUpload,
      resumeFileUpload,
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

    const [
      _,
      {
        children: [retryBtn, pauseBtn, resumeBtn, clearBtn],
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
    retryBtn.addEventListener('click', () => uploader.retryFileUpload(file));
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

    requestAnimationFrame(() => {
      const element = fileObject.element;
      const processBar = element.getElementsByClassName('progress-bar')[0];

      processBar.style.width = fileObject.percentage + '%';
      processBar.style.background = 'green';
      pauseBtn.style.display = fileObject.status === 'UPLOADING' ? 'inline-block' : 'none';
      resumeBtn.style.display = fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
      clearBtn.style.display =
        fileObject.status === 'COMPLETED' || fileObject.status === 'PAUSED' ? 'inline-block' : 'none';

      // updateProgressBox();
    });
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
    const fileObj = files.get(file);

    fileObj.status = 'FAILED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  };

  const onAbort = (file) => {
    const fileObj = files.get(file);
    debugger
    fileObj.status = 'PAUSED';

    updateFileElement(fileObj);
  };

  return (globalFileList) => {
    for (let i = 0; i < globalFileList.length; i++) {
      globalFileList[i].element = setFileElement(globalFileList[i]);
    }
    $progressArea.appendChild(progressBox);

    uploader = uploadFiles(globalFileList,{
      onProgress,
      onError,
      onAbort,
      onComplete
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
  // globalFileList.length = 0;
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
