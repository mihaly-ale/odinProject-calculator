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
  const key = event instanceof MouseEvent ? event.target : pressedKey;
  const keyValue =
    event instanceof MouseEvent
      ? key.textContent
      : pressedKey.keyValue || event.key;
  let previousOperand = previousInput.textContent.trim();
  let currentOperand = currentInput.textContent.trim();
  const { type } = event instanceof MouseEvent ? key.dataset : pressedKey;
  const { previousKeyType } = calculator.dataset;
  const operatorKeys = keys.querySelectorAll('[data-type="operator"]');
  const memoryContainer = document.querySelector('.memory__container');

  if (type === 'number') {
    if (!previousOperand) {
      if (isNaN(currentOperand)) {
        clearIfTextOnDisplay(type, (currentOperand = '0'));
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
        operatorKeys.forEach((key) => (key.dataset.active = ''));
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
        // a clear state for the next operation
        currentInput.textContent = keyValue;
        previousInput.textContent = '';
        delete calculator.dataset.initialSecondNumber;
        delete calculator.dataset.operatorSign;
        delete calculator.dataset.firstNumber;
        delete calculator.dataset.operator;
      }
    }
  }

  if (type === 'operator') {
    if (!previousOperand) {
      if (isNaN(currentOperand)) {
        clearIfTextOnDisplay(type);
        return;
      } else {
        previousInput.textContent = `${currentOperand} ` + keyValue;
      }
    } else {
      if (previousKeyType === 'operator' || previousKeyType === 'undefined') {
        //operator cycling
        //undefined when operator entered in the main keyboard
        let operatorsRegex = /[+\-×÷%]/;
        previousInput.textContent = previousInput.textContent.replace(
          operatorsRegex,
          keyValue
        );
      }
      if (previousKeyType === 'equal') {
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
          event instanceof MouseEvent ? key.dataset.value : pressedKey.value;
        calculator.dataset.previousKeyType = type;
        return;
      }
    }

    toggleActiveOperator(event, key, operatorKeys);

    calculator.dataset.firstNumber = currentInput.textContent;
    calculator.dataset.operator =
      event instanceof MouseEvent ? key.dataset.value : pressedKey.value;
  }

  if (type === 'equal') {
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

  if (type === 'clear') {
    if (previousKeyType === 'equal') {
      //result as first operand
      previousInput.textContent = '';
      operatorKeys.forEach((key) => (key.dataset.active = ''));
      return;
    }

    if (
      // clears last character of any number, but text
      currentOperand &&
      Number(currentOperand)
    ) {
      currentInput.innerText = currentOperand.slice(0, -1);
    } else {
      allClear(operatorKeys);
    }
  }

  if (type === 'allclear') {
    allClear(operatorKeys);
  }

  if (type === 'memory-store') {
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

  if (type === 'memory-delete') {
    if (calculator.dataset.memory) {
      delete calculator.dataset.memory;
      memoryContainer.classList.remove('active');
    } else console.warn('No memory to delete.');
  }

  if (type === 'memory-recall') {
    if (calculator.dataset.memory) {
      currentInput.textContent = calculator.dataset.memory;
    } else {
      currentInput.style.fontSize = '.85rem';
      currentInput.textContent = 'No memory found';
    }
  }

  if (type === 'plusminus') {
    if (Number(currentOperand)) {
      if (currentOperand.charAt(0) === '-') {
        currentInput.textContent = currentOperand.slice(1);
      } else {
        currentInput.textContent = '-' + currentOperand;
      }
    } else {
      clearIfTextOnDisplay(type);
    }
  }

  if (type === 'decimal') {
    if (isNaN(currentOperand)) {
      clearIfTextOnDisplay(type);
    }

    if (currentOperand.includes('.')) {
      console.warn(
        'Duplicate decimal points are not allowed in the display field.'
      );
    } else {
      currentInput.textContent += keyValue;
    }
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

function allClear(operatorKeys) {
  currentInput.innerText = '0';
  currentInput.style.removeProperty('font-size');
  previousInput.innerText = '';
  operatorKeys.forEach((key) => (key.dataset.active = ''));
  delete calculator.dataset.operator;
  delete calculator.dataset.operatorSign;
  delete calculator.dataset.firstNumber;
  delete calculator.dataset.initialSecondNumber;
  delete calculator.dataset.previousKeyType;
}

function clearIfTextOnDisplay(type, currentOperand) {
  type === 'number'
    ? (currentInput.textContent = '0')
    : (currentInput.textContent = '0');
  currentInput.style.removeProperty('font-size');
  currentOperand = '';
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
  if (event.key >= 0 && event.key <= 9) pressedKey.type = 'number';
  if (event.key === 'Enter') pressedKey.type = 'equal';
  if (event.key === '+') {
    pressedKey.type = 'operator';
    pressedKey.value = 'add';
    pressedKey.keyValue = '+';
  }
  if (event.key === '-') {
    pressedKey.type = 'operator';
    pressedKey.value = 'subtract';
  }
  if (event.key === '*') {
    pressedKey.type = 'operator';
    pressedKey.value = 'multiply';
    pressedKey.keyValue = '×';
  }
  if (event.key === '/') {
    event.preventDefault();
    pressedKey.type = 'operator';
    pressedKey.value = 'divide';
    pressedKey.keyValue = '÷';
  }
  if (event.key === '%') {
    pressedKey.type = 'operator';
    pressedKey.value = 'percent';
    pressedKey.keyValue = '%';
  }
  if (event.key === 'Backspace') {
    pressedKey.type = 'clear';
  }
  if (event.key === 'Delete') {
    pressedKey.type = 'allclear';
  }
  if (event.key === 'ArrowUp') {
    pressedKey.type = 'memory-store';
  }
  if (event.key === 'ArrowDown') {
    pressedKey.type = 'memory-recall';
  }
  if (event.key === 'd') {
    pressedKey.type = 'memory-delete';
  }
  if (event.key === '.') {
    pressedKey.type = 'decimal';
  }
}
