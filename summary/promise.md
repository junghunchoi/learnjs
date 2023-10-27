<h2>프로미스 반환하기</h2>
핸들러가 프로미스를 반환하는 경우가 있다.
이때, 이어지는 핸들러가 기다리다 처리가 완료되면 결과를 받는다.


```javascript
new Promise(function(resolve, reject) {

  setTimeout(() => resolve(1), 1000);

}).then(function(result) {

  console.log(result); // 1

  return new Promise((resolve, reject) => { // (*)
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) { // (**)

  console.log(result); // 2 1초후에 실행됨.

  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(result * 2), 1000);
  });

}).then(function(result) {

  console.log(result); // 4 2초후에 실행됨.

});
```
</br>

---
1. 프로미스 체이닝 연산자
2. 에러처리방법
3. await,async
4. 