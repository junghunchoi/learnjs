const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { promisify } = require("util");

const app = express();

const uniqueAlphaNumbericId = (() => {
  const heyStack = "0123456789abcdefghijklmnopqrstuvwxyz";
  const randomInt = () => Math.floor(Math.random() * Math.floor(heyStack.length));

  return (length = 24) => Array.from({ length }, () => heyStack[randomInt()]).join("");
})();

const getFilePath = (fileName, fileId) => `./uploads/file-${fileId}-${fileName}`;

app.use(express.json());
app.use(cors());

app.listen(1234, () => {
  console.log("listen on port 1234");
});

app.post("/upload-request", (req, res) => {
  if (!req.body || !req.body.fileName) {
    res.status(400).json({ message: 'Missing "fileName"' });
  } else {
    const fileId = uniqueAlphaNumericId();
    fs.createWriteStream(getFilePath(req.body.fileName, fileId), { flags: "w" });
    res.status(200).json({ fileId });
  }
});




const getFileDetails = promisify(fs.stat);
app.get("/upload-status", (req, res) => {
  if (req.query && req.query.fileName && req.query.fileId) {
    getFileDetails(getFilePath(req.query.fileName, req.query.fileId))
      .then((stats) => {
        res.status(200).json({ totalChunkUploaded: stats.size });
      })
      .catch((err) => {
        console.error("failed to read file", err);

        res.status(400).json({
          message: "No file with such credentials",
          credentials: req.query,
        });
      });
  }
});

const uploadAndTrackFiles = (() => {
    const progressBox = document.createElement('div');
    let uploader = null;
    const setFileElement = (file) => {
        // create file element here
    }
    const onProgress = (e, file) => {};
    const onError = (e, file) => {};
    const onAbort = (e, file) => {};
    const onComplete = (e, file) => {};
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
     uploadAndTrackFiles(e.currentTarget.files)
     e.currentTarget.value = '';
})