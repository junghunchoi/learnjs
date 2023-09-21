//프로토타입

//1) 자바스크립트는 프로토타입을 기반으로 상속을 구현하여 중복을 제거한다.
function Circle(radius) {
    this.radius = radius;
    this.getArea = function () {
        return Math.PI * this.radius ** 2;
    };
}

const circle1 = new Circle(1);
const circle2 = new Circle(2);

//객체별로 인스턴스를 따로 만들어 객체별로 소유한다.
//만약 10개의 인스턴스를 생성하면 동일한 메서드 10개 생성한다.
console.log(circle1.getArea() === circle2.getArea()) //false

//!! 이제 프로토타입을 기반으로 상속을 구현한다.
function Circle1(radius) {
    this.radius = radius;
}

Circle1.prototype.getArea = function () {
    return Math.PI * this.radius ** 2;
};

const circle3 = new Circle1(1);
const circle4 = new Circle1(2);

console.log(circle3.getArea === circle4.getArea) //true


// 2) 프로토타입 객체
// 프로토타입은 부모의 역할을 하는 개체로서 다른 객체에 공유 프로퍼티(메서드포함)를 제공한다.

const obj = {};
const parent = {x: 1};

//setter 함수인 __proto__ 호출되어 obj 객체의 프로토타입을 교체
obj.__proto__ = parent;

console.log(obj.x); // 1 -> 부모의 프로퍼티를 가져왔다.

const person ={name: 'lee'}

//person 객체는 __proto__ 프로퍼티를 소유하지않는다.
console.log(person.hasOwnProperty('__proto__')); // false

// __proto__ 프로퍼티는 모든 객체의 프로토타입 객체인 Object.prototype의 접근자 프로퍼티이다.
console.log(Object.getOwnPropertyDescriptor(Object.prototype, '__proto__'));

// 모든 객체는 Object.prototype의 접근자 프로퍼티 __proto__를 상속받아 사용할 수 있다.
console.log({}.__proto__ === Object.prototype); // true

// 3) 오버라이딩과 프로퍼티 섀도잉
// 프로토타입 프로퍼티와 같은 이름의 프로퍼티를 인스턴에서 추가하면 프로토타입의 프로퍼티를 인스턴스 프로퍼티에 추가한다.
// 인스턴스 메서드 sayHello는 프로퍼티 메소드 sayHello를 오버라이딩 했고
// 이러한 상속관계에 의해 프로퍼티가 가려지는 현상을 프로퍼티 섀도잉이라고 한다.
const Person = (function(){
        function Person(name) {
            this.name = name;
        }
        Person.prototype.sayHello = function (){
            console.log(`Hi! My name is ${this.name}`);
        }
        return Person;
    }());

const me = new Person('Lee');

me.sayHello = function () {
    console.log(`Hi! My name is ${this.name}`);
};

me.sayHello(); // Hi! My name is Lee
