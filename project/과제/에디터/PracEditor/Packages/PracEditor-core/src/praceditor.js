var PracEditorApp = (function () {

  function updateGlobalEditorObject(updates) {
    for (var key in updates) {
      if (updates.hasOwnProperty(key) && updates[key] !== undefined) {
        GlobalEditorObject[key] = updates[key];
      }
    }
  }

  function PracEditor() {
    this.isDragging = false;
    this.createEditor();
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
          var index = PracEditorApp.findSelectIndex(GlobalEditorObject[prop],
              prop);
          $fontDropdown.options[index].selected = true;
          break;
        case "color":
          var index = PracEditorApp.findSelectIndex(GlobalEditorObject[prop],
              prop);
          if (GlobalEditorObject[prop] === "rgb(34, 34, 34)") {
            index = 0;
          }
          $colorDropdown.options[index].selected = true;
          $colorDropdown.style.color = GlobalEditorObject[prop];
          break;
        case "fontSize":
          $fontsizeDropdown.options[PracEditorApp.findSelectIndex(
              GlobalEditorObject[prop], prop)].selected = true;
          break;
        case "isitalic":
          PracEditorApp.updateButtonStyle($italicButton,
              GlobalEditorObject[prop]);
          break;
        case "isbold":
          PracEditorApp.updateButtonStyle($boldButton,
              GlobalEditorObject[prop]);
          break;
        case "isunderline":
          PracEditorApp.updateButtonStyle($underlineButton,
              GlobalEditorObject[prop]);
          break;
        default:
          break;
      }
    }
  }

  PracEditor.prototype.createEditor = function () {
    var $mainArea = document.getElementsByClassName("mainArea")[0];

    if ($mainArea === undefined) {
      throw new Error('화면에 클래스명이 "mainArea"인 div가 필요합니다.')
    }
    var toolbarArea = document.createElement("div");
    toolbarArea.className = "d-flex flex-row bd-highlight";
    $mainArea.appendChild(toolbarArea);

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
    $mainArea.appendChild(editorArea);
    editorArea.appendChild(ptag);
    editorArea.addEventListener("input", handleEvent);
    editorArea.addEventListener("click", handleEvent);
    editorArea.addEventListener("mousedown", handleEvent);
    editorArea.addEventListener("mousemove", handleEvent);
    editorArea.addEventListener("mouseup", handleEvent);

    var $previewButton = document.createElement("button");
    var $preview = document.createElement("div");
    $previewButton.style.width = "50px";
    $previewButton.style.height = "50px";
    $previewButton.textContent = "미리보기";
    $previewButton.addEventListener("click", function () {
      var options = "toolbar=no,scrollbars=no,resizable=yes,status=no,menubar=no,width=1200, height=800, top=0,left=0"
      var openWin = window.open("preview.html", "preview","width=570, height=570");
      openWin.onload = function () {
        openWin.document.getElementById("previewArea").innerHTML = getHTML();
      }

      // $preview.innerHTML = editorArea.innerHTML;

    });

    $mainArea.appendChild($previewButton);
    $mainArea.appendChild($preview);

  }

  function updateButtonStyle(button, condition) {
    if (condition) {
      button.isClicked = true;
      button.classList.add("btn-secondary");
      button.classList.remove("btn-light");
    } else {
      button.isClicked = false;
      button.classList.add("btn-light");
      button.classList.remove("btn-secondary");
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
    var colorList = {
      black: {r: 0, g: 0, b: 0},
      blue: {r: 0, g: 0, b: 255},
      green: {r: 0, g: 128, b: 0},
      yellow: {r: 255, g: 255, b: 0},
      purple: {r: 128, g: 0, b: 128},
      orange: {r: 255, g: 165, b: 0},
      cyan: {r: 0, g: 255, b: 255},
      magenta: {r: 255, g: 0, b: 255},
      lime: {r: 0, g: 255, b: 0}
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

  function handleEvent(event) {
    switch (event.type) {
      case "click":
        selectionModule.checkSelection(event);
        break;
      case "mousedown":
        this.isDragging = true;
        break;
      case "mousemove":
        if (this.isDragging) {
        }
        break;
      case "mouseup":
        if (this.isDragging) {
          this.isDragging = false;
        }
        break;
      default:
    }
  }

  function findSelectIndex(value, type) {
    var select = document.getElementById(type + "Dropdown");
    var options = select.options;
    var convertValue = value.replace(/"/g, "");

    for (var i = 0; i < options.length; i++) {
      if (options[i].value === convertValue) {
        return i;
      }
    }
    return 0
  }

  function getHTML() {
    var editorAreaHTML = document.querySelectorAll(".editorArea > *")
    var convertHTML = ""

    for (var i = 0; i < editorAreaHTML.length; i++) {
      if (editorAreaHTML[i].nodeName === 'P') {
        editorAreaHTML[i].style["line-height"] = 1.2;
        editorAreaHTML[i].style["margin-top"] = "0px";
        editorAreaHTML[i].style["margin-bottom"] = "0px";
      }
      convertHTML += editorAreaHTML[i].outerHTML
    }

    console.log(convertHTML)
    return convertHTML;
  }

  return {
    updateGlobalEditorObject: updateGlobalEditorObject,
    PracEditor: PracEditor,
    updateToolbar: updateToolbar,
    updateButtonStyle: updateButtonStyle,
    updateComponentCSS: updateComponentCSS,
    convertRGBtoColorName: convertRGBtoColorName,
    findSelectIndex: findSelectIndex
  };

}());

var editor = new PracEditorApp.PracEditor();

var GlobalEditorObject = {
  font: "",
  color: "black",
  fontSize: "16px",
  isitalic: false,
  isbold: false,
  isunderline: false,
};

