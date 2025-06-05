        let currentDisplay = '0';
        const display = document.getElementById('display');
        
        function updateDisplay() {
            display.textContent = currentDisplay;
        }
        
        function appendToDisplay(value) {
            if (currentDisplay === '0' && value !== '.') {
                currentDisplay = value;
            } else {
                currentDisplay += value;
            }
            updateDisplay();
        }
        
        function clearDisplay() {
            currentDisplay = '0';
            updateDisplay();
        }
        
        function backspace() {
            if (currentDisplay.length === 1) {
                currentDisplay = '0';
            } else {
                currentDisplay = currentDisplay.slice(0, -1);
            }
            updateDisplay();
        }
        
        function calculate() {
            try {
                currentDisplay = eval(currentDisplay).toString();
            } catch (error) {
                currentDisplay = 'Error';
            }
            updateDisplay();
        }
        
        function percentage() {
            try {
                currentDisplay = (eval(currentDisplay) / 100).toString();
            } catch (error) {
                currentDisplay = 'Error';
            }
            updateDisplay();
        }
        
        function squareRoot() {
            try {
                currentDisplay = Math.sqrt(eval(currentDisplay)).toString();
            } catch (error) {
                currentDisplay = 'Error';
            }
            updateDisplay();
        }
        
        function toggleSign() {
            if (currentDisplay.startsWith('-')) {
                currentDisplay = currentDisplay.substring(1);
            } else if (currentDisplay !== '0') {
                currentDisplay = '-' + currentDisplay;
            }
            updateDisplay();
        }