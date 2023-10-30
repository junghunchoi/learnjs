var selectionModule = (function () {
  function checkSelection(node) {
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var nodeBeforeCaret = range.startContainer;
    var obj = {};

    if (nodeBeforeCaret.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
      var parentElement = nodeBeforeCaret.parentElement;
      var computedStyle = window.getComputedStyle(parentElement);

      obj["font"] = computedStyle.fontFamily.split(", ")[0];
      obj["color"] = convertRGBtoColorName(computedStyle.color);
      obj["fontSize"] = computedStyle.fontSize;
      obj["isitalic"] = computedStyle.fontStyle === "italic";
      obj["isbold"] = computedStyle.fontWeight >= 700;
      obj["isunderline"] = computedStyle.textDecorationLine.includes("underline");

      updateGlobalEditorObject(obj);
      updateToolbar();
    }
  }

  function checkSelectionType(event) {
    var selectionType = window.getSelection().type;
    if (selectionType === "Caret") {
      selectionModule.updateOrInsertElement(GlobalEditorObject);
    } else {
      selectionModule.processDraggedText();
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
      updateComponentCSS(newStyle, parentElement);
      range.setStart(parentElement.firstChild, 1);
      range.setEnd(parentElement.firstChild, 1);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
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


    console.log("clone : " , range.cloneContents());
    console.log("list : " , range.commonAncestorContainer.childNodes);
    var clonedContent = range.cloneContents();

    // !!!!!!!드래그한 영역의 태그명과 textcontent를 받아왔다.
    for (var i = 0; i < clonedContent.childNodes.length; i++) {
      var node = clonedContent.childNodes[i];
      
      // 노드가 요소 노드인 경우 (태그가 있는 경우)
      if (node.nodeType === 1) {
          console.log("Tag:", node.tagName);
          console.log("textContent:", node.textContent);
      }
  }
  // 받아온 값을 기준으로 setrange를 해서 해당 노드 안에 받아온 값을 넣는다.
    debugger;
  //!!!
 

    // 여러줄 선택했는지 확인하기 위함
    var childNodesArray = Array.prototype.slice.call(range.commonAncestorContainer.childNodes);

    var pCount = childNodesArray.filter(function (node) {
      return node.nodeType === 1 && node.nodeName === "P";
    }).length;

    // 하나의 태그 안에 전체 텍스트를 선택한 경우
    if (
      range.startContainer.parentElement === range.endContainer.parentElement &&
      selection.toString() === range.startContainer.textContent
    ) {
      processEntireTagText();
    } else if (pCount >= 2) {
      // 여러 행의 텍스트를 선택한 경우
      handleMultiLineSelection(range.commonAncestorContainer.childNodes);
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
    var selection = window.getSelection();
    var range = selection.getRangeAt(0);
    var originText = selection.toString();

    if (selection.rangeCount > 0) {
      selectedText = range.toString();
      selection.deleteFromDocument();
      selection.removeAllRanges();
      selection.addRange(range);
    }

    var $span = document.createElement("span");
    updateComponentCSS(GlobalEditorObject, $span);
    $span.textContent = originText;
    range.insertNode($span);
  }

  function handleMultiLineSelection(childNodes) {
    // 드래그했을 때 각각의 문장이 해당 문장의 전체인지 아닌지 확인해야한다.
    // 
    for (let index = 0; index < childNodes.length; index++) {
      var child = childNodes[index];
      console.log(child);
      // console.log(child.startContainer,  child.endContainer);

      // 드래그한 문장이 전체 문장일 경우
      if (child.nodeType === 1) {
        updateComponentCSS(GlobalEditorObject, child);
      }
    }
  }

  return {
    checkSelection: checkSelection,
    updateOrInsertElement: updateOrInsertElement,
    processDraggedText: processDraggedText,
    checkSelectionType: checkSelectionType,
  };
})();
