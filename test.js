function Editor(){
    this.setting = ""
}

Editor.prototype.make = function(){
    console.log("화면 만들 함수를 프로토타입을 통해 추가한다.")
}

var objectEdi = new Editor()
var objectEdi2 = new Editor()
objectEdi.setting = "수정한 setting"

objectEdi.make()

console.log(objectEdi.setting);
console.log(objectEdi2.setting);

