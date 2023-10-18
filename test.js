let animal = {
    eats: true
  };
  
  // 프로토타입이 animal인 새로운 객체를 생성합니다.
  let rabbit = Object.create(animal);
  
  console.log(rabbit.eats); // true
  
  console.log(Object.getPrototypeOf(rabbit) === animal); // true
  
  Object.setPrototypeOf(rabbit, {}); // rabbit의 프로토타입을 {}으로 바꿉니다.