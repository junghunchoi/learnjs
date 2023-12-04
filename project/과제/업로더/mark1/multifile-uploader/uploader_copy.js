var globalFileList = [];

var uploadFiles = (() => {
  var fileRequests = new WeakMap();
  var ENDPOINTS = {
    UPLOAD: 'http://10.10.0.157:1234/upload',
    UPLOAD_STATUS: 'http://10.10.0.157:1234/upload-status',
    UPLOAD_REQUEST: 'http://10.10.0.157:1234/upload-request',
  };
  var defaultOptions = {
    url: ENDPOINTS.UPLOAD,
    startingByte: 0,
    fileName: '',
    currentChunkIndex: 0,
    onAbort() {},
    onProgress() {},
    onError() {},
    onCompvare() {},
  };

  var uploadFileChunks = async (file, options) => {
    var chunkSize = 1024 * 1024 * 1; // 청크 크기 설정값 1MB
    var currentChunkIndex = options.currentChunkIndex;

    setDownloadProgress(
      file.name,
      `${options.startingByte}|${Number(options.startingByte) + Number(chunkSize)}|${file.size}|${file.originLastModified}`,
    );
    if (currentChunkIndex * chunkSize <= file.size) {
      var chunk = file.slice(options.startingByte, options.startingByte + chunkSize);
      try {
        await uploadChunk(chunk, currentChunkIndex, file, options);
        if (options.startingByte !== file.size) {
          options.currentChunkIndex = currentChunkIndex + 1;
          await uploadFileChunks(file, options);
        }
      } catch (error) {
        console.error('error', error);
      }
    }
  };

  async function uploadChunk(chunk, chunkIndex, file, options) {
    return new Promise((resolve, reject) => {
      var formData = new FormData();
      formData.append('fileChunk', chunk);
      formData.append('fileName', file.name);

      var req = new XMLHttpRequest();
      req.open('POST', options.url, true);
      req.setRequestHeader(
        'Content-Range',
        `bytes=${options.startingByte}-${options.startingByte + chunk.size}/${file.size}`,
      );
      req.setRequestHeader('X-File-Id', encodeURI(file.name));
      options.startingByte += chunk.size;

      if (options.startingByte === file.size) {
        options.onCompvare({
          ...options,
          status: 'COMPvarE',
          percentage: (options.startingByte * 100) / file.size,
          progressElement: progressBox,
          file: file,
        });
        clearDownloadProgress(encodeURI(file.name));
        createUploadedFileList();
        removeFileList(file);
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

  var uploadFile = (file, options) => {
    options = { ...options, ...file };
    fileRequests.set(file, { request: null, options });

    uploadFileChunks(file, options);
  };

  var abortFileUpload = async (file) => {
    var fileReq = fileRequests.get(file);

    if (fileReq && fileReq.request) {
      fileReq.request.abort();
      return true;
    }

    return false;
  };

  var resumeFileUpload = (file) => {
    var fileReq = fileRequests.get(file);

    if (fileReq) {
      return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}`)
        .then((res) => res.json())
        .then((res) => {
          uploadFileChunks(file, {
            ...fileReq.options,
            startingByte: Number(res.totalChunkUploaded),
          });
        })
        .catch((e) => {
          console.log('error', e);
          fileReq.options.onError({ ...e, file });
        });
    }
  };

  var clearFileUpload = async (file) => {
    var fileReq = fileRequests.get(file);

    if (fileReq) {
      await abortFileUpload(file);
      fileRequests.devare(file);
      clearDownloadProgress(encodeURI(file.name));
      removeFileList(file);
      return true;
    }

    return false;
  };

  var removeFileList = (file) => {
    var $fileUploader = document.getElementById('fileUploader');
    var childComponent = document.getElementById(file.name.slice(25));

    if ($fileUploader && childComponent) {
      $fileUploader.removeChild(childComponent);
    }
  }

  // 업로드 현황 업데이터
  var progressBox = document.createElement('div');

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.textContent = 'Uploading...';
  progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  return (files, options = defaultOptions) => {
    [...files].forEach((file) => {
      uploadFile(file, { ...defaultOptions, ...options });
    });

    return {
      abortFileUpload,
      // retryFileUpload,
      resumeFileUpload,
      clearFileUpload,
    };
  };
})();

var uploadAndTrackFiles = (() => {
  var files = new Map();
  var $progressArea = document.getElementsByClassName('progress-area')[0];
  var progressBox = document.createElement('div');
  var uploader = null;

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  var setFileElement = (file) => {
    var fileElement = document.createElement('div');
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

    var [
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
      files.devare(file);
      fileElement.remove();
    });
    pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
    resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
    progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);

    return fileElement;
  };

  var updateFileElement = (fileObject) => {
    var [
      ,
      {
        children: [, pauseBtn, resumeBtn, clearBtn],
      },
    ] = fileObject.element.children;

    var element = fileObject.element;
    var processBar = element.getElementsByClassName('progress-bar')[0];

    processBar.style.width = fileObject.percentage + '%';
    processBar.style.background = 'green';
    pauseBtn.style.display = fileObject.status === 'UPLOADING' ? 'inline-block' : 'none';
    resumeBtn.style.display = fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
    clearBtn.style.display =
      fileObject.status === 'COMPvarED' || fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
  };

  var onCompvare = (file) => {
    var fileObj = files.get(file.file);

    fileObj.status = 'COMPvarED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  };

  var onProgress = (file) => {
    var fileObj = files.get(file.file);

    fileObj.status = 'UPLOADING';
    fileObj.percentage = file.percentage;

    updateFileElement(fileObj);
  };

  var onError = (file) => {
    var fileObj = files.get(file.file);

    fileObj.status = 'FAILED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  };

  var onAbort = (file) => {
    var fileObj = files.get(file);
    fileObj.status = 'PAUSED';

    updateFileElement(fileObj);
  };

  return (globalFileList) => {
    for (var i = 0; i < globalFileList.length; i++) {
      globalFileList[i].element = setFileElement(globalFileList[i]);
    }
    $progressArea.appendChild(progressBox);

    uploader = uploadFiles(globalFileList, {
      onProgress,
      onError,
      onAbort,
      onCompvare,
    });
  };
})();

var fileInput = document.getElementsByClassName('upload-btn');

fileInput[0].addEventListener('click', (e) => {
  e.preventDefault();
  if (globalFileList.length === 0) {
    alert('파일을 첨부한 후 전송버튼을 눌러주세요.');
    return;
  }

  async function checkSavedServerFiles(fileName) {
    var saveFileSize = 0;
    var url = `http://10.10.0.157:1234/upload-status?fileName=${fileName}`;

    try {
      var response = await fetch(url);
      var data = await response.json();
      saveFileSize = data.totalChunkUploaded;
    } catch (error) {
      console.error('Error:', error);
    }

    return saveFileSize;
  }

  async function checkProgressedFiles() {
    var localStorageList = [];
    var progressedFileString = '';

    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i).slice(25);
      var value = localStorage.getItem(localStorage.key(i));
      localStorageList.push({ key, value });
    }


    for (var i = 0; i < globalFileList.length; i++) {
      for (var j = 0; j < localStorageList.length; j++) {
        if (
          globalFileList[i].name.slice(25) === localStorageList[j].key &&
          Number(globalFileList[i].originLastModified) === Number(localStorageList[j].value.split('|')[3]) &&
            globalFileList[i].size === Number(localStorageList[j].value.split('|')[2])
        ) {
          var newFileName = localStorage.key(j);
          var newFile = new File([globalFileList[i]], newFileName, {
            type: globalFileList[i].type,
          });

          globalFileList[i] = newFile;
          globalFileList[i].startingByte = await checkSavedServerFiles(newFileName);

          progressedFileString += globalFileList[i].name.slice(25) + ' ';
          break;
        }
      }
    }

    if (progressedFileString.length !== 0) {
      alert(`${progressedFileString} 파일은 이전에 업로드가 진행되었던 파일입니다. 이어서 업로드를 진행합니다.`);
    }
  }

  checkProgressedFiles()
    .then(() => {
      uploadAndTrackFiles(globalFileList);
      globalFileList.length = 0;
    })
    .catch((e) => {
      console.log('error', e);
    });
});


// 저장된 파일 리스트 반환
document.addEventListener('DOMContentLoaded', function () {
  createUploadedFileList();
});

function createUploadedFileList() {
  var $downloadList = document.getElementsByClassName('download-list-area')[0];
  $downloadList.innerHTML = '';

  fetch('http://10.10.0.157:1234/files')
  .then((response) => response.json())
  .then((files) => {
    for (var i = 0; i < files.length; i++) {
      $downloadList.appendChild(createListElement(files[i]));
    }
  })
  .catch((error) => console.error('Error fetching files:', error));
}

function createListElement(file) {
  var ul = document.createElement('ul');
  var li = document.createElement('li');
  var convertFileName = file.slice(25);

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
  return fetch('http://10.10.0.157:1234/download', {
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
      var url = window.URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
    })
    .catch((error) => console.error('Error fetching files:', error));
});

var getCheckedFileList = () => {
  var checkboxes = document.querySelectorAll(".download-list-area input[type='checkbox']");
  var checked = Array.from(checkboxes).filter((checkbox) => checkbox.checked);

  return checked.map((checkbox) => checkbox.id);
};

// 이어올리기 로컬스토리지
function setDownloadProgress(fileName, bytesDownloaded) {
  localStorage.setItem(fileName, bytesDownloaded.toString());
}

function clearDownloadProgress(fileName) {
  localStorage.removeItem(decodeURIComponent(fileName));
}
