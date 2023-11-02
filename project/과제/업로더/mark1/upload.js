const { options } = require("dropzone")

const fileInput = document.getElementById("file-upload-input")

fileInput.addEventListener('change',e=>{
       // handle file here
    const ENDPOINTS = {
        UPLOAD: 'http://localhost:1234/upload',
        UPLOAD_STATUS: 'http://localhost:1234/upload-status',
        UPLOAD_REQUEST: 'http://localhost:1234/upload-request'
    }

    const defaultOption ={
        url : ENDPOINTS.UPLOAD,
        statingByte: 0,
        fileId: '',
        onAbor(){},
        onError() {},
      onComplete() {}
    }

    return (files, options = defaultOption) =>{
         // handle file objects here
    }
})