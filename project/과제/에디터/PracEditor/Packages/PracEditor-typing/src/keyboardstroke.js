var keyboardstroke = (function () {
  function insertContent(event) {
    var $editorArea = document.getElementsByClassName(".editArea");
    var $span = document.createElement("span");

    for (prop in GlobalEditorObject) {
      if (prop === "font") {
        $span.style.font = "'" + GlobalEditorObject[prop] + "'";
      } else if (prop === "fontColor") {
        $span.style.color = GlobalEditorObject[obj];
      } else if (prop === "fontSize") {
        $span.style.font = GlobalEditorObject[obj];
      } else if (prop === "isitalic") {
        $span.style.font = GlobalEditorObject[obj] ? "italic" : "";
      } else if (prop === "isbold") {
        $span.style.font = GlobalEditorObject[obj] ? "bold" : "";
      } else if (prop === "isunderline") {
        $span.style.textDecoration = GlobalEditorObject[obj] ? "underline" : "";
      }
    }

    
    $span.innerHTML += event.key

    $editorArea.appendChild($span);
  }
})();
