var selectionModule = (function () {
  function checkSelection(node) {
    // - 드래그한 영역의 text
    // - 커서 앞 글짜의 태그와 스타일
    // - 드래그한 영역이 같은 태그일경우
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var nodeBeforeCaret = range.startContainer;
    var obj = {};
    var dragedText = window.getSelection().toString();
    var frontCursorFontColor;
    var frontCursorFont;
    var frontCursorFontSize;
    var frontCursorIsBold;
    var frontCursorIsUnderline;
    var frontCursorIsItalic;
    var frontCursorHTML;

    if (nodeBeforeCaret.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
      var textNode = nodeBeforeCaret;
      var parentElement = textNode.parentElement;
      var computedStyle = window.getComputedStyle(parentElement);

      frontCursorFontColor = computedStyle.color;
      frontCursorFont = computedStyle.fontFamily.split(", ")[0];
      frontCursorFontSize = computedStyle.fontSize;
      frontCursorIsBold = computedStyle.fontWeight >= 700 ? true : false;
      frontCursorIsUnderline = computedStyle.textDecorationLine.includes("underline")
        ? true
        : false;
      frontCursorIsItalic = computedStyle.fontStyle === "italic" ? true : false;
      frontCursorHTML = parentElement.tagName;
      obj["font"] = frontCursorFont;
      obj["color"] = convertRGBtoColorName(frontCursorFontColor);
      obj["fontSize"] = frontCursorFontSize;
      obj["isitalic"] = frontCursorIsItalic;
      obj["isbold"] = frontCursorIsBold;
      obj["isunderline"] = frontCursorIsUnderline;

      updateGlobalEditorObject(obj);
      updateToolbar();
    }
  }

  function checkSelectionType(event){
    var selectionType = window.getSelection().type;

    if(selectionType === "Caret"){
      selectionModule.updateOrInsertElement(GlobalEditorObject);
    }else{
      selectionModule.processDraggedText()
    }
  }

  function updateOrInsertElement(newStyle) {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var currentNode = range.commonAncestorContainer;
    var parentElement =
      currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;

    if (
      (parentElement.textContent.trim() === "&#xFEFF" || parentElement.textContent.trim() === "") &&
      parentElement.tagName === "SPAN"
    ) {
      console.log("update");
      updateComponentCSS(newStyle, parentElement);
      range.setStart(parentElement.firstChild, 1);
      range.setEnd(parentElement.firstChild, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      console.log("insert");
      var $newElement = document.createElement("span");
      $newElement.innerHTML = "&#xFEFF";
      updateComponentCSS(newStyle, $newElement);
      range.insertNode($newElement);
      range.setStart($newElement.firstChild, 1);
      range.setEnd($newElement.firstChild, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }


  function processDraggedText() {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var startNode = range.startContainer;
    var endNode = range.endContainer;

    //드래그한영역이 하나의 태그안에 있고 전체 텍스트이면
    if (
      range.startContainer.parentElement === range.endContainer.parentElement &&
      selection.toString() === startNode.textContent
    ) {
      processEntireTagText();
    } else {
      handleTagSelection();
    }
  }

  function processEntireTagText() {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var dragedHtmlTag = range.startContainer.parentElement;
    updateComponentCSS(GlobalEditorObject, dragedHtmlTag);
  }

  function handleTagSelection() {
    console.log("handleMultiTagSelection");
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var originText = selection.toString();

    selection.deleteFromDocument();

    var $span = document.createElement("span");
    updateComponentCSS(GlobalEditorObject, $span);
    $span.textContent = originText;
    console.log($span);
    range.insertNode($span);
    selection.removeAllRanges();
  }

  return {
    checkSelection: checkSelection,
    updateOrInsertElement: updateOrInsertElement,
    processDraggedText: processDraggedText,
    checkSelectionType:checkSelectionType
  };
})();
