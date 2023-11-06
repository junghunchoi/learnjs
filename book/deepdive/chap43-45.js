// XMLHttpRequest
// HTTP요청과 응답 수신을 위한 객체이다.

//open() 을 사용하여 요청을 초기화한 뒤 호출
//send() 을 사용하면 요청의 종류에 따라 달리 사용할 수 있다.

// GET 예제
var xhr = new XMLHttpRequest();
xhr.open('GET', 'http://example.com/api', true);
xhr.onreadystatechange = function() {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('There was a problem with the request.');
    }
  }
};
xhr.send();

//POST 예제
var xhr = new XMLHttpRequest();
xhr.open('POST', 'http://example.com/api', true);
xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
xhr.onreadystatechange = function() {
  if (xhr.readyState === XMLHttpRequest.DONE) {
    if (xhr.status === 200) {
      console.log(xhr.responseText);
    } else {
      console.error('There was a problem with the request.');
    }
  }
};
xhr.send('key1=value1&key2=value2');