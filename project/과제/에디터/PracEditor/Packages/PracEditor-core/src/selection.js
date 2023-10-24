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
      const textNode = nodeBeforeCaret;
      const parentElement = textNode.parentElement;
      const computedStyle = window.getComputedStyle(parentElement);

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
      obj["fontColor"] = frontCursorFontColor;
      obj["fontSize"] = frontCursorFontSize;
      obj["isitalic"] = frontCursorIsItalic;
      obj["isbold"] = frontCursorIsBold;
      obj["isunderline"] = frontCursorIsUnderline;

      updateGlobalEditorObject(obj);
      updateToolbar();
    }
  }

  function updateOrInsertElement(newStyle) {
    console.log(newStyle);
    // 현재 선택 영역을 가져옵니다.
    const sel = window.getSelection();
    if (sel.rangeCount) {
      const range = sel.getRangeAt(0);
      const currentNode = range.commonAncestorContainer;
      const parentElement =
        currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;
        
      // 커서가 위치한 DOM 요소의 내용이 비어 있는지 확인합니다.
      if (parentElement.innerHTML.trim() === "" && parentElement.tagName !== 'DIV') {
        // 내용이 비어 있으면 CSS만 업데이트합니다.
        console.log("여기를 타야해");
        updateComponentCSS(newStyle, parentElement);
      } else {
        console.log("makespan");
        // 내용이 있으면 새로운 DOM 요소를 만들고, 커서 위치에 삽입합니다.
        const $newElement = document.createElement("span");
        updateComponentCSS(newStyle, $newElement);
        range.insertNode($newElement);
        range.collapse(false); // 커서를 새로운 요소 뒤로 이동합니다.
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  return {
    checkSelection: checkSelection,
    updateOrInsertElement: updateOrInsertElement
  };
})();
