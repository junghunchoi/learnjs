var fontModule = (function () {
  function appendDropbox() {
    var dropboxList = [];

    var fontDropdown = createDropdown(
      ["Noto Sans KR", "Black Han Sans", "Nanum Brush Script"],
      "fontDropdown"
    );
    dropboxList.push(fontDropdown);

    var fontSizeDropdown = createDropdown(
      ["9px", "10px", "12px", "14px", "16px", "20px"],
      "fontSizeDropdown"
    );
    dropboxList.push(fontSizeDropdown);

    var colorDropdown = createFontColorDropdown([
      "black",
      "blue",
      "green",
      "yellow",
      "purple",
      "orange",
      "cyan",
      "magenta",
      "lime",
    ]);
    dropboxList.push(colorDropdown);

    return dropboxList;
  }

  function createDropdown(items, dropdownId) {
    var dropdownSpan = document.createElement("span");
    var $select = document.createElement("select");
    $select.id = dropdownId;
    dropdownSpan.appendChild($select);
    $select.addEventListener("change", function (event) {
      var selectedOptionText = this.options[this.selectedIndex].textContent;
      var $parentNode = document.getElementById(event.target.id.replace("-item", ""));
      var obj = {};
      if (event.target.id === "colorDropdown-item") {
        $parentNode.style.backgroundColor = selectedOptionText;
      }
      $parentNode.options[this.selectedIndex].selected = true;
      obj[this.options[this.selectedIndex].id.replace("Dropdown-item", "")] = selectedOptionText;
      updateGlobalEditorObject(obj);

      selectionModule.checkSelectionType(event);
    });

    items.forEach(function (item) {
      var $option = document.createElement("option");

      if (item === "16px") {
        $option.selected = true;
      }
      $option.textContent = item;
      $option.id = dropdownId + "-item";

      $select.appendChild($option);
    });

    return dropdownSpan;
  }

  function createFontColorDropdown(colors) {
    var dropdownSpan = document.createElement("span");
    var $select = document.createElement("select");
    $select.id = "colorDropdown";
    dropdownSpan.appendChild($select);
    $select.addEventListener("change", function (event) {
      var selectedOptionText = this.options[this.selectedIndex].textContent;
      var $parentNode = document.getElementById(event.target.id.replace("-item", ""));

      var obj = {};
      if (event.target.id === "colorDropdown") {
        $parentNode.style.color = selectedOptionText;
      }
      $parentNode.options[this.selectedIndex].selected = true;
      obj[this.options[this.selectedIndex].id.replace("Dropdown-item", "")] = selectedOptionText;
      updateGlobalEditorObject(obj);

      selectionModule.checkSelectionType(event);
    });

    for (var i = 0; i < colors.length; i++) {
      var $option = document.createElement("option");
      $option.id = "colorDropdown-item";
      $option.textContent = colors[i];
      $option.style.backgroundColor = colors[i];
      $select.appendChild($option);
    }

    return dropdownSpan;
  }

  return {
    appendDropbox: appendDropbox,
  };
})();
