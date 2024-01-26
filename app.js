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
      handleOperator(state, keyValue, type, event);
      break;
    case 'equal':
      handleEqualSign(state);
      break;
    case 'clear':
      clear(state);
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
    case 'decimal':
      handleDecimalPoint(state, keyValue);
      break;
  }

  calculator.dataset.previousKeyType = type;
}

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = firstNumber.startsWith('+')
    ? parseFloat(firstNumber.slice1)
    : parseFloat(firstNumber);
  secondNumber = parseFloat(secondNumber);
  if (operator === 'add') return firstNumber + secondNumber;
  if (operator === 'subtract') return firstNumber - secondNumber;
  if (operator === 'multiply') return firstNumber * secondNumber;
  if (operator === 'divide') return firstNumber / secondNumber;
  if (operator === 'percent') return (firstNumber * secondNumber) / 100;
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

function clearIfTextOnDisplay() {
  currentInput.textContent = '0';
  currentInput.style.removeProperty('font-size');
  state.currentOperand = '';
}

function appendNumber(keyValue, currentOperand) {
  currentOperand.length < 20
    ? (currentInput.textContent += keyValue)
    : (currentInput.textContent = currentOperand);
}

function toExponential(length, input, value) {
  if (value.length >= length) {
    input.textContent = Number(value).toExponential(4);
  }
}

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
      pressedKey.type = 'clear';
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

function handleNumber(state, keyValue) {
  let { previousOperand, currentOperand, previousKeyType, operatorKeys } =
    state;

  if (!previousOperand) {
    if (isNaN(currentOperand)) {
      clearIfTextOnDisplay(state);
    }
    if (currentOperand === '0') {
      currentInput.textContent = keyValue;
    } else {
      appendNumber(keyValue, currentOperand);
    }
  }

  if (previousOperand) {
    if (previousKeyType === 'operator') {
      currentInput.textContent = keyValue;
      operatorKeys.forEach((opKey) => (opKey.dataset.active = ''));
    }
    if (
      previousKeyType === 'number' ||
      previousKeyType === 'clear' ||
      previousKeyType === 'decimal' ||
      previousKeyType === 'plusminus' ||
      previousKeyType === 'memory-store' ||
      previousKeyType === 'memory-delete'
    ) {
      appendNumber(keyValue, currentOperand);
    }
    if (previousKeyType === 'equal') {
      //ar state for the next operation
      currentInput.textContent = keyValue;
      previousInput.textContent = '';
      delete calculator.dataset.initialSecondNumber;
      delete calculator.dataset.operatorSign;
      delete calculator.dataset.firstNumber;
      delete calculator.dataset.operator;
    }
  }
}

function handleOperator(state, keyValue, type, event) {
  let { previousOperand, currentOperand, previousKeyType, operatorKeys, key } =
    state;

  if (!previousOperand) {
    if (isNaN(currentOperand)) {
      clearIfTextOnDisplay(state);
      return;
    } else {
      previousInput.textContent = `${currentOperand} ` + keyValue;
    }
  } else {
    if (previousKeyType === 'operator' || previousKeyType === 'undefined') {
      //operator cycling
      //undefined when operator entered in the main keyboard
      let operatorsRegex = /[-+*/%](?!\d)/; // negative lookahead (?!...)
      previousInput.textContent = previousInput.textContent.replace(
        operatorsRegex,
        keyValue
      );
    }
    if (state.previousKeyType === 'equal') {
      // result to first operand
      previousInput.textContent = `${currentOperand} ` + keyValue;
    }
    if (
      previousKeyType === 'number' ||
      previousKeyType === 'memory-store' ||
      previousKeyType === 'undefined'
    ) {
      // immediate evaluation
      let tempSum = calculate(
        calculator.dataset.firstNumber,
        calculator.dataset.operator,
        currentOperand
      );
      previousInput.textContent = `${tempSum} ` + keyValue;
      currentInput.textContent = '';
      calculator.dataset.firstNumber = tempSum;
      toggleActiveOperator(event, key, operatorKeys);
      calculator.dataset.operator =
        event instanceof MouseEvent ? key.dataset.value : key.value;
      calculator.dataset.previousKeyType = type;
      return;
    }
  }

  toggleActiveOperator(event, key, operatorKeys);

  calculator.dataset.firstNumber = currentInput.textContent;
  calculator.dataset.operator =
    event instanceof MouseEvent ? key.dataset.value : key.value;
}

function handleEqualSign(state) {
  const { previousOperand, currentOperand, previousKeyType } = state;

  let firstNumber = calculator.dataset.firstNumber;
  const operator = calculator.dataset.operator;
  const secondNumber = currentOperand || '0';
  let initialSecondNumber;
  let operatorSign; // only for display
  if (previousKeyType === 'equal' || previousOperand.includes('=')) {
    // continous operation (e.g: 1+2=3, 3+2=5, 5+2=7, etc)
    firstNumber = currentOperand;
    calculator.dataset.firstNumber = firstNumber;
    operatorSign = calculator.dataset.operatorSign;
    initialSecondNumber = calculator.dataset.initialSecondNumber;
    previousInput.textContent =
      currentInput.textContent +
      ` ${operatorSign}` +
      ` ${initialSecondNumber} =`;
    currentInput.textContent = calculate(
      secondNumber,
      operator,
      initialSecondNumber
    );
  } else {
    // single operation
    calculator.dataset.initialSecondNumber = currentOperand; // save initial second operand(secondNumber) for repeated operation
    calculator.dataset.operatorSign = previousInput.innerText.slice(-1); // extract operator sign for display purpose
    currentInput.textContent = calculate(firstNumber, operator, secondNumber);
    previousInput.textContent +=
      secondNumber !== '0' ? ` ${currentOperand} =` : ` ${secondNumber} =`;
  }
}

function clear(state) {
  const { currentOperand, previousKeyType, operatorKeys } = state;

  if (previousKeyType === 'equal') {
    //result as first operand
    previousInput.textContent = '';
    operatorKeys.forEach((opKey) => (opKey.dataset.active = ''));
    return;
  }

  if (
    // clears last character of any number, but text
    currentOperand &&
    Number(currentOperand)
  ) {
    currentInput.textContent = currentOperand.slice(0, -1);
  } else {
    currentInput.textContent = '';
  }
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
    //store only number values
    calculator.dataset.memory = currentOperand;
    memoryContainer.classList.add('active');
  } else {
    //errors no state
    currentInput.style.fontSize = '.85rem';
    currentInput.textContent = 'Error: Nothing to store.';
    console.warn('No value to be stored.');
  }
}

function clearMemory(state) {
  const { memoryContainer } = state;

  if (calculator.dataset.memory) {
    delete calculator.dataset.memory;
    memoryContainer.classList.remove('active');
  } else console.warn('No memory to delete.');
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

function handleDecimalPoint(state, keyValue) {
  const { currentOperand } = state;
  if (isNaN(currentOperand)) {
    clearIfTextOnDisplay(state);
  }

  if (currentOperand.includes('.')) {
    console.warn(
      'Duplicate decimal points are not allowed in the display field.'
    );
  } else {
    currentInput.textContent += keyValue;
  }
}
