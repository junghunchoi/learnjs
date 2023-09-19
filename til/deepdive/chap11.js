// const 키워드를 사용해 선언한 변수는 재할당이 금지된다. 상수는 재할당이 금지된 변수일 뿐이다.
const o = {};

// const 키워드를 사용해 선언한 변수에 하당한 원시 값은 변경할 수 없다.
// 하지만 const키워드를 사용해 선어한 변수에 할당한 객체는 변경할 수 있다.
o.a = 1;
console.log(o); // {a:1}
// -> 원시 값은 변경이 불가능한 읽기 전용 값으로 데이터의 신뢰성을 보장한다.

//-------

let score = 80;
let copy = score;

console.log(score);
console.log(copy); // 처음 설정된 80이 들어갈뿐이다.

score = 100

console.log(score);
console.log(copy);
//----

let score = 80;
let copy = score; // score의 변수 값 80이 복사되어 할당된다.
console.log(score, copy) // 80 80
console.log(score === copy) // true

score = 100
console.log(score, copy) // 100 80
console.log(score === copy) // false

// 따라서 score의 값이 변경이 copy 변수의 값 변경에 어떠한 영향도 주지 않는다.

//----
//얕은 복사 : 객체의 한단계 프로퍼티만 복사
//깉은 복사 : 객체에 중첩되어있는 객체까지 모두 복사
const o = {x:{y: 1}};
const c1 = {...o}; // 스프레드 문법 , 얕은 복사
console.log(c1 === o); // false
console.log(c1.x === o.x); // true

//lodash의 clonedeep을 사용한 깊은 복사
const _ = require('lodash');
const c2 = _.cloneDeep(o); // 깊은 복사
console.log(c2 === 0); // false
console.log(c2.x === o.x); // false -> 얕은 복사는 중첩된 객체의 참조 값을 복사하고 깊은 복사는 완전히 새로운 객체를 만들어 복사본을 만든다.


//------
const v = 1;

// 원시값을 다른 변수에 할당하는 것을 깊은 복사
const v1 = v;
console.log(c1 === v); // true

const o = {x: 1}

//객체를 할당한 변수를 다른 변수에 할당하는 것을 얕은 복사
const c2 = o;
console.log(c2 === o); // true

//----
//여러개의 식별자가 하나의 객체를 공유할 수 있다는 것이 무엇을 의미하는지 어떤 부작용이 발생할까

var person = {
    name: 'Lee'
};

// 참조 값을 복사(얕은 복사)
var copy = person; // -> 원본 또는 사본 중 한쪽을 변경하면 서로 영향을 받는다.

//copy와 person은 동일한 객체를 참조한다.
console.log(copy === person); // true

copy.name = 'Kim';
person.address = 'Seoul';

console.log(person); //{name : 'Kim', address : 'Seoul'}
console.log(copy);   //{name : 'Kim', address : 'Seoul'}

//!! 정리
//"값에 의한 전달" 또는 "참조에 의한 전달은" 메모리가 저장되어 있는 값을 복사해서 전달하는면에선 동일하다.
//다만 변수에 저장되어 있는 값이 원시값이냐 참조값이냐의 차이만 있다. 따라서 "참조에 의한 전달은 존재하지 않고 값에 의한 전달만 존재한다."
//하지만 자바스크립트에선 다른 프로그래밍언어와 달리 포인터가 없기 때문에 "?에 의한 전달"의 의미와 정확히 일치하진 않기에 주의가 필요하다.