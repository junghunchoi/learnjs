/*
uploadFiles 함수
여러 파일을 동시에 업로드하는 기능을 제공합니다.
uploadFile 함수로 각 파일의 초기 업로드를 시작합니다.
uploadFileChunks는 서버에 파일의 조각을 전송합니다.
업로드 중단, 재시도, 정지, 계속 기능을 제공합니다.

uploadAndTrackFiles 함수
업로드할 파일을 받아 UI를 통해 진행 상황을 추적합니다.
각 파일에 대한 상태 업데이트와 진행 상황 표시를 관리합니다.
파일의 업로드 상태(예: 대기 중, 업로드 중, 일시 중지, 완료, 실패)에 따라 UI 요소를 업데이트합니다.

이벤트 리스너
파일 입력(fileInput)에 변경사항이 발생하면 uploadAndTrackFiles 함수를 호출하여
선택된 파일들의 업로드를 시작합니다.

프로그레스 박스 UI
현재 업로드 상태를 표시하는 HTML 요소를 생성하고, 업로드 진행 상태에 따라 UI를 업데이트합니다.

콜백 함수들(onComplete, onProgress, onError, onAbort)
업로드의 각 단계에 대한 콜백을 제공합니다.
 */

const uploadFiles = (() => {
	const fileRequests = new WeakMap();
	const ENDPOINTS = {
		UPLOAD: 'http://localhost:1234/upload',
		UPLOAD_STATUS: 'http://localhost:1234/upload-status',
		UPLOAD_REQUEST: 'http://localhost:1234/upload-request'
	}
	const defaultOptions = {
		url: ENDPOINTS.UPLOAD,
		startingByte: 0,
		fileId: '',
		onAbort() {},
		onProgress() {},
		onError() {},
		onComplete() {}
	};

	
	const uploadFileChunks = (file, options) => {
		const formData = new FormData();
		const req = new XMLHttpRequest();
		const chunk = file.slice(options.startingByte);

		formData.append('chunk', chunk, file.name);
		formData.append('fileId', options.fileId);


		req.open('POST', options.url, true);
		req.setRequestHeader('Content-Range', `bytes=${options.startingByte}-${options.startingByte+chunk.size}/${file.size}`);
		req.setRequestHeader('X-File-Id', options.fileId);
		
		req.onload = (e) => {
			if (req.status === 200) {
				options.onComplete(e, file);
			} else {
				options.onError(e, file);
			}
		}
		
		req.upload.onprogress = (e) => {
			const loaded = options.startingByte + e.loaded;
			options.onProgress({...e,
				loaded,
				total: file.size,
				percentage: loaded * 100 / file.size
			}, file);
		}
		
		req.ontimeout = (e) => options.onError(e, file);
		
		req.onabort = (e) => options.onAbort(e, file);
		
		req.onerror = (e) => options.onError(e, file);
		
		fileRequests.get(file).request = req;

		req.send(formData);
	};
	
	const uploadFile = (file, options) => {
		return fetch(ENDPOINTS.UPLOAD_REQUEST, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				fileName: file.name,
			})
		})
			.then(res => res.json())
			.then(res => {
				options = {...options, ...res};
				fileRequests.set(file, {request: null, options});
				
				uploadFileChunks(file, options);
			})
			.catch(e => {
				options.onError({...e, file})
			})
	}
	
	const abortFileUpload = async file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq && fileReq.request) {
			fileReq.request.abort();
			return true;
		}
		
		return false;
	};
	
	const retryFileUpload = file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			// try to get the status just in case it failed mid upload
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => { // if uploaded we continue
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(() => { // if never uploaded we start
					uploadFileChunks(file, fileReq.options)
				})
		}
	};
	
	const clearFileUpload = async file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			await abortFileUpload(file);
			fileRequests.delete(file);
			
			return true;
		}
		
		return false;
	};
	
	const resumeFileUpload = file => {
		const fileReq = fileRequests.get(file);
		
		if (fileReq) {
			return fetch(`${ENDPOINTS.UPLOAD_STATUS}?fileName=${file.name}&fileId=${fileReq.options.fileId}`)
				.then(res => res.json())
				.then(res => {
					uploadFileChunks(file, {...fileReq.options, startingByte: Number(res.totalChunkUploaded)});
				})
				.catch(e => {
					fileReq.options.onError({...e, file})
				})
		}
	}
	
	return (files, options = defaultOptions) => {
		[...files].forEach(file => uploadFile(file, {...defaultOptions, ...options}));
		
		return {
			abortFileUpload,
			retryFileUpload,
			clearFileUpload,
			resumeFileUpload
		}
	}
})();

const uploadAndTrackFiles = (() => {
	const files = new Map();
	const progressBox = document.createElement('div');
	const FILE_STATUS = {
		PENDING: 'pending',
		UPLOADING: 'uploading',
		PAUSED: 'paused',
		COMPLETED: 'completed',
		FAILED: 'failed'
	}
	let uploader = null;

	
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
				<div class="file-progress-wrapper"></div>
			`;

	
	const updateProgressBox = () => {
		console.log("updateProgressBox")
		const [title, uploadProgress, expandBtn, progressBar] = progressBox.children;
		
		if (files.size > 0) {
			let totalUploadedFiles = 0;
			let totalUploadingFiles = 0;
			let totalFailedFiles = 0;
			let totalPausedFiles = 0;
			let totalChunkSize = 0;
			let totalUploadedChunkSize = 0;
			const [uploadedPerc, successCount, failedCount, pausedCount] = uploadProgress.children;
			
			files.forEach(fileObj => {
				if(fileObj.status === FILE_STATUS.FAILED) {
					totalFailedFiles += 1;
				} else {
					if (fileObj.status === FILE_STATUS.COMPLETED) {
						totalUploadedFiles += 1;
					} else if(fileObj.status === FILE_STATUS.PAUSED) {
						totalPausedFiles += 1;
					} else {
						totalUploadingFiles += 1;
					}
					console.log("fileObj", fileObj)
					totalChunkSize += fileObj.size;
					totalUploadedChunkSize += fileObj.uploadedChunkSize;
				}
			});
			
			const percentage = totalChunkSize > 0 ? Math.min(100, Math.round((totalUploadedChunkSize * 100) / totalChunkSize)) : 0;
			
			title.textContent = percentage === 100
				? `Uploaded ${totalUploadedFiles} File${totalUploadedFiles !== 1 ? 's' : ''}`
				: `Uploading ${totalUploadingFiles}/${files.size} File${files.size !== 1 ? 's' : ''}`;
			uploadedPerc.textContent = `${percentage}%`;
			successCount.textContent = totalUploadedFiles;
			failedCount.textContent = totalFailedFiles;
			pausedCount.textContent = totalPausedFiles;
			progressBar.style.width = `${percentage}%`;
			progressBox.style.backgroundSize = `${percentage}%`;
			expandBtn.style.display = 'inline-block';
			uploadProgress.style.display = 'block';
			progressBar.style.display = 'block';
		} else {
			title.textContent = 'No Upload in Progress'
			expandBtn.style.display = 'none';
			uploadProgress.style.display = 'none';
			progressBar.style.display = 'none';
		}
	}
	
	const updateFileElement = fileObject => {
		const [
			{children: [{children: [status]}, progressBar]}, // .file-details
			{children: [retryBtn, pauseBtn, resumeBtn, clearBtn]} // .file-actions
		] = fileObject.element.children;
		
		requestAnimationFrame(() => {
			status.textContent = fileObject.status === FILE_STATUS.COMPLETED ? fileObject.status : `${Math.round(fileObject.percentage)}%`;
			status.className = `status ${fileObject.status}`;
			progressBar.style.width = fileObject.percentage + '%';
			progressBar.style.background = fileObject.status === FILE_STATUS.COMPLETED
				? 'green' : fileObject.status === FILE_STATUS.FAILED
					? 'red' : '#222';
			pauseBtn.style.display = fileObject.status === FILE_STATUS.UPLOADING ? 'inline-block' : 'none';
			retryBtn.style.display = fileObject.status === FILE_STATUS.FAILED ? 'inline-block' : 'none';
			resumeBtn.style.display = fileObject.status === FILE_STATUS.PAUSED ? 'inline-block' : 'none';
			clearBtn.style.display = fileObject.status === FILE_STATUS.COMPLETED || fileObject.status === FILE_STATUS.PAUSED
				? 'inline-block' : 'none';
			updateProgressBox();
		});
	}
	
	const setFileElement = (file) => {
		const extIndex = file.name.lastIndexOf('.');
		const fileElement = document.createElement('div');
		fileElement.className = 'file-progress';
		fileElement.innerHTML = `
			<div class="file-details" style="position: relative">
				<p>
					<span class="status">pending</span>
					<span class="file-name">${file.name.substring(0, extIndex)}</span>
					<span class="file-ext">${file.name.substring(extIndex)}</span>
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
			status: FILE_STATUS.PENDING,
			percentage: 0,
			uploadedChunkSize: 0
		});
		
		const [_, {children: [retryBtn, pauseBtn, resumeBtn, clearBtn]}] = fileElement.children;
		
		clearBtn.addEventListener('click', () => {
			uploader.clearFileUpload(file);
			files.delete(file);
			fileElement.remove();
			updateProgressBox();
		});
		retryBtn.addEventListener('click', () => uploader.retryFileUpload(file));
		pauseBtn.addEventListener('click', () => uploader.abortFileUpload(file));
		resumeBtn.addEventListener('click', () => uploader.resumeFileUpload(file));
		progressBox.querySelector('.file-progress-wrapper').appendChild(fileElement);
	}
	
	const onComplete = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.COMPLETED;
		fileObj.percentage = 100;
		
		updateFileElement(fileObj);
	}
	
	const onProgress = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.UPLOADING;
		fileObj.percentage = e.percentage;
		fileObj.uploadedChunkSize = e.loaded;
		
		updateFileElement(fileObj);
	}
	
	const onError = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.FAILED;
		fileObj.percentage = 100;
		
		updateFileElement(fileObj);
	}
	
	const onAbort = (e, file) => {
		const fileObj = files.get(file);
		
		fileObj.status = FILE_STATUS.PAUSED;
		
		updateFileElement(fileObj);
	}
	
	return (uploadedFiles) => {
		[...uploadedFiles].forEach(setFileElement);
		
		document.body.appendChild(progressBox);
		
		uploader = uploadFiles(uploadedFiles, {
			onProgress,
			onError,
			onAbort,
			onComplete
		});
	}
})();

const fileInput = document.getElementById('file-upload-input');

fileInput.addEventListener('change', e => {
	debugger;
	uploadAndTrackFiles(e.currentTarget.files)
	e.currentTarget.value = '';
})
