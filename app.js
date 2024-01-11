const calculator = document.querySelector('.calculator');
const inputDisplay = calculator.querySelector('.display-input');
const outputDisplay = calculator.querySelector('.display-output');
const keys = calculator.querySelector('.calculator__keys');

keys.addEventListener('click', (event) => {
  const key = event.target;
  const keyValue = key.textContent;
  const inputDisplayValue = inputDisplay.textContent;
  const outputDisplayValue = outputDisplay.textContent;
  const { type } = key.dataset;
  const { previousKeyType } = calculator.dataset;
  const operatorKeys = keys.querySelectorAll('[data-type="operator"]');
  const memoryContainer = document.querySelector('.memory__container');

  if (type === 'number') {
    if (!inputDisplayValue) {
      if (outputDisplayValue === '0') {
        outputDisplay.textContent = keyValue;
      } else {
        outputDisplay.textContent += keyValue;
      }
    }
    if (inputDisplayValue && previousKeyType === 'number') {
      outputDisplay.textContent += keyValue;
    }

    if (previousKeyType === 'operator') {
      outputDisplay.textContent = keyValue;
    }
    if (previousKeyType === 'equal') {
      outputDisplay.textContent = keyValue;
    }
    if (previousKeyType === 'clear') {
      outputDisplay.textContent += keyValue;
    }
    if (previousKeyType === 'memory-recall') {
      outputDisplay.textContent = keyValue;
      outputDisplay.style.removeProperty('font-size');
    }
  }

  if (type === 'operator') {
    inputDisplay.textContent = outputDisplayValue + keyValue;
    const currentActiveOperator = calculator.querySelector(
      '[data-active= "highlighted"]'
    );
    if (currentActiveOperator) {
      currentActiveOperator.dataset.active = '';
    }
    key.dataset.active = 'highlighted';

    calculator.dataset.firstNumber = outputDisplayValue;
    calculator.dataset.operator = key.dataset.value;
  }

  if (type === 'equal') {
    let firstNumber = calculator.dataset.firstNumber;
    const operator = calculator.dataset.operator;
    let secondNumber = outputDisplayValue;
    let tempSecondaryNumber;
    let operatorSign;

    if (previousKeyType !== 'equal') {
      operatorSign = inputDisplay.innerText;
      operatorSign = operatorSign.slice(-1);
      calculator.dataset.operatorSign = operatorSign;
      inputDisplay.textContent += outputDisplayValue;
      calculator.dataset.tempSecondaryNumber = outputDisplayValue; // before calculate, outputDisplayValue is the second operand, after it updates to the result of the function. Here it is saved and lifted to the else block.
      outputDisplay.textContent = calculate(
        firstNumber,
        operator,
        secondNumber
      );
    } else {
      operatorSign = calculator.dataset.operatorSign;

      firstNumber = outputDisplayValue;
      tempSecondaryNumber = calculator.dataset.tempSecondaryNumber;
      inputDisplay.textContent =
        outputDisplay.textContent + operatorSign + tempSecondaryNumber;
      outputDisplay.textContent = calculate(
        firstNumber,
        operator,
        tempSecondaryNumber
      );
    }

    operatorKeys.forEach((key) => (key.dataset.active = ''));
  }

  if (type === 'clear') {
    outputDisplay.innerText = outputDisplayValue.slice(0, -1);
  }

  if (type === 'allclear') {
    outputDisplay.innerText = '';
    inputDisplay.innerText = '';
    delete calculator.dataset.operator;
    delete calculator.dataset.firstNumber;
    operatorKeys.forEach((key) => (key.dataset.active = ''));
  }

  if (type === 'memory-store') {
    if (outputDisplayValue) {
      console.log(outputDisplayValue);
      calculator.dataset.memory = outputDisplayValue;
      memoryContainer.classList.add('active');
    }
  }

  if (type === 'memory-delete') {
    delete calculator.dataset.memory;
    memoryContainer.classList.remove('active');
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
    if (outputDisplayValue.charAt(0) === '-') {
      outputDisplay.textContent = outputDisplayValue.slice(1);
    } else {
      outputDisplay.textContent = '-' + outputDisplayValue;
    }
  }

  calculator.dataset.previousKeyType = type;
});

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = parseFloat(firstNumber);
  secondNumber = parseFloat(secondNumber);
  if (operator === 'add') return firstNumber + secondNumber;
  if (operator === 'subtract') return firstNumber - secondNumber;
  if (operator === 'multiply') return firstNumber * secondNumber;
  if (operator === 'divide') return firstNumber / secondNumber;
  if (operator === 'percent') return (firstNumber * secondNumber) / 100;
}
