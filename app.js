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
      inputDisplay.textContent = keyValue;
    } else {
      inputDisplay.textContent = inputDisplayValue + keyValue;
    }
    /**
     * TODO temporary update of outputDisplay value here
     * */
  }

  if (type === 'operator') {
    inputDisplay.textContent = inputDisplayValue + keyValue;
    const currentActiveOperator = calculator.querySelector(
      '[data-active= "highlighted"]'
    );
    if (currentActiveOperator) {
      currentActiveOperator.dataset.active = '';
    }
    key.dataset.active = 'highlighted';
  }
  calculator.dataset.previousKeyType = type;
});

function calculate(firstNumber, operator, secondNumber) {
  console.log(firstNumber, operator, secondNumber);
  firstNumber = parseInt(firstNumber);
  secondNumber = parseInt(secondNumber);
  if (operator === '+') return firstNumber + secondNumber;
  if (operator === '-') return firstNumber - secondNumber;
}
