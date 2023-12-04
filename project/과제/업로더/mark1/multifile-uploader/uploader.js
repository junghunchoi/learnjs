var globalFileList = [];

var uploadFiles = (function() {
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
    onAbort: function() {},
    onProgress: function() {},
    onError: function() {},
    onComplete: function() {},
  };

  var uploadFileChunks = function(file, options) {
    var chunkSize = 1024 * 1024 * 1; // 청크 크기 설정값 1MB
    var currentChunkIndex = options.currentChunkIndex;

    setDownloadProgress(
        file.name,
        options.startingByte + '|' + (options.startingByte + chunkSize) + '|' + file.size + '|' + file.originLastModified
    );

    if (currentChunkIndex * chunkSize <= file.size) {
      var chunk = file.slice(options.startingByte, options.startingByte + chunkSize);
      uploadChunk(chunk, currentChunkIndex, file, options, function(err) {
        if (err) {
          console.error('error', err);
        } else {
          if (options.startingByte !== file.size) {
            options.currentChunkIndex = currentChunkIndex + 1;
            uploadFileChunks(file, options);
          }
        }
      });
    }
  };

  function uploadChunk(chunk, chunkIndex, file, options, callback) {
    var formData = new FormData();
    formData.append('fileChunk', chunk);
    formData.append('fileName', file.name);

    var req = new XMLHttpRequest();
    req.open('POST', options.url, true);
    req.setRequestHeader(
        'Content-Range',
        'bytes=' + options.startingByte + '-' + (options.startingByte + chunk.size) + '/' + file.size
    );
    req.setRequestHeader('X-File-Id', encodeURI(file.name));
    options.startingByte += chunk.size;

    req.onload = function() {
      if (req.status === 200) {
        // HTTP 상태 코드가 200일 경우
        if (options.startingByte === file.size) {
          options.onComplete({
            url: options.url,
            startingByte: options.startingByte,
            fileName: options.fileName,
            currentChunkIndex: options.currentChunkIndex,
            onAbort: options.onAbort,
            onProgress: options.onProgress,
            onError: options.onError,
            onComplete: options.onComplete,
            status: 'COMPLETE',
            percentage: (options.startingByte * 100) / file.size,
            progressElement: options.progressElement,
            file: file
          });
          clearDownloadProgress(encodeURI(file.name));
          createUploadedFileList();
          removeFileList(file);
        } else {
          options.onProgress({
            // 여기서 스프레드 연산자(...) 대신 객체의 속성을 직접 복사합니다.
            url: options.url,
            startingByte: options.startingByte,
            fileName: options.fileName,
            currentChunkIndex: options.currentChunkIndex,
            onAbort: options.onAbort,
            onProgress: options.onProgress,
            onError: options.onError,
            onComplete: options.onComplete,
            status: 'UPLOADING',
            percentage: (options.startingByte * 100) / file.size,
            progressElement: options.progressElement,
            file: file
          });
        }
        callback(null);
      } else {
        // 다른 HTTP 상태 코드일 경우
        callback(new Error('Upload failed with status: ' + req.status));
      }
    };

    req.ontimeout = function() { options.onError(file); };
    req.onabort = function() { options.onAbort(file); };
    req.onerror = function() { options.onError(file); };

    fileRequests.get(file).request = req;

    req.send(formData);
  }

  var uploadFile = function(file, options) {
    // 스프레드 연산자 대신 수동으로 객체 속성 복사
    var extendedOptions = {
      url: options.url || defaultOptions.url,
      startingByte: options.startingByte || defaultOptions.startingByte,
      fileName: options.fileName || defaultOptions.fileName,
      currentChunkIndex: options.currentChunkIndex
          || defaultOptions.currentChunkIndex,
      onAbort: options.onAbort || defaultOptions.onAbort,
      onProgress: options.onProgress || defaultOptions.onProgress,
      onError: options.onError || defaultOptions.onError,
      onComplete: options.onComplete || defaultOptions.onComplete
    };

    fileRequests.set(file, {request: null, options: extendedOptions});
    uploadFileChunks(file, extendedOptions);
  }

    var abortFileUpload = function(file){
      var fileReq = fileRequests.get(file);

      if (fileReq && fileReq.request) {
        fileReq.request.abort();
        return true;
      }

      return false;
    };

    var resumeFileUpload = function(file) {
      var fileReq = fileRequests.get(file);

      if (fileReq) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', ENDPOINTS.UPLOAD_STATUS + '?fileName=' + encodeURIComponent(file.name), true);

        xhr.onload = function() {
          if (xhr.status === 200) {
            var res = JSON.parse(xhr.responseText);
            var updatedOptions = {
              url: fileReq.options.url,
              startingByte: Number(res.totalChunkUploaded),
              fileName: fileReq.options.fileName,
              currentChunkIndex: fileReq.options.currentChunkIndex,
              onAbort: fileReq.options.onAbort,
              onProgress: fileReq.options.onProgress,
              onError: fileReq.options.onError,
              onComplete: fileReq.options.onComplete
            };
            uploadFileChunks(file, updatedOptions);
          } else {
            console.log('error', xhr.statusText);
            fileReq.options.onError({ error: xhr.statusText, file: file });
          }
        };

        xhr.onerror = function() {
          console.log('Network error');
          fileReq.options.onError({ error: 'Network error', file: file });
        };

        xhr.send();
      }
    };

    var clearFileUpload = function(file, callback) {
      var fileReq = fileRequests.get(file);

      if (fileReq) {
        abortFileUpload(file, function(success) {
          if (success) {
            fileRequests.delete(file);
            clearDownloadProgress(encodeURI(file.name));
            removeFileList(file);
            callback(true);
          } else {
            callback(false);
          }
        });
      } else {
        callback(false);
      }
    };

// abortFileUpload 함수도 콜백을 받도록 수정
    var abortFileUpload = function(file, callback) {
      var fileReq = fileRequests.get(file);

      if (fileReq && fileReq.request) {
        fileReq.request.abort();
        callback(true);
      } else {
        callback(false);
      }
    };


  var removeFileList = function(file){
    var $fileUploader = document.getElementById('fileUploader');
    var childComponent = document.getElementById(file.name.slice(25));

    if ($fileUploader && childComponent) {
      $fileUploader.removeChild(childComponent);
    }
  }

  var progressBox = document.createElement('div');

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.textContent = 'Uploading...';
  progressBox.innerHTML = `
				<div class="uploads-progress-bar" style="width: 0;"></div>
				<div class="file-progress-wrapper" style="width: 100%"></div>
			`;

  return function(files, options) {
    var filesArray = [];
    for (var i = 0; i < files.length; i++) {
      filesArray.push(files[i]);
    }

    filesArray.forEach(function(file) {
      uploadFile(file, options || defaultOptions);
    });

    return {
      abortFileUpload: abortFileUpload,
      resumeFileUpload: resumeFileUpload,
      clearFileUpload: clearFileUpload
    };
  };
})();

var uploadAndTrackFiles = (function() {
  var files = {}; // Map 대신 일반 객체 사용
  var $progressArea = document.getElementsByClassName('progress-area')[0];
  var progressBox = document.createElement('div');
  var uploader = null;

  progressBox.className = 'upload-progress-tracker expanded';
  progressBox.innerHTML =
      '<div class="uploads-progress-bar" style="width: 0;"></div>' +
      '<div class="file-progress-wrapper" style="width: 100%"></div>';

  var setFileElement = function(file) {
    var fileElement = document.createElement('div');
    fileElement.className = 'file-progress';
    fileElement.innerHTML =
        '<div class="file-details" style="position: relative">' +
        '<p>' +
        '<span class="status">pending</span>' +
        '<span class="file-name">' + file.name.slice(25) + '</span>' +
        '<span class="file-ext"></span>' +
        '</p>' +
        '<div class="progress-bar" style="width: 0;"></div>' +
        '</div>' +
        '<div class="file-actions">' +
        '<button type="button" class="cancel-btn" style="display: none">Pause</button>' +
        '<button type="button" class="resume-btn" style="display: none">Resume</button>' +
        '<button type="button" class="clear-btn" style="display: none">Clear</button>' +
        '</div>';

    var fileActions = fileElement.children[1];
    var pauseBtn = fileActions.children[0];
    var resumeBtn = fileActions.children[1];
    var clearBtn = fileActions.children[2];

    files[file.name] = { // 파일 이름을 키로 사용
      element: fileElement,
      size: file.size,
      status: 'PENDING',
      percentage: 0,
      uploadedChunkSize: 0,
    };

    clearBtn.addEventListener('click', function() {
      uploader.clearFileUpload(file);
      delete files[file.name];
      fileElement.remove();
    });

    pauseBtn.addEventListener('click', function() {
      uploader.abortFileUpload(file);
    });

    resumeBtn.addEventListener('click', function() {
      uploader.resumeFileUpload(file);
    });

    progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);

    return fileElement;
  };

  function updateFileElement(fileObject) {
    var fileElementChildren = fileObject.element.children;

    // 첫 번째 자식 요소는 건너뛰고 두 번째 자식 요소의 자식들을 가져옵니다.
    var actionButtons = fileElementChildren[1].children;
    var pauseBtn = actionButtons[0];
    var resumeBtn = actionButtons[1];
    var clearBtn = actionButtons[2];

    var processBar = fileObject.element.getElementsByClassName('progress-bar')[0];

    processBar.style.width = fileObject.percentage + '%';
    processBar.style.background = 'green';
    pauseBtn.style.display = fileObject.status === 'UPLOADING' ? 'inline-block' : 'none';
    resumeBtn.style.display = fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
    clearBtn.style.display =
        fileObject.status === 'COMPLETED' || fileObject.status === 'PAUSED' ? 'inline-block' : 'none';
  }

  function onComplete(file){
    var fileObj = files.get(file.file);

    fileObj.status = 'COMPLETED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  }

  function onProgress(file){
    var fileObj = files.get(file.file);

    fileObj.status = 'UPLOADING';
    fileObj.percentage = file.percentage;

    updateFileElement(fileObj);
  }

  function onError(file){
    var fileObj = files.get(file.file);

    fileObj.status = 'FAILED';
    fileObj.percentage = 100;

    updateFileElement(fileObj);
  }

  function onAbort(file){
    var fileObj = files.get(file);
    fileObj.status = 'PAUSED';

    updateFileElement(fileObj);
  }

  return function(globalFileList) {
    for (var i = 0; i < globalFileList.length; i++) {
      globalFileList[i].element = setFileElement(globalFileList[i]);
    }
    $progressArea.appendChild(progressBox);

    uploader = uploadFiles(globalFileList, {
      onProgress: onProgress,
      onError: onError,
      onAbort: onAbort,
      onComplete: onComplete
    });
  };
})();

var fileInput = document.getElementsByClassName('upload-btn');

fileInput[0].addEventListener('click', function(e) {
  e.preventDefault();
  if (globalFileList.length === 0) {
    alert('파일을 첨부한 후 전송버튼을 눌러주세요.');
    return;
  }

  function checkSavedServerFiles(fileName, callback) {
    var saveFileSize = 0;
    var url = 'http://10.10.0.157:1234/upload-status?fileName=' + encodeURIComponent(fileName);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);

    xhr.onload = function() {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        saveFileSize = data.totalChunkUploaded;
        callback(null, saveFileSize);
      } else {
        callback(new Error('Error fetching file size'));
      }
    };

    xhr.onerror = function() {
      callback(new Error('Network error'));
    };

    xhr.send();
  }

  function checkProgressedFiles(callback) {
    var localStorageList = [];
    var progressedFileString = '';

    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i).slice(25);
      var value = localStorage.getItem(localStorage.key(i));
      localStorageList.push({ key, value });
    }

    var completed = 0;
    var checkNext = function() {
      if (completed >= globalFileList.length) {
        callback(null, progressedFileString);
        return;
      }

      var file = globalFileList[completed];
      for (var j = 0; j < localStorageList.length; j++) {
        if (
            file.name.slice(25) === localStorageList[j].key &&
            Number(file.originLastModified) === Number(localStorageList[j].value.split('|')[3]) &&
            file.size === Number(localStorageList[j].value.split('|')[2])
        ) {
          var newFileName = localStorage.key(j);
          checkSavedServerFiles(newFileName, function(error, size) {
            if (error) {
              console.error(error);
              completed++;
              checkNext();
            } else {
              file.startingByte = size;
              progressedFileString += file.name.slice(25) + ' ';
              completed++;
              checkNext();
            }
          });
          return;
        }
      }
      completed++;
      checkNext();
    };

    checkNext();
  }

  checkProgressedFiles(function(error, progressedFileString) {
    if (error) {
      console.error(error);
    } else {
      if (progressedFileString.length !== 0) {
        alert(progressedFileString + ' 파일은 이전에 업로드가 진행되었던 파일입니다. 이어서 업로드를 진행합니다.');
      }
      uploadAndTrackFiles(globalFileList);
      globalFileList.length = 0;
    }
  });
});


// 저장된 파일 리스트 반환
document.addEventListener('DOMContentLoaded', function () {
  createUploadedFileList();
});

function createUploadedFileList() {
  var $downloadList = document.getElementsByClassName('download-list-area')[0];
  $downloadList.innerHTML = '';

  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'http://10.10.0.157:1234/files', true);

  xhr.onload = function() {
    if (xhr.status === 200) {
      var files = JSON.parse(xhr.responseText);
      for (var i = 0; i < files.length; i++) {
        $downloadList.appendChild(createListElement(files[i]));
      }
    } else {
      console.error('Error fetching files:', xhr.statusText);
    }
  };

  xhr.onerror = function() {
    console.error('Network error');
  };

  xhr.send();
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

document.getElementsByClassName('download-btn')[0].addEventListener('click', function(e) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'http://10.10.0.157:1234/download', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'blob';

  xhr.onload = function() {
    if (xhr.status === 200) {
      var blob = xhr.response;
      var url = window.URL || window.webkitURL;
      var downloadUrl = url.createObjectURL(blob);
      var a = document.createElement('a');

      a.href = downloadUrl;
      a.download = 'files.zip';
      document.body.appendChild(a);
      a.click();

      // 필요에 따라 setTimeout을 사용하여 URL을 해제
      setTimeout(function() {
        URL.revokeObjectURL(downloadUrl);
      }, 100); // 100ms 후에 URL 해제

      a.remove();
    } else {
      console.error('Error fetching files:', xhr.statusText);
    }
  };

  xhr.onerror = function() {
    console.error('Network error');
  };

  var data = JSON.stringify({
    fileList: getCheckedFileList()
  });
  xhr.send(data);
});

function getCheckedFileList() {
  var checkboxes = document.querySelectorAll(".download-list-area input[type='checkbox']");
  var checked = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      checked.push(checkboxes[i].id);
    }
  }
  return checked;
}

// 이어올리기 로컬스토리지
function setDownloadProgress(fileName, bytesDownloaded) {
  localStorage.setItem(fileName, bytesDownloaded.toString());
}

function clearDownloadProgress(fileName) {
  localStorage.removeItem(decodeURIComponent(fileName));
}
