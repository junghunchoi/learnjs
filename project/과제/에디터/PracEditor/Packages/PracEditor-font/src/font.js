var fontModule = (function () {
  function appendDropbox() {
    var dropboxList = [];

    // 폰트 드롭다운
    const fontDropdown = createDropdown(
      "기본",
      ["Default", "Black Han Sans", "Nanum Brush Script"],
      "fontDropdown"
    );
    dropboxList.push(fontDropdown);

    // 폰트 크기 드롭다운
    const fontSizeDropdown = createDropdown(
      "12pt",
      ["9pt", "10pt", "12pt", "14pt", "16pt", "20pt"],
      "fontSizeDropdown"
    );
    dropboxList.push(fontSizeDropdown);

    // 색상 드롭다운
    const colorDropdown = createFontColorDropdown([
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
    const dropdownSpan = document.createElement("span");
    const dropdownDiv = document.createElement("div");
    dropdownDiv.className = "dropdown p-2";
    dropdownSpan.appendChild(dropdownDiv);

    const dropdownButton = document.createElement("button");
    dropdownButton.className = "btn btn-light dropdown-toggle btn-sm btn-outline-dark";
    dropdownButton.id = dropdownId;
    dropdownButton.type = "button";

    dropdownButton.setAttribute("data-bs-toggle", "dropdown");
    dropdownButton.setAttribute("aria-expanded", "false");
    dropdownButton.textContent = title;
    dropdownDiv.appendChild(dropdownButton);

    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";
    dropdownDiv.appendChild(dropdownMenu);

    items.forEach((item) => {
      const listItem = document.createElement("li");
      const anchor = document.createElement("a");
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
    const dropdownSpan = document.createElement("span");
    const dropdownDiv = document.createElement("div");
    dropdownDiv.className = "dropdown p-2";
    dropdownSpan.appendChild(dropdownDiv);

    const dropdownButton = document.createElement("button");
    dropdownButton.className = "btn btn-light dropdown-toggle btn-sm btn-outline-dark";
    dropdownButton.id = "fontColor";
    dropdownButton.type = "button";

    dropdownButton.setAttribute("data-bs-toggle", "dropdown");
    dropdownButton.setAttribute("aria-expanded", "false");
    dropdownButton.textContent = "black";
    dropdownDiv.appendChild(dropdownButton);

    const dropdownMenu = document.createElement("ul");
    dropdownMenu.className = "dropdown-menu";
    dropdownDiv.appendChild(dropdownMenu);

    for (let color of colors) {
      const li = document.createElement("li");
      const anchor = document.createElement("a");
      anchor.className = "dropdown-item";
      anchor.href = "#";
      anchor.id = "fontColor-item";
      anchor.textContent = color;
      anchor.addEventListener("click", clickDropdown);
      li.style.backgroundColor = color;
      li.appendChild(anchor);
      dropdownMenu.appendChild(li);
    }

    return dropdownSpan;
  }

  function clickDropdown(event) {
    var $parentNode = document.getElementById(event.target.id.replace("-item", ""));
    if (event.target.id === "fontColor-item") {
      $parentNode.style.backgroundColor = event.target.textContent;
    }
    $parentNode.innerHTML = event.target.textContent;
  }

  return {
    appendDropbox: appendDropbox,
  };
})();
