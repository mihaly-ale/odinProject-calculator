const calculator = document.querySelector('.calculator');
const inputDisplay = calculator.querySelector('.display-input');
const outputDisplay = calculator.querySelector('.display-output');
const keys = calculator.querySelector('.calculator__keys');

keys.addEventListener('click', handleClickEvent);
window.addEventListener('keydown', handleKeyEvent);

function handleKeyEvent(event) {
  let pressedKey = {}; // object to store type (clicked key) and value (for operator)
  if (event.key >= 0 && event.key <= 9) pressedKey.type = 'number';
  handleClickEvent(event, pressedKey);
}

function handleClickEvent(event, pressedKey) {
  const key = event instanceof MouseEvent ? event.target : pressedKey;
  const keyValue = event instanceof MouseEvent ? key.textContent : event.key;
  const inputDisplayValue = inputDisplay.textContent.trim();
  const outputDisplayValue = outputDisplay.textContent.trim();
  const { type } = event instanceof MouseEvent ? key.dataset : pressedKey;
  const { previousKeyType } = calculator.dataset;
  const operatorKeys = keys.querySelectorAll('[data-type="operator"]');
  const memoryContainer = document.querySelector('.memory__container');

  if (type === 'number') {
    clearIfStringOnDisplay(outputDisplayValue, type, keyValue);

    if (outputDisplayValue.length >= 12 && previousKeyType === 'number') {
      outputDisplay.textContent = Number(outputDisplayValue).toExponential(4);
      return;
    }

    if (!inputDisplayValue) {
      if (outputDisplayValue === '0') {
        outputDisplay.textContent = keyValue; // first number key
      } else {
        outputDisplay.textContent += keyValue; // initial concat of numbers, before operation
      }
    }

    if (inputDisplayValue) {
      //exists after operator key lifts value to the top display
      if (previousKeyType === 'operator') {
        outputDisplay.textContent = keyValue; // adds new number after operator is pressed
        operatorKeys.forEach((key) => (key.dataset.active = ''));
      }
      if (
        previousKeyType === 'number' ||
        previousKeyType === 'clear' ||
        previousKeyType === 'decimal'
      ) {
        outputDisplay.textContent += keyValue; //concat digits of second number
      }
      if (previousKeyType === 'equal') {
        // a clear state for the next opartaion
        outputDisplay.textContent = keyValue;
        inputDisplay.textContent = '';
        delete calculator.dataset.initialSecondNumber;
        delete calculator.dataset.operatorSign;
        delete calculator.dataset.firstNumber;
        delete calculator.dataset.operator;
      }
    }
  }

  if (type === 'operator') {
    clearIfStringOnDisplay(outputDisplayValue, type, keyValue);

    if (!inputDisplayValue) {
      // operator brings first operand to the top display
      inputDisplay.textContent = outputDisplay.textContent + keyValue;
    } else {
      if (previousKeyType === 'operator') {
        //operator cycling
        let operatorsRegex = /[+\-×÷%]/;
        inputDisplay.textContent = inputDisplay.textContent.replace(
          operatorsRegex,
          keyValue
        );
      }
      if (previousKeyType === 'equal') {
        // update display for repeated operation, chaining
        inputDisplay.textContent = outputDisplayValue + keyValue;
      }
    }

    toggleActiveOperator(key);

    calculator.dataset.firstNumber = outputDisplay.textContent;
    calculator.dataset.operator = key.dataset.value;
  }

  if (type === 'equal') {
    let firstNumber = calculator.dataset.firstNumber;
    const operator = calculator.dataset.operator;
    const secondNumber = outputDisplayValue;
    let initialSecondNumber;
    let operatorSign; // only for display

    if (previousKeyType !== 'equal') {
      // single operation

      calculator.dataset.initialSecondNumber = outputDisplayValue; // save initial second operand(secondNumber) for repeated operation
      calculator.dataset.operatorSign = inputDisplay.innerText.slice(-1); // store operator sign for repeated operation's inputDisplay value

      outputDisplay.textContent = calculate(
        firstNumber,
        operator,
        secondNumber
      );
      inputDisplay.textContent += outputDisplayValue;
    } else {
      // multiple equal press keeps adding the initial secondary number to the result (e.g: 1+2=3, (3+2)=5, (5+2)=7, etc)

      firstNumber = outputDisplayValue;
      calculator.dataset.firstNumber = firstNumber;

      operatorSign = calculator.dataset.operatorSign;
      initialSecondNumber = calculator.dataset.initialSecondNumber;

      inputDisplay.textContent =
        outputDisplay.textContent + operatorSign + initialSecondNumber;

      outputDisplay.textContent = calculate(
        firstNumber,
        operator,
        initialSecondNumber
      );
    }
  }

  if (type === 'clear') {
    if (previousKeyType === 'equal') {
      //result stays as next operation first number, previous oparation is cleared
      inputDisplay.textContent = '';
      return;
    }

    if (
      // clears last character of any number, but text
      outputDisplayValue &&
      Number(outputDisplayValue)
    ) {
      outputDisplay.innerText = outputDisplayValue.slice(0, -1);
    } else {
      allClear(operatorKeys);
    }
  }

  if (type === 'allclear') {
    allClear(operatorKeys);
  }

  if (type === 'memory-store') {
    if (outputDisplayValue && Number(outputDisplayValue)) {
      //store number values
      calculator.dataset.memory = outputDisplayValue;
      memoryContainer.classList.add('active');
    } else {
      //errors no state
      outputDisplay.textContent = 'Error';
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
      outputDisplay.textContent = calculator.dataset.memory;
    } else {
      outputDisplay.textContent = 'No memory found';
      outputDisplay.style.fontSize = '.75rem';
    }
  }

  if (type === 'plusminus') {
    if (Number(outputDisplayValue)) {
      if (outputDisplayValue.charAt(0) === '-') {
        outputDisplay.textContent = outputDisplayValue.slice(1);
      } else {
        outputDisplay.textContent = '-' + outputDisplayValue;
      }
    }
  }

  if (type === 'decimal') {
    if (outputDisplayValue.includes('.')) {
      console.warn(
        'Duplicate decimal points are not allowed in the display field.'
      );
    } else {
      outputDisplay.textContent += keyValue;
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
  outputDisplay.innerText = '0';
  outputDisplay.style.removeProperty('font-size');
  inputDisplay.innerText = '';
  operatorKeys.forEach((key) => (key.dataset.active = ''));
  delete calculator.dataset.operator;
  delete calculator.dataset.operatorSign;
  delete calculator.dataset.firstNumber;
  delete calculator.dataset.initialSecondNumber;
}

function clearIfStringOnDisplay(outputDisplayValue, type, keyValue) {
  if (
    // prevents concatenation when display has string values
    outputDisplayValue === 'Error' ||
    outputDisplayValue === 'No memory found' ||
    outputDisplayValue === 'Infinity' ||
    outputDisplayValue === 'NaN'
  ) {
    type === 'number'
      ? (outputDisplay.textContent = '')
      : (outputDisplay.textContent = '0');
    outputDisplay.style.removeProperty('font-size');
  }
}
