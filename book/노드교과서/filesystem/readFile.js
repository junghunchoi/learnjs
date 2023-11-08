const fs = require('fs')

// fs.readFile('./readme.txt')
// .then((data)=>{
// console.log(data);
// console.log(data.toString())
// }).catch((err)=>{
// console.log(err)
// })
//
// fs.writeFile('./writeme.txt', '글이 입력됩니다', (err) => {
//   if (err) {
//     throw err;
//   }
//   fs.readFile('./writeme.txt', (err, data) => {
//     if (err) {
//       throw err;
//     }
//     console.log(data.toString());
//   });
// });

// 비동기로 파일을 읽을 때 어떤식으로 처리될까
console.log('시작');
fs.readFile('./readme2.txt', (err, data) => {
  if (err) {
    throw err;
  }
  console.log('1번', data.toString());
});
fs.readFile('./readme2.txt', (err, data) => {
  if (err) {
    throw err;
  }
  console.log('2번', data.toString());
});
fs.readFile('./readme2.txt', (err, data) => {
  if (err) {
    throw err;
  }
  console.log('3번', data.toString());
});
console.log('끝');

// 순서대로 하기 위해선 동기 메소드를 바꾸거나 코딩 스타일을 바꿔야한다.
console.log('시작');
let data = fs.readFileSync('./readme2.txt');
console.log('1번', data.toString());
data = fs.readFileSync('./readme2.txt');
console.log('2번', data.toString());
data = fs.readFileSync('./readme2.txt');
console.log('3번', data.toString());
console.log('끝');
