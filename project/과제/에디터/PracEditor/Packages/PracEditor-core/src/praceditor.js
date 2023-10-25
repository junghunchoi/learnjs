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

    return mainArea;
  }

  document.body.appendChild(createEditor());

  let isDragging = false;

  function handleEvent(event) {
    switch (event.type) {
      case "click":
        selectionModule.checkSelection(event);
        break;
      case "input":
        // selectionModule.handleKeyboardInput(event);
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
          GlobalEditorObject[prop] === "system-ui"
            ? "기본"
            : GlobalEditorObject[prop].replace(`"`, "").replace(`"`, "");
        break;
      case "fontColor":
        $fontColorDropdown.innerHTML = GlobalEditorObject[prop];
        $fontColorDropdown.style.backgroundColor = GlobalEditorObject[prop];
        break;
      case "fontSize":
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
  for (const prop in cssObject) {
    switch (prop) {
      case "font":
        node.style.fontFamily = cssObject[prop];
        break;
      case "fontColor":
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

// function combineHangul(base, add) {
//   const CHO = [
//       'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
//   ];
//   const JUNG = [
//       'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'
//   ];
//   const JONG = [
//       '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
//   ];

//   const BASE_CODE = 44032; // '가'의 유니코드
//   const CHO_LENGTH = CHO.length;
//   const JUNG_LENGTH = JUNG.length;
//   const JONG_LENGTH = JONG.length;

//   const charCode = base.charCodeAt(0) - BASE_CODE;
//   const choIndex = Math.floor(charCode / (JUNG_LENGTH * JONG_LENGTH));
//   const jungIndex = Math.floor((charCode - (choIndex * JUNG_LENGTH * JONG_LENGTH)) / JONG_LENGTH);

//   const newCharCode = BASE_CODE + (choIndex * JUNG_LENGTH * JONG_LENGTH) + (jungIndex * JONG_LENGTH) + JONG.indexOf(add);

//   return String.fromCharCode(newCharCode);
// }
