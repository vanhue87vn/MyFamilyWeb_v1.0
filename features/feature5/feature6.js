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
        // Check for empty or invalid expressions
        if (!currentDisplay || /[+\-*/.]$/.test(currentDisplay)) {
            throw "Invalid expression";
        }
        
        // Check for division by zero
        if (currentDisplay.includes('/0') && !currentDisplay.includes('/0.')) {
            throw "Division by zero";
        }
        
        // Replace × and ÷ with * and / for eval
        const sanitized = currentDisplay.replace(/×/g, '*').replace(/÷/g, '/');
        const result = eval(sanitized);
        
        // Handle Infinity/NaN
        if (!isFinite(result)) {
            throw "Math error";
        }
        
        currentDisplay = result.toString();
    } catch (error) {
        currentDisplay = "Error"; // Or "Error6" if you prefer
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
    if (currentDisplay === "0") return; // Ignore if zero
    
    // If last character is an operator, don't toggle
    if (/[+\-*/]$/.test(currentDisplay)) return;
    
    // Toggle sign of the last number
    const parts = currentDisplay.split(/([+\-*/])/);
    const lastNum = parts.pop();
    parts.push(lastNum.startsWith('(-') ? lastNum.slice(2) : '(-' + lastNum);
    currentDisplay = parts.join('');
    updateDisplay();
}