var fontModule = (function () {
  function appendDropbox() {
    var dropboxList = [];

    var fontDropdown = createDropdown(
      "기본",
      ["기본", "Black Han Sans", "Nanum Brush Script"],
      "fontDropdown"
    );
    dropboxList.push(fontDropdown);

    var fontSizeDropdown = createDropdown(
      "12pt",
      ["9pt", "10pt", "12pt", "14pt", "16pt", "20pt"],
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

  function createDropdown(title, items, dropdownId) {
    var dropdownSpan = document.createElement("span");
    var dropdownDiv = document.createElement("div");
    dropdownDiv.className = "dropdown p-2";
    dropdownSpan.appendChild(dropdownDiv);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "btn btn-light dropdown-toggle btn-sm btn-outline-dark";
    dropdownButton.id = dropdownId;
    dropdownButton.type = "button";

    dropdownButton.setAttribute("data-bs-toggle", "dropdown");
    dropdownButton.setAttribute("aria-expanded", "false");
    dropdownButton.textContent = title;
    dropdownDiv.appendChild(dropdownButton);

    var dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";
    dropdownDiv.appendChild(dropdownMenu);

    items.forEach(function(item) {
      var listItem = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.className = "dropdown-item";
      anchor.href = "#";
      anchor.textContent = item;
      anchor.id = dropdownId + "-item";
      anchor.addEventListener("click", clickDropdown);
      listItem.appendChild(anchor);
      dropdownMenu.appendChild(listItem);
    });

    return dropdownSpan;
  }

  function createFontColorDropdown(colors) {
    var dropdownSpan = document.createElement("span");
    var dropdownDiv = document.createElement("div");
    dropdownDiv.className = "dropdown p-2";
    dropdownSpan.appendChild(dropdownDiv);

    var dropdownButton = document.createElement("button");
    dropdownButton.className = "btn btn-light dropdown-toggle btn-sm btn-outline-dark";
    dropdownButton.id = "colorDropdown";
    dropdownButton.type = "button";

    dropdownButton.setAttribute("data-bs-toggle", "dropdown");
    dropdownButton.setAttribute("aria-expanded", "false");
    dropdownButton.textContent = "black";
    dropdownDiv.appendChild(dropdownButton);

    var dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";
    dropdownDiv.appendChild(dropdownMenu);

    for (var i = 0; i < colors.length; i++) {
      var li = document.createElement("li");
      var anchor = document.createElement("a");
      anchor.className = "dropdown-item";
      anchor.href = "#";
      anchor.id = "colorDropdown-item";
      anchor.textContent = colors[i];
      anchor.addEventListener("click", clickDropdown);
      li.style.backgroundColor = colors[i];
      li.appendChild(anchor);
      dropdownMenu.appendChild(li);
    }

    return dropdownSpan;
  }

  function clickDropdown(event) {
    var $parentNode = document.getElementById(event.target.id.replace("-item", ""));
    var obj = {};

    if (event.target.id === "colorDropdown-item") {
      $parentNode.style.backgroundColor = event.target.textContent;
    }
    $parentNode.innerHTML = event.target.textContent;
    obj[event.target.id.replace("Dropdown-item", "")] = event.target.textContent;
    updateGlobalEditorObject(obj);

    selectionModule.updateOrInsertElement(GlobalEditorObject)
  }

  return {
    appendDropbox: appendDropbox,
  };
})();