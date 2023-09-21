// 프로퍼티 어트리뷰트

/*
자바스크립트는 모든 객체(프로퍼티)를 생성할 때 Prototype이라는 내부 슬롯을 갖는다.
이때 자바스크립트 엔진은 프로퍼티를 생성할 때 프로퍼티의 상태를 나타내는 프로퍼티 어트리뷰트를 기본값으로 자동 정의한다.
 */

const person = {
    name : "Lee"
};

// 프로퍼티 동적 생성
person.age = 20;

// 모든 프로퍼티의 프로퍼티 어트리뷰트 정보를 제공하는 프로퍼티 디스크립터 객체들을 반환한다.
// 프로퍼티 디스크립터 -> 아래와 같이 value를 포함한 모든 프로퍼티를 확인할 수 있는 메소드인듯.
console.log(Object.getOwnPropertyDescriptors(person));

// 출력
// {
//     name : {value: "Lee", writable : true, enumerable: true, configurable : true},
//     age : {value: "Lee", writable : true, enumerable: true, configurable : true}
// }

//------
// 아래의 메소드를 통해 프로퍼티 또는 value를 변경할 수 있다.

const person1 = {};

Object.defineProperty(person1, 'firstName',{
    value : 'junghun',
    writable : true,
    enumerable : true,
    configurable: true
})

Object.defineProperty(person1, 'lastName', {
    value: 'choi'
})

let descriptor = Object.getOwnPropertyDescriptor(person1, 'firstName');
console.log(descriptor) //{value: 'junghun',    writable: true,    enumerable: true,    configurable: true}

// 디스크립터 객체의 프로퍼티를 누락시키면 undifined, false가 기본값이다.
descriptor = Object.getOwnPropertyDescriptor(person1,'lastName')
console.log(descriptor) // {value: 'choi',    writable: false,    enumerable: false,    configurable: false}

//enumarable 의 값이 false인 경우
//해당 프로퍼티는 for, Object.keys 등으로 열거할 수 없다.
console.log(Object.keys(person1)) // [ 'firstName' ]

//Writable의 값이 false인 경우 해당 퍼리퍼티 값의 value를 변경할 수 없다.
//만약 변경해도 에러는 발생하지 않고 무시된다.
person1.lastName='kim'
console.log(person1.lastName); // choi

//Configurable 의 값이 false인 경우 해당 프로퍼티를 삭제할 수 없다.
//아래와 같이 삭제하여도 에러는 발생되지 않고 무시한다.
delete person1.lastName;

// 접근자 프로퍼티 정의
Object.defineProperty(person1, 'fullName',{
    get(){
        return `${this.firstName} ${this.lastName}`
    },
    set(name){
        [this.firstName, this.lastName] = name.split(' ');
    },
    enumerable:true,
    configurable:true

})

descriptor = Object.getOwnPropertyDescriptor(person1, 'fullName');
console.log('fullName', descriptor) // fullName {get: [Function: get],set: [Function: set],enumerable: true,    configurable: true}


//-------
// 객체 변경 방지 메서드들은 객체의 변경을 금지하는 정도가 다르기 때문에 필요에 따라 사용해야한다.
//Object.perventExtesions -> seal -> freeze 정도로 강도가 쌔다