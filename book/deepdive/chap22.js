//this

const circle = {
    // 프로퍼티 : 객체 고유의 상태 데이터
    radius : 5,
    // 메서드 : 상태 데이터를 참조하고 조작하는 동작
    getDiameter() {
        // 객체 리터럴 방식으로 생성한 객체의 경우 자신이 속한 객체를 가르키는
        // 식별자를 참조할 수 있다.
        return 2 * circle.radius;
    }
}

// 아래와 같이 생성자 함수 방식으로 인스턴스를 생성하는 경우를 생각해보자

function Circle(radius) {
    // 이 시점에서는 생성자 함수 자신이 생성할 인스턴스를 가르키는 식별자를 알 수 없다.
    ???.radius = radius;
}

Circle.prototype.radius.getDiameter() = function () {
    // 이 시점에는 생성자 함수 자신이 생성할 인스턴스를 가리키는 식별자를 알 수 없다.
    return 2*???.radius;
};

// 생성자 함수로 인스턴스를 생성하려면 먼저 생성자 함수를 정의 해야한다.
const circle = new Circle(5);

//!!
//this는 자신이 속한 객체 또는 자신이 생성할 인스턴스를 가리키는 자기 참조 변수이다.
//지역변수처럼 사용할 수 있지만, this 바인딩은 함수 호출 방식에 의해 동적으로 결정된다.


//---------------------------------

// this 바인딩은 함수 호출 방식, 즉 함수가 어떻게 호출되었지에 따라 동적으로 결정된다.

/*
함수를 호출하는 방식은 아래와 같다.
1. 일반 함수 호출
2. 메서드 호출 - get 메소드를 통해 할당.
3. 생성자 함수 호출 - 파라미터로 넘어온 값을 할당.
4. Function.prototype.apply/call/bind 메서드에 의한 간접 호출
 */

// this 바인딩은 함수 호출 방식에 따라 동적으로 결정된다.
const foo = function () {
    console.dir(this);
};

//1. 일반 함수 호출
//foo 함수를 일반적인 방식으로 호출
//foo 함수 내부의 this는 전역 객체 window를 가리킨다.
foo(); // window

//2. 메서드 호출
//foo 함수를 프로퍼티 값으로 할당하여 호출
// foo 함수 내부의 this는 메서드를 호출한 객체 obj를 가르킨다.

const obj = {foo};
obj.foo(); // obj

//3. 생성자 함수 호출
//foo 함수를 new 연산자와 함께 생성자 함수로 호출
//foo 함수 내부의 this는 생성자 함수가 생성한 인스턴스를 가르킨다.
new foo(); // foo{}

//4. Function.prototype.apply/call/bind 메서드에 의한 간접 호출
//foo 함수 내부의 this는 인수에 의해 결정된다.
const bar = {name: 'bar'};

foo.call(bar); // bar
foo.apply(bar) // bar
foo.bind(bar)();// bar

//---------
// 매서드 내에서 정의된 중첩 함수도 일반 함수로 호출되면
//this에는 전역변수가 할당된다.

let value = 1;

const obj = {
    value :100,
    foo() {
        console.log("foo's this : " + this); // {value:100, foo: f}
        console.log("foo's this.value : " + this.value); // 100

        function bar() {
            console.log("bar's this : " + this); // window
            console.log("bar's this.value : " + this.value); // 1
        }

        //메서드 내에서 정의한 중첩 함수도 일반 함수로 호출되면 중첩 함수 내부의 this에는
        //전역 객체가 바인딩된다.
        bar();
    }
}
obj.foo();

// 위와 같은 원리로 콜백 함수가 일반 함수로 호출된다면
// 콜백 함수 내부의 this에도 전역객체가 할당된다.

//! 메서드 내부의 중첩 함수나 콜백 함수의 this 바인딩을 메서드의 this 바인딩과
//일치시키기 위한 방법은 아래와 같다.

//첫번째 방법 - 변수에 할당
let value2 = 1;
const obj2={
    value : 100,
    foo2() {
        //this 바인딩을 변수 that에 할당한다.
        const that = this;

        // 콜백 함수 내부에서 this 대신 that을 참조한다.
        setTimeout(function () {
            console.log(that.value);// 100
        },100)
    }
}

//두번째 방법 - bind() 사용
const obj3={
    value : 100,
    foo2() {

        setTimeout(function () {
            console.log(this.value);// 100
        }.bind(this), 100)
    }
}

//세번째 방법 - 화살표 함수 사용
const obj4={
    value : 100,
    foo2() {

        setTimeout(() => console.log(this.value), 100);
    }
}