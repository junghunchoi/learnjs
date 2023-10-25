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
    console.log("start updateOrInsertElement");
    var $editorArea = document.getElementsByClassName("editorArea");
    const sel = window.getSelection();

    const range = sel.getRangeAt(0);
    const currentNode = range.commonAncestorContainer;
    const parentElement =
      currentNode.nodeType === Node.TEXT_NODE ? currentNode.parentNode : currentNode;

    console.log("parent",parentElement);
    //위의 태그가 span일경우? 아래에 덧붙인다?
    if (parentElement.tagName === "P" || parentElement.tagName === "SPAN") {
      console.log("create new span");
      console.log("스타일", newStyle);
      const $newElement = document.createElement("span");
      $newElement.innerHTML = "&#xFEFF";
      updateComponentCSS(newStyle, $newElement);
      console.log("css 변경후", $newElement);
      range.insertNode($newElement);
      range.setStart($newElement, 0);
      range.setEnd($newElement, 0);
      sel.removeAllRanges();
      sel.addRange(range);
      $newElement.focus();
    } else if ((parentElement.textContent.trim() === "&#xFEFF" || parentElement.textContent.trim() === "")&& parentElement.tagName === "SPAN") {
      console.log("update parent css");
      console.log("스타일", newStyle);
      updateComponentCSS(newStyle, parentElement);
      range.setStart(parentElement, 0);
      range.setEnd(parentElement, 0);
      sel.removeAllRanges();
      sel.addRange(range);
      parentElement.focus();
    }
  }

  // function handleKeyboardInput(event) {
  //   if (event.inputType !== "insertText" && event.inputType !== "insertCompositionText") {
  //     return;
  //   }

  //   const selection = window.getSelection();
  //   const range = selection.getRangeAt(0);
  //   let container = range.endContainer;
  //   let lastSpan;
  //   var $editArea = document.getElementsByClassName("editorArea");

  //   while (container && container.nodeType !== Node.ELEMENT_NODE) {
  //     container = container.parentNode;
  //   }

  //   console.log(selection);
  //   console.log(range);

  //   if (container.tagName === "SPAN") {
  //     lastSpan = container;
  //   } else {
  //     const spans = container.querySelectorAll("span");
  //     lastSpan = spans[spans.length - 1];
  //   }

  //   if (lastSpan) {
  //     lastSpan.textContent = range.commonAncestorContainer.textContent; //combineHangul(lastSpan.textContent, event.data);
  //   }

  //   event.preventDefault(); // 기본 입력 동작을 방지

  //   selection.removeAllRanges();
  //   selection.addRange(range);
  //   range.startContainer = "";
  // }

  return {
    checkSelection: checkSelection,
    updateOrInsertElement: updateOrInsertElement,
    // handleKeyboardInput: handleKeyboardInput,
  };
})();
