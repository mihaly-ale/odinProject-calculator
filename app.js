const calculator = document.querySelector('.calculator');
const historyDisplay = calculator.querySelector('.display-history');
const currentDisplay = calculator.querySelector('.display-current');
const keys = calculator.querySelector('.calculator__keys');

keys.addEventListener('click', (event) => {
  const key = event.target;
  const keyValue = key.textContent;
  const currentDisplayValue = currentDisplay.textContent;
  const historyDisplayValue = historyDisplay.textContent;
  const { type } = key.dataset;

  if (type === 'number') {
    if (currentDisplayValue === '0') {
      currentDisplay.textContent = keyValue;
    } else if (calculator.dataset.previousKeyType === 'operator') {
      currentDisplay.textContent = keyValue;
    } else {
      currentDisplay.textContent = currentDisplayValue + keyValue;
    }
  }

  if (type === 'operator') {
    console.log(`line 24: ${historyDisplayValue}, ${currentDisplayValue}`);

    if (historyDisplayValue) {
      historyDisplay.textContent =
        historyDisplayValue + currentDisplayValue + keyValue;
    } else {
      historyDisplay.textContent = currentDisplayValue + keyValue;
    }
  }
  calculator.dataset.previousKeyType = type;
});
