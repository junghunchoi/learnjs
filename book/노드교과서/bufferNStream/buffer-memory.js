const fs = require('fs')

// console.log('before:',process.memoryUsage().rss)
//
// const data1 = fs.readFileSync('./big.txt')
// fs.writeFileSync('./big2.txt',data1);
// console.log('buffer:',process.memoryUsage().rss)
/*
before:  18137088
buffer: 1019133952
메모리가 폭증한 이유는 1기가의 파일을 복사하기위해 메모리위에 파일을
모두 올렸기 때문이다.
 */

// 이제 스트림을 이용해 복사하겟다.

console.log('before: ', process.memoryUsage().rss);

const readStream = fs.createReadStream('./big.txt');
const writeStream = fs.createWriteStream('./big3.txt');
readStream.pipe(writeStream);
readStream.on('end', () => {
  console.log('stream: ', process.memoryUsage().rss);
});

/*
before:  37822464
stream:  67940352

메모리를 62mb만 썻다. 이는 파일을 조각내어 작은 버퍼 단위로 옮겼기 대문이다.
이렇게 시트림을 이용하면 효과저긍로 데이터를 전송할 수 있다.
 */