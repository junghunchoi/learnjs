let i = 0;

let start = Date.now();

function count() {

  // 스케줄링 코드를 함수 앞부분으로 옮김
  if (i < 1e9 - 1e6) {
    setTimeout(count); // 새로운 호출을 스케줄링함
  }

  do {
    i++;
  } while (i % 1e6 != 0);

  if (i == 1e9) {
    console.log("처리에 걸린 시간: " + (Date.now() - start) + "ms");
  }

}

count();