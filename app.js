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

  calculator.dataset.previousKeyType = type;
});

function calculate(firstNumber, operator, secondNumber) {
  firstNumber = parseInt(firstNumber);
  secondNumber = parseInt(secondNumber);
  if (operator === 'add') return firstNumber + secondNumber;
  if (operator === 'subtract') return firstNumber - secondNumber;
  if (operator === 'multiply') return firstNumber * secondNumber;
  if (operator === 'divide') return firstNumber / secondNumber;
}
