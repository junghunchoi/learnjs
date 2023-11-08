function findAndSaveUser(Users) {
  Users.findOne({})
  .then((user) => {
    user.name = 'zero';
    return user.save();
  })
  .then((user) => {
    return Users.findOne({ gender: 'm' });
  })
  .then((user) => {
    // 생략
  })
  .catch(err => {
    console.error(err);
  });
}

/*
프로미스를 통해 콜백 지옥에서 벗어나 코드를 줄일 수 있다.
하지만 then , catch가 길어지면 여전히 지저분한건 마찬가지이다.
따라서 async, await을 통해 더 간결하게 정리할 수 있다.
 */

async function findAndSaveUser(Users){
  let user = await Users.findOne({});
  user.name = 'zero'
  user = await user.save();
  user = await User.findOne({gender : 'M'})
}

/*
만약 에러처리가 필요하다면 아래와 같이 정리가 가능하다
 */

async function findAndSaveUser(Users) {
  try {
    let user = await Users.findOne({});
    user.name = 'zero';
    user = await user.save();
    user = await Users.findOne({ gender: 'm' });
    // 생략
  } catch (error) {
    console.error(error);
  }
}

/*
아래와 같이 화살표 함수를 사용할 수 있다.
 */
const findAndSaveUser = async (Users) => {
  try {
    let user = await Users.findOne({});
    user.name = 'zero';
    user = await user.save();
    user = await Users.findOne({ gender: 'm' });
    // 생략
  } catch (error) {
    console.error(error);
  }
};

//////////////////////////////////////////////////
//FormData
const formData = new FormData();
formData.append('name','junghun')
console.log(formData)
formData.append('item', 'orange');
formData.append('item', 'melon');
console.log(formData)
formData.set('item', 'apple'); // 기존 데이터 밀어버리고 value로 업데이트