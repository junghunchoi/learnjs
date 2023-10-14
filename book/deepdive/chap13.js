function foo() {
    console.log('global fuction foo');
}

function bar() {
    function foo() {
        console.log('local fuction foo');
    }
    foo()
}
// 동일한 변수, 함수가 있다면 같은 지역의 것을 먼저 사용한다.
// bar() // local fuction foo

var x = 1;

function foo1() {
    var x = 10;
    bar1();
}

function bar1() {
    console.log(x);
}

foo1(); // 1
bar1(); // 1 -> 외부의 함수가 전역변수를 참조한다면 다른 함수 내부에서 호출이 되어도
//              기존의 값을 사용한다.

// 함수가 호출된 위치는 상위 스코프 결정에 어떠한 영향도 주지 않는다.
// 즉, 함수의 상위 스코프는 언제나 자신이 정의된 스코프이다.
// 함수의 상위 스코프는 함수 정의가 실행 될 때 정적으로 결정된다.