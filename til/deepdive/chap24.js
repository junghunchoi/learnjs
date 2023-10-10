//클로저
//"함수와 그 함수가 선언된 렉시컬 환경과의 조합이다."
//개념 자체가 어렵다. 아래의 예시를 통해 파악하자


// --------
const x = 1;

function outerFunc() {
    const x = 10;
    const inner = function () {
        console.log(x)
    };
    return inner;
}

const innerFunc = outerFunc();
outerFunc();

// innerFun에 outerFunc를 반환하고 생명 주기가 마감한다.
// 따라서 outer 함수의 지역 변수 x는 더 이상 유효하지 않게 된다.
// 하지만 이미 생명 주기가 종료되어 실행 컨테스트 스택에서 제거된 outer함수의
// 지역 변수 x가 다시 부활이라도 한 것처럼 동작하고 있다.
// ! 외부 함수보다 중첩 함수가 더 오래 유지되는 경우 중첩 함수는 이미 생명주기가
// ! 종료한 외부 함수의 변수를 참조할 수 있다. 이러한 중첩 함수를 클로저라고 부른다.

// 위의 결과가 일어나는 이유는 자바스크립트의 모든 함수는 자신의 상위 스코프를 기억하고 있어
// 어디서 호출하든 참조할 수 있으며 바인딩된 값을 변경할 수도 있다.


//-----------------------
// 클로저는 상태가 의도치 않게 변경되지 않도록 안전하게 은닉하고 특정 함수에게만
// 상태 변경을 허용하여 상태를 안전하게 변경하고 유지하기 위해 사용한다.
// 아래의 예시를 보자

//case 1
//외부에 변수가 있을 경우 임의로 할당할 수 있기 때문에 문제가 될 수 있다.
let globalNum = 0;
const increase = function () {

    return globalNum++;
};

//case 2
// 함수안에 변수가 있을 경우 항상 0으로 초기화되기 때문에 이전 상태를 유지하지못한다.
const increase2 = function () {
    let num = 0;
    return num++;
};

//answer
//클로저를 활용하여 변경한다.
const increase = (function () {
    let num = 0;

    return function () {
        return ++num;
    };
}());

console.log(increase()); //1
console.log(increase()); //2
console.log(increase()); //3
