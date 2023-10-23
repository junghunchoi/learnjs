var btnModule = (function () {
  /*
    1. 일단 버튼을 클릭했을 때 // 단순히 클릭을 했을 때 
    2. 본문에서 데이터 입출력이 변경이 되었을 때 
    */
  function appendBtn() {
    var BtnList = [];

    // 이텔릭 버튼
    var italicButton = createButton(
      "이텔릭",
      "m9.586 14.633.021.004c-.036.335.095.655.393.962.082.083.173.15.274.201h1.474a.6.6 0 1 1 0 1.2H5.304a.6.6 0 0 1 0-1.2h1.15c.474-.07.809-.182 1.005-.334.157-.122.291-.32.404-.597l2.416-9.55a1.053 1.053 0 0 0-.281-.823 1.12 1.12 0 0 0-.442-.296H8.15a.6.6 0 0 1 0-1.2h6.443a.6.6 0 1 1 0 1.2h-1.195c-.376.056-.65.155-.823.296-.215.175-.423.439-.623.79l-2.366 9.347z",
      "italicButton"
    );

    italicButton.isClicked = false;
    italicButton.addEventListener("click", clickBtn);
    BtnList.push(italicButton);

    // 언더라인 버튼
    var underlineButton = createButton(
      "언더라인",
      "M3 18v-1.5h14V18zm2.2-8V3.6c0-.4.4-.6.8-.6.3 0 .7.2.7.6v6.2c0 2 1.3 2.8 3.2 2.8 1.9 0 3.4-.9 3.4-2.9V3.6c0-.3.4-.5.8-.5.3 0 .7.2.7.5V10c0 2.7-2.2 4-4.9 4-2.6 0-4.7-1.2-4.7-4z",
      "underlineButton"
    );

    underlineButton.isClicked = false;
    underlineButton.addEventListener("click", clickBtn);
    BtnList.push(underlineButton);

    // 굵게 버튼
    var boldButton = createButton(
      "굵게",
      "M10.187 17H5.773c-.637 0-1.092-.138-1.364-.415-.273-.277-.409-.718-.409-1.323V4.738c0-.617.14-1.062.419-1.332.279-.27.73-.406 1.354-.406h4.68c.69 0 1.288.041 1.793.124.506.083.96.242 1.36.478.341.197.644.447.906.75a3.262 3.262 0 0 1 .808 2.162c0 1.401-.722 2.426-2.167 3.075C15.05 10.175 16 11.315 16 13.01a3.756 3.756 0 0 1-2.296 3.504 6.1 6.1 0 0 1-1.517.377c-.571.073-1.238.11-2 .11zm-.217-6.217H7v4.087h3.069c1.977 0 2.965-.69 2.965-2.072 0-.707-.256-1.22-.768-1.537-.512-.319-1.277-.478-2.296-.478zM7 5.13v3.619h2.606c.729 0 1.292-.067 1.69-.2a1.6 1.6 0 0 0 .91-.765c.165-.267.247-.566.247-.897 0-.707-.26-1.176-.778-1.409-.519-.232-1.31-.348-2.375-.348H7z",
      "boldButton"
    );

    boldButton.isClicked = false;
    boldButton.addEventListener("click", clickBtn);
    BtnList.push(boldButton);

    return BtnList;
  }

  function createButton(title, svgPath) {
    var buttonSpan = document.createElement("span");
    buttonSpan.className = "buttonArea";
    var button = document.createElement("button");
    button.className = "btn btn-light";
    button.title = title;
    buttonSpan.appendChild(button);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    button.appendChild(svg);

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", svgPath);
    svg.appendChild(path);

    return buttonSpan;
  }

  function clickBtn(event) {
    var $clickedBtn = event.target.closest("button");
    var isClicked = $clickedBtn.isClicked;

    if (!isClicked) {
      $clickedBtn.isClicked = true;
      $clickedBtn.classList.add("btn-secondary");
      $clickedBtn.classList.remove("btn-light");
    } else {
      $clickedBtn.isClicked = false;
      $clickedBtn.classList.add("btn-light");
      $clickedBtn.classList.remove("btn-secondary");
    }
  }

  function createButton(title, svgPath, btnId) {
    var buttonSpan = document.createElement("span");
    buttonSpan.className = "buttonArea";
    buttonSpan.style.height = "10px"
    buttonSpan.style.padding = "5px"
    var button = document.createElement("button");
    button.className = "btn btn-light";
    button.title = title;
    button.id = btnId;
    buttonSpan.appendChild(button);

    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    button.appendChild(svg);

    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", svgPath);
    svg.appendChild(path);

    return buttonSpan;
  }

  // public 메서드와 속성을 반환
  return {
    appendBtn: appendBtn,
    clickBtn: clickBtn,
  };
})();
