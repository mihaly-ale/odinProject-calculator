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
    calculator.dataset.operator =
      historyDisplayValue[historyDisplayValue.length - 1];
    const operator = calculator.dataset.operator;
    let secondNumber = currentDisplayValue;

    if (historyDisplayValue) {
      calculator.dataset.firstNumber = historyDisplayValue;
      const firstNumber = calculator.dataset.firstNumber.slice(0, -1);
      historyDisplay.textContent =
        historyDisplayValue + currentDisplayValue + keyValue;

      currentDisplay.textContent = calculate(
        firstNumber,
        operator,
        secondNumber
      );
      historyDisplay.textContent = currentDisplay.textContent + keyValue;
    } else {
      historyDisplay.textContent = currentDisplayValue + keyValue;
    }
    calculator.dataset.operator = keyValue;
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
