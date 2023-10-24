var GlobalEditorObject = {
  font: "",
  fontColor: "",
  fontSize: "",
  isitalic: false,
  isbold: false,
  isunderline: false,
};

function PracEditor() {
  function createEditor() {
    // 메인 컨테이너
    const mainArea = document.createElement("div");
    mainArea.className = "mainArea";
    mainArea.style.margin = "50px";
    mainArea.style.width = "500px";

    // 툴바 영역
    const toolbarArea = document.createElement("div");
    toolbarArea.className = "d-flex flex-row bd-highlight";
    mainArea.appendChild(toolbarArea);

    // 드롭다운 등록
    for (const dropdown of fontModule.appendDropbox()) {
      toolbarArea.appendChild(dropdown);
    }

    // btn 등록
    for (const btn of btnModule.appendBtn()) {
      toolbarArea.appendChild(btn);
    }

    // 텍스트 영역
    const editorArea = document.createElement("div");
    editorArea.className = "editorArea border";
    editorArea.style.height = "500px";
    editorArea.contentEditable = "true";
    mainArea.appendChild(editorArea);

    editorArea.addEventListener("keydown", handleEvent);
    editorArea.addEventListener("click", handleEvent);
    editorArea.addEventListener("mousedown", handleEvent);
    editorArea.addEventListener("mousemove", handleEvent);
    editorArea.addEventListener("mouseup", handleEvent);

    return mainArea;
  }

  document.body.appendChild(createEditor());

  let isDragging = false;

  function handleEvent(event) {
    switch (event.type) {
      case "click":
        selectionModule.checkSelection(event);
        break;
      case "keydown":
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
  for (let key in updates) {
    if (updates[key] !== undefined) {
      GlobalEditorObject[key] = updates[key];
    }
  }
}

function updateToolbar() {
  var $fontDropdown = document.getElementById("fontDropdown");
  var $fontsizeDropdown = document.getElementById("fontSizeDropdown");
  var $fontColorDropdown = document.getElementById("fontColorDropdown");
  var $italicButton = document.getElementById("italicButton");
  var $underlineButton = document.getElementById("underlineButton");
  var $boldButton = document.getElementById("boldButton");

  for (var prop in GlobalEditorObject) {
    switch (prop) {
      case "font":
        $fontDropdown.innerHTML =
          GlobalEditorObject[prop] === "system-ui" ? "기본" : GlobalEditorObject[prop].replace(`"`,"").replace(`"`,"");
        break;
      case "fontColor":
        $fontColorDropdown.innerHTML = GlobalEditorObject[prop];
        $fontColorDropdown.style.backgroundColor = GlobalEditorObject[prop];
        break;
      case "fontSize":
        console.log(GlobalEditorObject[prop]);
        $fontsizeDropdown.innerHTML = GlobalEditorObject[prop];
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
          $underlineButton.isClicked = true;
          $underlineButton.classList.add("btn-secondary");
          $underlineButton.classList.remove("btn-light");
        } else {
          $underlineButton.isClicked = false;
          $underlineButton.classList.add("btn-light");
          $underlineButton.classList.remove("btn-secondary");
        }
        break;
      case "isunderline":
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
      default:
        break;
    }
  }
}

// function updateComponentCSS(cssObject, node){
//   // console.log(cssObject);
//   // console.log(node.style["font"] ="italic");
//   // console.log(node.style["font"] );
//   for (const prop in cssObject) {
//     if (prop === "font") {
//       node.style.font = "'" + cssObject[prop] + "'";
//     } else if (prop === "fontColor") {
//       node.style.color = cssObject[prop];
//     } else if (prop === "fontSize") {
//       node.style.font = cssObject[prop];
//     } else if (prop === "isitalic") {
//       node.style.font = "italic"
//       node.style.font = cssObject[prop] ? "italic" : "";
//     } else if (prop === "isbold") {
//       node.style.font = cssObject[prop] ? "bold" : "";
//     } else if (prop === "isunderline") {
//       node.style.textDecoration = cssObject[prop] ? "underline" : "";
//     }
//   }
  
//   // console.log(node);
// }

function updateComponentCSS(cssObject, node) {
  for (const prop in cssObject) {
      switch (prop) {
          case "font":
              node.style.font = cssObject[prop];
              break;
          case "fontColor":
              node.style.color = cssObject[prop];
              break;
          case "fontSize":
              node.style.fontSize = cssObject[prop];
              break;
          case "isItalic":
              node.style.fontStyle = cssObject[prop] ? "italic" : "normal";
              break;
          case "isBold":
              node.style.fontWeight = cssObject[prop] ? "bold" : "normal";
              break;
          case "isUnderline":
              node.style.textDecoration = cssObject[prop] ? "underline" : "none";
              break;
      }
  }
}