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
  const operatorKeys = keys.querySelectorAll('[data-type="operator"]');

  if (type === 'number') {
    if (!inputDisplayValue) {
      if (outputDisplayValue === '0') {
        outputDisplay.textContent = keyValue;
      } else {
        outputDisplay.textContent += keyValue;
      }
    }

    if (calculator.dataset.previousKeyType === 'operator') {
      outputDisplay.textContent = keyValue;
    }
    if (inputDisplayValue && calculator.dataset.previousKeyType === 'number') {
      outputDisplay.textContent += keyValue;
    }

    /**
     * TODO temporary update of outputDisplay value here
     * */
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
    const firstNumber = calculator.dataset.firstNumber;
    const operator = calculator.dataset.operator;
    const secondNumber = outputDisplayValue;

    inputDisplay.textContent += outputDisplayValue;
    outputDisplay.textContent = calculate(firstNumber, operator, secondNumber);
  }

  if (type === 'clear') {
    outputDisplay.innerText = outputDisplayValue.slice(0, -1);
    return;
  }

  if (type === 'allclear') {
    outputDisplay.innerText = '';
    inputDisplay.innerText = '';
    delete calculator.dataset.operator;
    delete calculator.dataset.firstNumber;
    operatorKeys.forEach((key) => (key.dataset.active = ''));
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
}
