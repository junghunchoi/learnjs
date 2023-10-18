# 프로포토타입(Prototype) 




객체내부에 `[[Prototype]]`이라는 숨김 프로퍼티를 생성하여 이를 통해 상속을 구현한다.





```JavaScript
let animal = {
  eats: true
};
let rabbit = {
  jumps: true
};

rabbit.__proto__ = animal;
```

> 빛이 있으라.
