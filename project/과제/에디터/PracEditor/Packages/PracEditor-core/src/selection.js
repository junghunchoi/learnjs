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
      obj["color"] = frontCursorFontColor; 
      obj["fontSize"] = frontCursorFontSize;
      obj["isitalic"] = frontCursorIsItalic;
      obj["isbold"] = frontCursorIsBold;
      obj["isunderline"] = frontCursorIsUnderline;

      updateGlobalEditorObject(obj);
      updateToolbar();
    }
  }

  function updateOrInsertElement(newStyle) {
    var sel = window.getSelection();
    var range = sel.getRangeAt(0);
    var currentNode = range.commonAncestorContainer;
    var parentElement =
      currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;

    if ((parentElement.textContent.trim() === "&#xFEFF" || parentElement.textContent.trim() === "")&& parentElement.tagName === "SPAN") {
      console.log("update");
      updateComponentCSS(newStyle, parentElement);
      range.setStart(parentElement.firstChild,1);
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


  return {
    checkSelection: checkSelection,
    updateOrInsertElement: updateOrInsertElement,
    // handleKeyboardInput: handleKeyboardInput,
  };
})();
