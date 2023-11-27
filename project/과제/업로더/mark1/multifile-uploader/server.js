const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { promisify } = require('util');
const Busboy = require('busboy');
const path = require('path');
const archiver = require('archiver');


const app = express();
const getFileDetails = promisify(fs.stat);


const getFilePath = (fileName) => `./uploads/${fileName}`;

app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// app.post("/upload-request", (req, res) => {
//
//   console.log("/upload-request");
//   if (!req.body || !req.body.fileName) {
//     res.status(400).json({message: 'Missing "fileName"'});
//   } else {
//     // const fileName = uniqueAlphaNumericId();
//     const fileName = req.body.fileName;
//     fs.createWriteStream(getFilePath(req.body.fileName),
//         {flags: "w"});
//     res.status(200).json({fileName});
//   }
//
//
// });

// 진행상태 받아옴
app.get('/upload-status', (req, res) => {
  console.log('/upload-status');
  if (req.query && req.query.fileName) {
    getFileDetails(getFilePath(req.query.fileName))
      .then((stats) => {
        res.status(200).json({ totalChunkUploaded: stats.size });
      })
      .catch((err) => {
        console.error('failed to read file', err);
        res.status(400).json({ message: 'No file with such credentials', credentials: req.query });
      });
  }
});

app.post('/upload', (req, res) => {
  console.log('/upload');
  const contentRange = req.headers['content-range'];
  const fileName = req.headers['x-file-id']


  if (!contentRange) {
    console.log('Missing Content-Range');
    return res.status(400).json({ message: 'Missing "Content-Range" header' });
  }

  if (!fileName) {
    console.log('Missing File Id');
    return res.status(400).json({ message: 'Missing "X-File-Id" header' });
  }

  const match = contentRange.match(/bytes=(\d+)-(\d+)\/(\d+)/); // ["bytes=200-999/1200", "200", "999", "1200"]

  console.log(contentRange)

  const busboy = new Busboy({ headers: req.headers });

  busboy.on('file', (_, file) => {
    file
    .pipe(fs.createWriteStream(`./uploads/${decodeURIComponent(fileName)}`, {flags: 'a'}))
    .on('error', (e) => {
      console.error('failed upload', e);
      res.sendStatus(500);
    });
  });


  busboy.on('error', (e) => {
    console.error('failed upload', e);
    res.sendStatus(500);
  });

  busboy.on('finish', () => {
    res.sendStatus(200);
  });

  req.on('close', () => {
    console.log('request closed');
  });

  req.pipe(busboy);

});

app.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, './uploads');

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send('Unable to scan directory: ' + err);
    } else {
      res.json(files);
    }
  });
});

app.post('/download', (req, res) => {
  console.log('/download');
  const archiveName = 'files.zip';
  const fileList = req.body.fileList;
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-disposition', 'attachment; filename=' + archiveName);

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.pipe(res);

  fileList.forEach((file) => {
    const filePath = path.join(__dirname, './uploads', file);
    console.log(filePath);
    archive.file(filePath, { name: file.slice(25) });
  });

  archive.finalize().catch((err) => {
    res.status(500).send('Unable to download files: ' + err);
  });
});

app.listen(1234);
