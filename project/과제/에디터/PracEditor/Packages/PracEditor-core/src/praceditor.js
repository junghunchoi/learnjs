var GlobalEditorObject = {
  font: "",
  color: "black",
  fontSize: "16px",
  isitalic: false,
  isbold: false,
  isunderline: false,
};

function PracEditor() {
  function createEditor() {
    var mainArea = document.createElement("div");
    mainArea.className = "mainArea";
    mainArea.style.margin = "50px";
    mainArea.style.width = "600px";

    var toolbarArea = document.createElement("div");
    toolbarArea.className = "d-flex flex-row bd-highlight";
    mainArea.appendChild(toolbarArea);

    var dropdowns = fontModule.appendDropbox();
    for (var i = 0; i < dropdowns.length; i++) {
      toolbarArea.appendChild(dropdowns[i]);
    }

    var btns = btnModule.appendBtn();
    for (var j = 0; j < btns.length; j++) {
      toolbarArea.appendChild(btns[j]);
    }

    var editorArea = document.createElement("div");
    var ptag = document.createElement("p");
    var brtag = document.createElement("br");
    editorArea.className = "editorArea";
    editorArea.style.height = "500px";
    editorArea.contentEditable = "true";
    ptag.appendChild(brtag);
    mainArea.appendChild(editorArea);
    editorArea.appendChild(ptag);
    editorArea.addEventListener("input", handleEvent);
    editorArea.addEventListener("click", handleEvent);
    editorArea.addEventListener("mousedown", handleEvent);
    editorArea.addEventListener("mousemove", handleEvent);
    editorArea.addEventListener("mouseup", handleEvent);
    editorArea.addEventListener("change",function(event){

    })
    
    var $previewButton = document.createElement("button");
    var $preview = document.createElement("div");
    $previewButton.style.width="50px"
    $previewButton.style.height="50px"
    $previewButton.textContent = "미리보기"
    $previewButton.addEventListener("click",function(){
      $preview.innerHTML = editorArea.innerHTML
    })

    mainArea.appendChild($previewButton)
    mainArea.appendChild($preview)
    



    return mainArea;
  }

  document.body.appendChild(createEditor());

  var isDragging = false;

  function handleEvent(event) {
    switch (event.type) {
      case "click":
        selectionModule.checkSelection(event);
        break;
      case "input":
        break;
      case "mousedown":
        isDragging = true;
        break;
      case "mousemove":
        if (isDragging) {
        }
        break;
      case "mouseup":
        if (isDragging) {
          isDragging = false;
        }
        break;
      default:
    }
  }
}

PracEditor();

function updateGlobalEditorObject(updates) {
  for (var key in updates) {
    if (updates.hasOwnProperty(key) && updates[key] !== undefined) {
      GlobalEditorObject[key] = updates[key];
    }
  }
}

function updateToolbar() {
  var $fontDropdown = document.getElementById("fontDropdown");
  var $fontsizeDropdown = document.getElementById("fontSizeDropdown");
  var $colorDropdown = document.getElementById("colorDropdown");
  var $italicButton = document.getElementById("italicButton");
  var $underlineButton = document.getElementById("underlineButton");
  var $boldButton = document.getElementById("boldButton");

  for (var prop in GlobalEditorObject) {
    
    switch (prop) {
      case "font":
        var index = findSelectIndex(GlobalEditorObject[prop], prop);
        $fontDropdown.options[index].selected = true;
        break;
      case "color":
        var index = findSelectIndex(GlobalEditorObject[prop], prop);
        if(GlobalEditorObject[prop]==='rgb(34, 34, 34)') index = 0
        $colorDropdown.options[index].selected = true;//textContent = convertRGBtoColorName(GlobalEditorObject[prop]);
        $colorDropdown.style.color = GlobalEditorObject[prop];
        break;
      case "fontSize":
        var index = findSelectIndex(GlobalEditorObject[prop], prop);
        $fontsizeDropdown.options[index].selected = true;
        break;
      case "isitalic":
        if (GlobalEditorObject[prop]) {
          $italicButton.isClicked = true;
          $italicButton.classList.add("btn-secondary");
          $italicButton.classList.remove("btn-light");
        } else {
          $italicButton.isClicked = false;
          $italicButton.classList.add("btn-light");
          $italicButton.classList.remove("btn-secondary");
        }
        break;
      case "isbold":
        if (GlobalEditorObject[prop]) {
          $boldButton.isClicked = true;
          $boldButton.classList.add("btn-secondary");
          $boldButton.classList.remove("btn-light");
        } else {
          $boldButton.isClicked = false;
          $boldButton.classList.add("btn-light");
          $boldButton.classList.remove("btn-secondary");
        }
        break;
      case "isunderline":
        if (GlobalEditorObject[prop]) {
          $underlineButton.isClicked = true;
          $underlineButton.classList.add("btn-secondary");
          $underlineButton.classList.remove("btn-light");
        } else {
          $underlineButton.isClicked = false;
          $underlineButton.classList.add("btn-light");
          $underlineButton.classList.remove("btn-secondary");
        }
        break;
      default:
        break;
    }
  }
}

function updateComponentCSS(cssObject, node) {
  for (var prop in cssObject) {
    switch (prop) {
      case "font":
        node.style.fontFamily = cssObject[prop];
        break;
      case "color":
        node.style.color = cssObject[prop];
        break;
      case "fontSize":
        node.style.fontSize = cssObject[prop];
        break;
      case "isitalic":
        node.style.fontStyle = cssObject[prop] ? "italic" : "normal";
        break;
      case "isbold":
        node.style.fontWeight = cssObject[prop] ? "bold" : "normal";
        break;
      case "isunderline":
        node.style.textDecoration = cssObject[prop] ? "underline" : "none";
        break;
      default:
        break;
    }
  }
}

function convertRGBtoColorName(rgb) {
  var colorName = "";
  var colorList = {
    black: {
      r: 0,
      g: 0,
      b: 0,
    },
    blue: {
      r: 0,
      g: 0,
      b: 255,
    },
    green: {
      r: 0,
      g: 128,
      b: 0,
    },
    yellow: {
      r: 255,
      g: 255,
      b: 0,
    },
    purple: {
      r: 128,
      g: 0,
      b: 128,
    },
    orange: {
      r: 255,
      g: 165,
      b: 0,
    },
    cyan: {
      r: 0,
      g: 255,
      b: 255,
    },
    magenta: {
      r: 255,
      g: 0,
      b: 255,
    },
    lime: {
      r: 0,
      g: 255,
      b: 0,
    }
  };
  if (/\d/.test(rgb)) {
    var numbers = rgb.match(/\d+/g).map(Number);
    var rgbObject = {
      r: numbers[0],
      g: numbers[1],
      b: numbers[2],
    };

    for (var colornode in colorList) {
      var tempColor = colorList[colornode];
      if (
        tempColor.r === rgbObject.r &&
        tempColor.g === rgbObject.g &&
        tempColor.b === rgbObject.b
      ) {
        return colornode;
      }
    }
  }
  return rgb;
}

function findSelectIndex(value, type) { // rgb 값으로 날라와 
  var $select = document.getElementById(type + "Dropdown");
  var options = $select.options;
  var convertValue =  value.replace(/"/g, ''); // 여기선 
  var index = -1;
  for (let i = 0; i < options.length; i++) {
    if (options[i].textContent === convertValue) {
      index = i;
      return index;
    }
  }
}
