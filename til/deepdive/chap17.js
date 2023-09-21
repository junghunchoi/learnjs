// 생성자 함수에 의한 객체 생성

//1) 빈 객체를 생성해 프로퍼티 또는 메서드를 추가하여 객체를 완성할 수 있다.
const person = new Object();

person.name = 'choi';
person.sayHello = function () {
    console.log('Hi my name is ' + this.name);
};

console.log(person); // { name: 'choi', sayHello: [Function (anonymous)] }
person.sayHello(); //Hi my name is choi

// 하지만 이러한 방법은 좋지 않다. 객체 리터럴을 사용해 생성하는 것이 더 간편하기 때문이다.

//-----
// 2) 객체 리터럴에 의한 객체 생성 방식의 문제점
const circle = {
    radius : 5,
    getDiameter() {
        return 2 * this.radius;
    }
}

const circle2 = {
    radius : 10,
    getDiameter() {
        return 2 * this.radius;
    }
}

// 위와 같이 프로퍼티 구조가 동일 함에도 매번 같은 프로퍼티나 메서드를 기술해야한다.
// 만들어야하는 객체가 무수히 많아질 경우 문제가 크다.

// 3) 생성자 함수에 의한 객체 생성 방식의 장점
function Circle(radius) {
    this.radius = radius;
    this.getDiameter = function () {
        return 2 * this.radius;
    };
}

// 인스턴스 생성
// new 연산자와 함께 호출하면 해당 함수는 생성자 함수로 동작한다.
const circle1 = new Circle(5);
const circle2 = new Circle(10);

console.log(circle1.getDiameter()); // 10
console.log(circle2.getDiameter()); // 20
