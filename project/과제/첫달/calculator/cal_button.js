let count = 0;
let cloneCount = 1;
let isOperateWithoutOperator = false;
const map = new Map();

const $hor = document.querySelector(".hor");

const clickEventListener = (event) => {
  const value = event.target.innerHTML;
  const calculateId = getCalculateId(event.target.id);
  const [numOne, numTwo, operator] = Object.values(map.get(calculateId));

  if (isNumber(numOne) && isOperator(value)) {
    // 첫번째 숫자가 있는데 클릭한
    setOperator(value, calculateId);
    return;
  }

  if (!operator || (operator && numOne) && value !== "=") {
    setNumber(value, calculateId);
  }

  if (value === "=" && isNumber(numTwo)) {
    calculate(value, calculateId);
  }
};

const setNumber = (value, calculateId) => {
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  const [numOne, , operator] = Object.values(getObject);

  if($result.value === '-' && value ==='-'){
    return
  }

  if (isOperateWithoutOperator) {
    isOperateWithoutOperator = false;
    $result.value = "";
  }

  if ($result.value === "err") {
    $result.value = "";
  }

  if ($result.value.includes(".") && value === ".") {
    return;
  }

  if (value === "-" || value === "." || isNumber(value)) {
    if ($result.value === "") {
      $result.value = value === "." ? "0." : value;
    } else if ($result.value === "0" && (value === "-" || isNumber(value))) {
      $result.value = value;
    } else {
      $result.value += value;
    }

    if (isOperator(operator)) {
      getObject.numTwo = $result.value;
    } else {
      getObject.numOne = $result.value;
    }
    map.set(calculateId, getObject);
  }
};

const setOperator = (value, calculateId) => {
  const $process = getComponent("#process_clone", calculateId);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  const [numOne, numTwo, operator] = Object.values(map.get(calculateId));

  if (isOperator(operator) && isOperator(value) && !isNumber($result.value)) {
    // 기존에 연산자가 있고 입력한 값이 연산자이며 결과값이 숫자가 아니면
    $process.value = String($process.value).slice(0, String($process.value).length - 1) + value;
    getObject.operator = value;
    map.set(calculateId, getObject);
  }

  if (!isNumber(numTwo) && $result.value === "") {
    return;
  }

  if (isNumber($result.value) && isOperator(operator) & (value !== "=")) {
    calculateWithoutEqual(value, calculateId);
    return;
  }

  if (isNumber(numOne)) {
    getObject.numOne = $result.value;
    getObject.operator = value;
    $process.value = $result.value + value;
    map.set(calculateId, getObject);
    $result.value = "";
  }
};

const calculate = (value, calculateId) => {
  const $process = getComponent("#process_clone", calculateId);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  let isOperateWithoutOperator = false;
  const [numOne, , operator] = Object.values(getObject);
  const numTwo = $result.value;

  if (isOperator(operator)) {
    switch (operator) {
      case "+":
        $result.value = +(parseFloat(numOne) + parseFloat(numTwo)).toFixed(12);
        break;
      case "-":
        $result.value = +(parseFloat(numOne) - parseFloat(numTwo)).toFixed(12);
        break;
      case "x":
        $result.value = +(parseFloat(numOne) * parseFloat(numTwo)).toFixed(12);
        break;
      case "/":
        if (numTwo === "0" || numTwo === "0.") {
          $result.value = "err";
          break;
        }
        $result.value = +(parseFloat(numOne) / parseFloat(numTwo)).toFixed(12);
        break;
      default:
        break;
    }

    makeHistory($process.value + numTwo, $result.value, calculateId);

    $process.value = "";
    getObject.numOne = $result.value === "err" ? "" : $result.value;
    getObject.numTwo = "";
    getObject.operator = "";

    map.set(calculateId, getObject);
  }
};

const calculateWithoutEqual = (value, calculateId) => {
  const $process = getComponent("#process_clone", calculateId);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  let [numOne, , operator] = Object.values(getObject);
  const numTwo = $result.value;

  console.log($process.value.substring($process.value.length - 1, $process.value.length));

  // 가장마지막이 연산자고 result에 값이 있고 다시 연산자를 누르면 원래 연산자의 것을 계산한다.
  if (operator !== $process.value.substring($process.value.length - 1, $process.value.length)) {
    operator = $process.value.substring($process.value.length - 1, $process.value.length);
  }
  switch (operator) {
    case "+":
      $result.value = +(parseFloat(numOne) + parseFloat(numTwo)).toFixed(12);
      break;
    case "-":
      $result.value = +(parseFloat(numOne) - parseFloat(numTwo)).toFixed(12);
      break;
    case "x":
      $result.value = +(parseFloat(numOne) * parseFloat(numTwo)).toFixed(12);
      break;
    case "/":
      if (numTwo === "0") {
        $result.value = "err";
        break;
      }
      $result.value = +(parseFloat(numOne) / parseFloat(numTwo)).toFixed(12);
      break;
    default:
      break;
  }

  $process.value += numTwo + value;
  getObject.numOne = $result.value;
  getObject.operator = value;
  map.set(calculateId, getObject);

  isOperateWithoutOperator = true;
};

const isNumber = (number) => {
  return !isNaN(number) && number !== "";
};

const isOperator = (op) => {
  if (op === "+" || op === "-" || op === "x" || op === "/") return true;
};

const makeHistory = (process, result, calculateId) => {
  const $history = getComponent("#history_clone", calculateId);
  const $line = document.createElement("div");
  const getObject = map.get(calculateId);

  $line.textContent = process + " = " + result;
  $history.appendChild($line);

  getObject.historyArr.push($line.textContent);
  const historyArrToJson = JSON.stringify(getObject.historyArr);

  window.localStorage.setItem(calculateId, historyArrToJson);
};

const removeCurrentValue = (event) => {
  const calculateId = getCalculateId(event.target.id);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  $result.value = "0";
  //   getObject.numOne = "";
  //   map.set(calculateId, getObject);
};

const removeLastValue = (event) => {
  const calculateId = getCalculateId(event.target.id);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  const [, , operator] = Object.values(getObject);

  if ($result.value.length === 1) {
    if (!isOperator(operator)) {
      getObject.numOne = "";
    }
    $result.value = "0";
  } else {
    $result.value = $result.value.substring(0, $result.value.length - 1);
  }
};

const backspace = (event) => {
  const calculateId = getCalculateId(event.target.id);
  const $result = getComponent("#result_clone", calculateId);
  const getObject = map.get(calculateId);
  const [numOne, , operator] = Object.values(getObject);

  if (numOne && event.target.value === "⌫") {
    return;
  }

  if ($result.value.length === 1) {
    if (!isOperator(operator)) {
      getObject.numOne = "";
    }
    $result.value = "0";

    map.set(calculateId, getObject);
  } else {
    $result.value = $result.value.substring(0, $result.value.length - 1);
  }
};

const removeAllValue = (event) => {
  const calculateId = getCalculateId(event.target.id);
  const $process = getComponent("#process_clone", calculateId);
  const $result = getComponent("#result_clone", calculateId);
  const $history = getComponent("#history_clone", calculateId);
  const getObject = map.get(calculateId);
  $process.value = "";
  $result.value = "0";
  getObject.numOne = "";
  getObject.numTwo = "";
  getObject.operator = "";
  map.set(calculateId, getObject);
  $history.innerHTML = "";
  window.localStorage.removeItem(calculateId);
};

const copyHtml = () => {
  const makeDiv = document.createElement("div");
  makeDiv.innerHTML = `
    <div class="hor">
        <div class="align">
        <input readonly      class = "process" />
        <input class = "result" value = "0"/>
        <div class="row">
            <button class = "ce"id="ce" onclick="removeCurrentValue(event)">CE</button>
            <button class = "clear"id="clear" onclick="removeLastValue(event)">C</button>
            <button class = "ac"id="ac" onclick="removeAllValue(event)">AC</button>
            <button class = "backsapce"id="backsapce" onclick="backspace(event)">⌫</button>
        </div>
        <div class="row">
            <button class="num-7" id="num-7" onclick = "clickEventListener(event)">7</button>
            <button class="num-8" id="num-8" onclick = "clickEventListener(event)">8</button>
            <button class="num-9" id="num-9" onclick = "clickEventListener(event)">9</button>
            <button class="plus"  id="plus"  onclick = "clickEventListener(event)">+</button>
        </div>
        <div class="row">
            <button class="num-4" id="num-4" onclick = "clickEventListener(event)">4</button>
            <button class="num-5" id="num-5" onclick = "clickEventListener(event)">5</button>
            <button class="num-6" id="num-6" onclick = "clickEventListener(event)">6</button>
            <button class="minus" id="minus" onclick = "clickEventListener(event)">-</button>
        </div>
        <div class="row">
            <button class ="num-1"   id="num-1"  onclick = "clickEventListener(event)">1</button>
            <button class ="num-2"   id="num-2"  onclick = "clickEventListener(event)">2</button>
            <button class ="num-3"   id="num-3"  onclick = "clickEventListener(event)">3</button>
            <button class ="divide"  id="divide" onclick = "clickEventListener(event)">/</button>
        </div>
        <div class="row">
            <button onclick = "clickEventListener(event)" class="comma" id="comma">.</button>
            <button onclick = "clickEventListener(event)" class="num-0" id="num-0">0</button>
            <button onclick = "clickEventListener(event)" class="calculate" id="calculate">=</button>
            <button onclick = "clickEventListener(event)" class="multiply" id="multiply">x</button>
        </div>
        </div>
        <div class="history"></div>
    </div>`;

  visitAllNodes(makeDiv, function (node) {
    node.id = node.className + "_clone" + cloneCount;
  });

  $hor.appendChild(makeDiv);

  const calObject = {
    numOne: "",
    numTwo: "",
    operator: "",
    historyArr: [],
  };

  map.set(cloneCount, calObject);

  loadDataFromLocalStorage(cloneCount);
  cloneCount++;
};

function visitAllNodes(node, callback) {
  if (node && node.nodeType === 1) {
    callback(node);
    for (let i = 0; i < node.childNodes.length; i++) {
      visitAllNodes(node.childNodes[i], callback);
    }
  }
}

const loadDataFromLocalStorage = (calculateId) => {
  const value = localStorage.getItem(calculateId);
  const $history = getComponent("#history_clone", calculateId);

  const valueToJson = JSON.parse(value);

  for (key in valueToJson) {
    const $line = document.createElement("div");
    $line.textContent = valueToJson[key];
    $history.appendChild($line);
  }
};

const getCalculateId = (id) => {
  return parseInt(id[id.length - 1]);
};

const getComponent = (componentClassName, calculateId) => {
  return document.querySelector(`${componentClassName}${calculateId}`);
};

