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
            obj["color"] = PracEditorApp.convertRGBtoColorName(computedStyle.color);
            obj["fontSize"] = computedStyle.fontSize;
            obj["isitalic"] = computedStyle.fontStyle === "italic";
            obj["isbold"] = computedStyle.fontWeight >= 700;
            obj["isunderline"] = computedStyle.textDecorationLine.includes("underline");

            PracEditorApp.updateGlobalEditorObject(obj);
            PracEditorApp.updateToolbar();
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
            PracEditorApp.updateComponentCSS(newStyle, parentElement);
            range.setStart(parentElement.firstChild, 1);
            range.setEnd(parentElement.firstChild, 1);
            sel.removeAllRanges();
            sel.addRange(range);
        } else {
            var $newElement = document.createElement("span");
            $newElement.innerHTML = "&#xFEFF";
            PracEditorApp.updateComponentCSS(newStyle, $newElement);
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
        var cloneContents = range.cloneContents();


        // 시작 및 종료 노드가 텍스트 노드인 경우 부모 요소 참조
        if (startNode.nodeType === 3) {
            startNode = startNode.parentNode;
        }
        if (endNode.nodeType === 3) {
            endNode = endNode.parentNode;
        }

        var currentNode = startNode;

        while (currentNode && currentNode !== endNode) {
            if (currentNode.tagName === "P") {
                // 원하는 DOM 요소 또는 스타일 추가
                currentNode.style.color = "red"; // 예: 텍스트 색상을 빨간색으로 변경

                // 예: 각 p 태그 끝에 span 요소 추가
                var span = document.createElement("span");
                span.textContent = " [added]";
                currentNode.appendChild(span);
            }

            // 다음 노드 참조
            currentNode = currentNode.nextElementSibling;
        }


        // 하나의 태그 안에 전체 텍스트를 선택한 경우
        if (
            range.startContainer.parentElement === range.endContainer.parentElement &&
            selection.toString() === range.startContainer.textContent
        ) {
            processEntireTagText();
        }
            // else if (pCount >= 2) {
            //     // 여러 행의 텍스트를 선택한 경우
            //     handleMultiLineSelection(range.commonAncestorContainer.childNodes);
        // }
        else {
            handleTagSelection();
        }
    }

    function processEntireTagText() {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var dragedHtmlTag = range.startContainer.parentElement;
        PracEditorApp.updateComponentCSS(GlobalEditorObject, dragedHtmlTag);
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
        PracEditorApp.updateComponentCSS(GlobalEditorObject, $span);
        $span.textContent = originText;
        range.insertNode($span);
    }

    function handleMultiLineSelection(childNodes) {
        // 드래그했을 때 각각의 문장이 해당 문장의 전체인지 아닌지 확인해야한다.
        //
        for (let index = 0; index < childNodes.length; index++) {
            var child = childNodes[index];


            // 드래그한 문장이 전체 문장일 경우
            if (child.nodeType === 1) {
                // 부모의 노드만 업데이트하는거지
                PracEditorApp.updateComponentCSS(GlobalEditorObject, child);
            } else {
                MultiLineAppendChild(childNodes)
            }
        }
    }

    /**
     * 여러줄을 드래그하였을 경우 행의 위치는 고정하고 스타일만 변경
     * @param childNodes
     *
     */
    function MultiLineAppendChild(childNodes) {
        var selection = window.getSelection();
        var range = selection.getRangeAt(0);
        var startNode = range.startContainer;
        var endNode = range.endContainer;


        if (startNode.nodeType === 3) {
            startNode = startNode.parentNode;
        }
        if (endNode.nodeType === 3) {
            endNode = endNode.parentNode;
        }

        var currentNode = startNode;

        // 시작 노드부터 종료 노드까지 순회
        while (currentNode && currentNode !== endNode) {
            if (currentNode.tagName === "P") {
                // 원하는 DOM 요소 또는 스타일 추가
                currentNode.style.color = "red"; // 예: 텍스트 색상을 빨간색으로 변경

                // 예: 각 p 태그 끝에 span 요소 추가
                var span = document.createElement("span");
                span.textContent = " [added]";
                currentNode.appendChild(span);
            }

            // 다음 노드 참조
            currentNode = currentNode.nextElementSibling;
        }


    }

    return {
        checkSelection: checkSelection,
        updateOrInsertElement: updateOrInsertElement,
        processDraggedText: processDraggedText,
        checkSelectionType: checkSelectionType,
    };
})();
