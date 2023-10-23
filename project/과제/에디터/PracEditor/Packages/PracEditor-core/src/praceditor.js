function PracEditor() {
  var PracEditor = {
    font: "",
    fontColor: "",
    fontSize: "",
    isItalic: false,
    isBold: false,
    isUnderline: false,
  };

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

    return mainArea;
  }

  document.body.appendChild(createEditor());
  // ExternalModule.publicFunction();

  // var addEvent = function (component) {};

  // var $editorarea = document.querySelector(".editorarea")
}

PracEditor();
