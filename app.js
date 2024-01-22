const calculator = document.querySelector('.calculator');
const previousInput = calculator.querySelector('.previous-input');
const currentInput = calculator.querySelector('.current-input');
const keys = calculator.querySelector('.calculator__keys');

keys.addEventListener('click', handleClickEvent);
window.addEventListener('keydown', handleKeyEvent);

function handleKeyEvent(event) {
  let pressedKey = {}; // object to store type (clicked key) and value (for operator)
  if (event.key >= 0 && event.key <= 9) pressedKey.type = 'number';
  if (event.key === 'Enter') pressedKey.type = 'equal';
  if (event.key === '+') {
    pressedKey.type = 'operator';
    pressedKey.value = 'add';
  }
  if (event.key === '-') {
    pressedKey.type = 'operator';
    pressedKey.value = 'subtract';
  }
  if (event.key === '*') {
    pressedKey.type = 'operator';
    pressedKey.value = 'multiply';
  }
  if (event.key === '/') {
    event.preventDefault();
    pressedKey.type = 'operator';
    pressedKey.value = 'divide';
  }
  if (event.key === '%') {
    pressedKey.type = 'operator';
    pressedKey.value = 'percent';
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

  handleClickEvent(event, pressedKey);
}

function handleClickEvent(event, pressedKey) {
  const key = event instanceof MouseEvent ? event.target : pressedKey;
  const keyValue = event instanceof MouseEvent ? key.textContent : event.key;
  const previousOperand = previousInput.textContent.trim();
  const currentOperand = currentInput.textContent.trim();
  const { type } = event instanceof MouseEvent ? key.dataset : pressedKey;
  const { previousKeyType } = calculator.dataset;
  const operatorKeys = keys.querySelectorAll('[data-type="operator"]');
  const memoryContainer = document.querySelector('.memory__container');

  if (type === 'number') {
    clearIfStringOnDisplay(currentOperand, type, keyValue);

    if (currentOperand.length >= 12 && previousKeyType === 'number') {
      currentOperand.textContent = Number(currentOperand).toExponential(4);
      return;
    }

    if (!previousOperand) {
      if (currentOperand === '0') {
        currentOperand.textContent = keyValue; // first number key
      } else {
        currentOperand.textContent += keyValue; // initial concatenation of numbers, before operation
      }
    }

    if (previousOperand) {
      //exists after operator key lifts value to the top display
      if (previousKeyType === 'operator') {
        currentOperand.textContent = keyValue; // adds new number after operator is pressed
        operatorKeys.forEach((key) => (key.dataset.active = ''));
      }
      if (
        previousKeyType === 'number' ||
        previousKeyType === 'clear' ||
        previousKeyType === 'decimal'
      ) {
        currentOperand.textContent += keyValue; //concat digits of second number
      }
      if (previousKeyType === 'equal') {
        // a clear state for the next operation
        currentOperand.textContent = keyValue;
        previousOperand.textContent = '';
        delete calculator.dataset.initialSecondNumber;
        delete calculator.dataset.operatorSign;
        delete calculator.dataset.firstNumber;
        delete calculator.dataset.operator;
      }
    }
  }

  if (type === 'operator') {
    clearIfStringOnDisplay(currentOperand, type, keyValue);

    if (!previousOperand) {
      // operator brings first operand to the top display
      previousOperand.textContent = currentOperand.textContent + keyValue;
    } else {
      if (previousKeyType === 'operator') {
        //operator cycling
        let operatorsRegex = /[+\-×÷%]/;
        previousOperand.textContent = previousOperand.textContent.replace(
          operatorsRegex,
          keyValue
        );
      }
      if (previousKeyType === 'equal') {
        // update display for repeated operation, chaining
        previousOperand.textContent = currentOperand + keyValue;
      }
    }

    toggleActiveOperator(key);

    calculator.dataset.firstNumber = currentOperand.textContent;
    calculator.dataset.operator =
      event instanceof MouseEvent ? key.dataset.value : pressedKey.value;
  }

  if (type === 'equal') {
    let firstNumber = calculator.dataset.firstNumber;
    const operator = calculator.dataset.operator;
    const secondNumber = currentOperand;
    let initialSecondNumber;
    let operatorSign; // only for display

    if (previousKeyType !== 'equal') {
      // single operation

      calculator.dataset.initialSecondNumber = currentOperand; // save initial second operand(secondNumber) for repeated operation
      calculator.dataset.operatorSign = previousOperand.innerText.slice(-1); // store operator sign for repeated operation's previousOperand value

      currentOperand.textContent = calculate(
        firstNumber,
        operator,
        secondNumber
      );
      previousOperand.textContent += currentOperand;
    } else {
      // multiple equal press keeps adding the initial secondary number to the result (e.g: 1+2=3, (3+2)=5, (5+2)=7, etc)

      firstNumber = currentOperand;
      calculator.dataset.firstNumber = firstNumber;

      operatorSign = calculator.dataset.operatorSign;
      initialSecondNumber = calculator.dataset.initialSecondNumber;

      previousOperand.textContent =
        currentOperand.textContent + operatorSign + initialSecondNumber;

      currentOperand.textContent = calculate(
        firstNumber,
        operator,
        initialSecondNumber
      );
    }
  }

  if (type === 'clear') {
    if (previousKeyType === 'equal') {
      //result stays as next operation first number, previous operation is cleared
      previousOperand.textContent = '';
      return;
    }

    if (
      // clears last character of any number, but text
      currentOperand &&
      Number(currentOperand)
    ) {
      currentOperand.innerText = currentOperand.slice(0, -1);
    } else {
      allClear(operatorKeys);
    }
  }

  if (type === 'allclear') {
    allClear(operatorKeys);
  }

  if (type === 'memory-store') {
    if (currentOperand && Number(currentOperand)) {
      //store number values
      calculator.dataset.memory = currentOperand;
      memoryContainer.classList.add('active');
    } else {
      //errors no state
      currentOperand.textContent = 'Error';
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
      currentOperand.textContent = calculator.dataset.memory;
    } else {
      currentOperand.textContent = 'No memory found';
      currentOperand.style.fontSize = '.75rem';
    }
  }

  if (type === 'plusminus') {
    if (Number(currentOperand)) {
      if (currentOperand.charAt(0) === '-') {
        currentOperand.textContent = currentOperand.slice(1);
      } else {
        currentOperand.textContent = '-' + currentOperand;
      }
    }
  }

  if (type === 'decimal') {
    if (currentOperand.includes('.')) {
      console.warn(
        'Duplicate decimal points are not allowed in the display field.'
      );
    } else {
      currentOperand.textContent += keyValue;
    }
  }

  calculator.dataset.previousKeyType = type;
}

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = parseFloat(firstNumber);
  secondNumber = parseFloat(secondNumber);
  if (operator === 'add') return firstNumber + secondNumber;
  if (operator === 'subtract') return firstNumber - secondNumber;
  if (operator === 'multiply') return firstNumber * secondNumber;
  if (operator === 'divide') return firstNumber / secondNumber;
  if (operator === 'percent') return (firstNumber * secondNumber) / 100;
}

function toggleActiveOperator(key) {
  const currentActiveOperator = calculator.querySelector(
    '[data-active= "highlighted"]'
  );
  if (currentActiveOperator) {
    currentActiveOperator.dataset.active = '';
  }
  key.dataset.active = 'highlighted';
}

function allClear(operatorKeys) {
  currentOperand.innerText = '0';
  currentOperand.style.removeProperty('font-size');
  previousOperand.innerText = '';
  operatorKeys.forEach((key) => (key.dataset.active = ''));
  delete calculator.dataset.operator;
  delete calculator.dataset.operatorSign;
  delete calculator.dataset.firstNumber;
  delete calculator.dataset.initialSecondNumber;
}

function clearIfStringOnDisplay(currentOperand, type, keyValue) {
  if (
    // prevents concatenation when display has string values
    currentOperand === 'Error' ||
    currentOperand === 'No memory found' ||
    currentOperand === 'Infinity' ||
    currentOperand === 'NaN'
  ) {
    type === 'number'
      ? (currentOperand.textContent = '')
      : (currentOperand.textContent = '0');
    currentOperand.style.removeProperty('font-size');
  }
}
