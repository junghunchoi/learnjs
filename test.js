var colorList ={
    black: {
      r: 0,
      g: 0,
      b: 0
    },
    blue: {
      r: 0,
      g: 0,
      b: 255
    },
    green: {
      r: 0,
      g: 128,
      b: 0
    },
    yellow: {
      r: 255,
      g: 255,
      b: 0
    },
    purple: {
      r: 128,
      g: 0,
      b: 128
    },
    orange: {
      r: 255,
      g: 165,
      b: 0
    },
    cyan: {
      r: 0,
      g: 255,
      b: 255
    },
    magenta: {
      r: 255,
      g: 0,
      b: 255
    },
    lime: {
      r: 0,
      g: 255,
      b: 0
    }
  }
  var obj ={
    r:0,g:255,b:0
  }
// console.log(obj.g);
for (let color in colorList) {
    let rgb = colorList[color];
    console.log(`Color: ${color}, R: ${rgb.r}, G: ${rgb.g}, B: ${rgb.b}`);
}