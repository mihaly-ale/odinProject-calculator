const calculator = document.querySelector('.calculator');
const previousInput = calculator.querySelector('.previous-input');
const currentInput = calculator.querySelector('.current-input');
const keys = calculator.querySelector('.calculator__keys');

keys.addEventListener('click', handleClickEvent);
window.addEventListener('keydown', handleKeyEvent);

function handleKeyEvent(event) {
  let pressedKey = {}; // object to store type (clicked key) and value (for operator)

  handleKeyMapping(event, pressedKey);
  handleClickEvent(event, pressedKey);
}

function handleClickEvent(event, pressedKey) {
  const state = {
    previousOperand: previousInput.textContent.trim(),
    currentOperand: currentInput.textContent.trim(),
    previousKeyType: calculator.dataset.previousKeyType,
    operatorKeys: keys.querySelectorAll('[data-type="operator"]'),
    memoryContainer: document.querySelector('.memory__container'),
    key: event instanceof MouseEvent ? event.target : pressedKey,
  };
  const type =
    event instanceof MouseEvent ? state.key.dataset.type : pressedKey.type;
  const keyValue =
    event instanceof MouseEvent
      ? state.key.textContent
      : state.key.keyValue || event.key;

  switch (type) {
    case 'number':
      handleNumber(state, keyValue, type);
      break;
    case 'operator':
      handleOperator(state, keyValue, event);
      break;
    case 'decimal':
      handleDecimalPoint(state, keyValue);
      break;
    case 'equal':
      handleEqualSign(state, keyValue);
      break;
    case 'clear-entry':
      clearEntry();
      break;
    case 'allclear':
      allClear(state);
      break;
    case 'memory-store':
      storeMemory(state);
      break;
    case 'memory-delete':
      clearMemory(state);
      break;
    case 'memory-recall':
      recallMemory(state);
      break;
    case 'plusminus':
      invertSign(state, keyValue);
      break;
  }

  calculator.dataset.previousKeyType = type;
}

function handleNumber(state, keyValue) {
  let { currentOperand, previousKeyType, operatorKeys } = state;

  if (isNaN(currentOperand)) {
    clearIfTextOnDisplay(state);
  }

  if (
    currentOperand === '0' ||
    previousKeyType === 'operator' ||
    previousKeyType === 'equal'
  ) {
    currentInput.textContent = keyValue;
    if (previousKeyType === 'operator') {
      operatorKeys.forEach((opKey) => (opKey.dataset.active = ''));
    } else if (previousKeyType === 'equal') {
      previousInput.textContent = '';
    }
  } else {
    appendNumber(keyValue, currentOperand);
  }
}

function clearIfTextOnDisplay() {
  currentInput.textContent = '';
  currentInput.style.removeProperty('font-size');
}

function appendNumber(keyValue, currentOperand) {
  currentOperand.length < 20
    ? (currentInput.textContent += keyValue)
    : (currentInput.textContent = currentOperand);
}

function handleOperator(state, keyValue, event) {
  let { previousOperand, currentOperand, previousKeyType, key } = state;

  if (isNaN(currentOperand)) {
    clearIfTextOnDisplay(state);
  }

  if (!currentOperand) {
    let operatorsRegex = /[-+×%÷]/;
    previousInput.textContent = previousOperand.replace(
      operatorsRegex,
      keyValue
    );
    setOperator(key, event);
    return;
  }

  if (previousKeyType === 'number' && previousOperand) {
    performPreviousOperation(currentOperand, keyValue, event, key);
    return;
  }

  calculator.dataset.firstNumber = currentInput.textContent;
  calculator.dataset.operatorSign = keyValue;
  // toggleActiveOperator()
  setOperator(key, event);

  previousInput.textContent = `${currentOperand} ` + keyValue;
}

function setOperator(key, event) {
  calculator.dataset.operator =
    event instanceof MouseEvent ? key.dataset.value : key.value;
}

function performPreviousOperation(
  currentOperand,
  keyValue,
  event,
  key,
  operatorKeys
) {
  let tempSum = calculate(
    calculator.dataset.firstNumber,
    calculator.dataset.operator,
    currentOperand
  );
  previousInput.textContent = `${tempSum} ${keyValue}`;
  currentInput.textContent = tempSum;
  calculator.dataset.firstNumber = tempSum;
  toggleActiveOperator(event, key, operatorKeys);
  setOperator(key, event);
}

function toggleActiveOperator(event, key, operatorKeys) {
  if (event instanceof KeyboardEvent) {
    const currentActiveOperator = [...operatorKeys].find((opKey) => {
      return opKey.dataset.value === key.value;
    });

    operatorKeys.forEach((key) => (key.dataset.active = ''));

    currentActiveOperator.dataset.active = 'highlighted';
  }

  if (event instanceof MouseEvent) {
    const currentActiveOperator = calculator.querySelector(
      `[data-active= "highlighted"]`
    );

    if (currentActiveOperator) {
      currentActiveOperator.dataset.active = '';
    }

    key.dataset.active = 'highlighted';
  }
}

function handleDecimalPoint(state, keyValue) {
  const { currentOperand, previousKeyType } = state;

  if (isNaN(currentOperand)) {
    clearIfTextOnDisplay(state);
  }

  if (previousKeyType === 'equal') {
    previousInput.textContent = '';
    currentInput.textContent = '0.';
    return;
  }

  if (currentOperand.includes('.')) {
    console.warn(
      'Duplicate decimal points are not allowed in the display field.'
    );
  } else {
    currentOperand
      ? (currentInput.textContent += keyValue)
      : (currentInput.textContent = '0.');
  }
}

function handleEqualSign(state, keyValue) {
  const { currentOperand, previousKeyType } = state;

  const firstNumber = calculator.dataset.firstNumber;
  const operator = calculator.dataset.operator;
  const secondNumber = currentOperand;

  if (firstNumber) {
    if (previousKeyType === 'equal') {
      cumulativeOperation(secondNumber, keyValue);
    } else {
      currentInput.textContent = calculate(firstNumber, operator, secondNumber);
      previousInput.textContent += ` ${currentOperand} =`;
      calculator.dataset.initialSecondNumber = currentOperand;
    }
  }
}

function cumulativeOperation(secondNumber, keyValue) {
  initialSecondNumber = calculator.dataset.initialSecondNumber;
  operator = calculator.dataset.operator;
  operatorSign = calculator.dataset.operatorSign;

  previousInput.textContent = `${secondNumber} ${operatorSign} ${initialSecondNumber} ${keyValue}`;

  currentInput.textContent = calculate(
    secondNumber,
    operator,
    initialSecondNumber
  );
}

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = firstNumber.startsWith('+')
    ? parseFloat(firstNumber.slice(1))
    : parseFloat(firstNumber);
  secondNumber = parseFloat(secondNumber);

  if (operator === 'divide' && secondNumber == '0') {
    return "Can't divide by zero";
  }

  switch (operator) {
    case 'add':
      return firstNumber + secondNumber;
    case 'subtract':
      return firstNumber - secondNumber;
    case 'multiply':
      return firstNumber * secondNumber;
    case 'divide':
      return firstNumber / secondNumber;
    case 'percent':
      return (firstNumber * secondNumber) / 100;
    default:
      return NaN;
  }
}

function clearEntry() {
  currentInput.textContent = '';
}

function allClear(state) {
  const { operatorKeys } = state;
  currentInput.innerText = '0';
  currentInput.style.removeProperty('font-size');
  previousInput.innerText = '';
  operatorKeys.forEach((opKey) => (opKey.dataset.active = ''));
  delete calculator.dataset.operator;
  delete calculator.dataset.operatorSign;
  delete calculator.dataset.firstNumber;
  delete calculator.dataset.initialSecondNumber;
  delete calculator.dataset.previousKeyType;
}

function storeMemory(state) {
  const { currentOperand, memoryContainer } = state;

  if (currentOperand && Number(currentOperand)) {
    calculator.dataset.memory = currentOperand;
    memoryContainer.classList.add('active');
  } else {
    currentInput.style.fontSize = '.85rem';
    currentInput.textContent = 'Error: Nothing to store';
    console.warn('No value to be stored.');
  }
}

function clearMemory(state) {
  const { memoryContainer } = state;

  if (calculator.dataset.memory) {
    delete calculator.dataset.memory;
    memoryContainer.classList.remove('active');
  } else console.warn('No memory to delete');
}
function recallMemory(state) {
  const { previousOperand } = state;
  if (calculator.dataset.memory) {
    if (previousOperand.includes('=')) {
      previousInput.textContent = '';
    }
    currentInput.textContent = calculator.dataset.memory;
  } else {
    currentInput.style.fontSize = '.85rem';
    currentInput.textContent = 'No memory found';
  }
}

function invertSign(state) {
  const { currentOperand } = state;

  if (Number(currentOperand)) {
    if (currentOperand.charAt(0) === '-') {
      currentInput.textContent = currentOperand.slice(1);
    } else {
      currentInput.textContent = '-' + currentOperand;
    }
  } else {
    clearIfTextOnDisplay(state);
  }
}

// KEYBOARD SUPPORT
function handleKeyMapping(event, pressedKey) {
  switch (event.key) {
    case 'Enter':
      pressedKey.type = 'equal';
      break;
    case '+':
      pressedKey.type = 'operator';
      pressedKey.value = 'add';
      pressedKey.keyValue = '+';
      break;
    case '-':
      pressedKey.type = 'operator';
      pressedKey.value = 'subtract';
      break;
    case '*':
      pressedKey.type = 'operator';
      pressedKey.value = 'multiply';
      pressedKey.keyValue = '×';
      break;
    case '/':
      event.preventDefault();
      pressedKey.type = 'operator';
      pressedKey.value = 'divide';
      pressedKey.keyValue = '÷';
      break;
    case '%':
      pressedKey.type = 'operator';
      pressedKey.value = 'percent';
      pressedKey.keyValue = '%';
      break;
    case 'Backspace':
      pressedKey.type = 'clear-entry';
      break;
    case 'Delete':
      pressedKey.type = 'allclear';
      break;
    case 'ArrowUp':
      pressedKey.type = 'memory-store';
      break;
    case 'ArrowDown':
      pressedKey.type = 'memory-recall';
      break;
    case 'd':
      pressedKey.type = 'memory-delete';
      break;
    case '.':
      pressedKey.type = 'decimal';
      break;
    default:
      if (event.key >= '0' && event.key <= '9') {
        pressedKey.type = 'number';
      }
  }
}
