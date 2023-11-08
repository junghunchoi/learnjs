const fs = require('fs')

// 1. read
const readStream = fs.createReadStream('./readme3.txt', {highWaterMark: 16});//highWaterMark 는 한번에 얼마나 보낼지 정하는 값 default는 64kb
const data = [];

readStream.on('data', (chunk) => {
  data.push(chunk)
  console.log('data: ', chunk, chunk.length)
  console.log(chunk.toString())
})

readStream.on('end', () => {
  console.log('end :', Buffer.concat(data).toString());
});

readStream.on('error', (err) => {
  console.log('error :', err);
});

//2. write
const writeStream = fs.createWriteStream(('./wtireme2.txt'));
writeStream.on('finish', () => {
  console.log("파일쓰기완료")
})

writeStream.write('이 글을 씁니다.');
writeStream.write('한 번 더 씁니다.');
writeStream.end();

