// const express = require("express");
// const app = express();
// const multer = require("multer");
// const fs = require("fs");
//
// app.listen(3000, () => {
//   const dir = "./uploads";
//   if(!fs.existsSync(dir)) {
//     fs.mkdirSync(dir);
//   }
//   console.log("서버 실행");
// });
//
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now())
//   }
// });
//
// const upload = multer({ storage: storage })

const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// multer 설정
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));  // 정적 파일을 제공하기 위한 미들웨어

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/test.html');
});

app.post('/upload', upload.single('file'), (req, res) => {
  res.send('File uploaded!');
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});