        function getRandomHiragana() {
            const range = hiraganaRanges[Math.floor(Math.random() * hiraganaRanges.length)];
            return String.fromCharCode(
                Math.floor(Math.random() * (range.end - range.start + 1)) + range.start
            );
        }

function updateDisplay() {
    if (timerRunning) {
        currentTimer = Date.now() - startTimestamp;
        const seconds = (currentTimer / 1000).toFixed(2);
        document.getElementById('timerDisplay').textContent = `Timer: ${seconds} seconds`;
        requestAnimationFrame(updateDisplay);
    }
}

// Initialize timer variables
let timerRunning = false;
let startTimestamp = 0;
let currentTimer = 0;

// Function to generate a new character and start the timer
function generateNewCharacter() {
    if (!timerRunning) {
        timerRunning = true;
        startTimestamp = Date.now();
        requestAnimationFrame(updateDisplay); // Assuming updateDisplay is the intended function
        // Generate a character
        const characterName = `Character_${Math.floor(Math.random() * 1000)}`;
        document.getElementById('characterDisplay').textContent = `Generated: ${characterName}`;
    }
}

// Example updateTimer function for animation loop
function updateTimer(timestamp) {
    if (timerRunning) {
        currentTimer = Date.now() - startTimestamp; // Update elapsed time
        console.log(`Timer: ${currentTimer / 1000} seconds`); // Example output
        // Add logic to update game state or UI
        requestAnimationFrame(updateTimer); // Continue the loop
    }
}

// Tạo ký tự mới
const newChar = getRandomHiragana();

// Cập nhật thống kê
charStatistics[newChar] = (charStatistics[newChar] || 0) + 1;
            charHistory.unshift(newChar);

            // Hiển thị
            document.getElementById('main-character').textContent = newChar;
        updateDisplay();

        function updateTimer() {
            if (timerRunning) {
                currentTimer = Date.now() - startTimestamp;
                const totalSeconds = Math.floor(currentTimer / 1000);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;
                
                document.getElementById('timer').textContent = 
                    `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
                
                requestAnimationFrame(updateTimer);
            }
        }

function resetAll() {
    timerRunning = false;
    currentTimer = 0;
    document.getElementById('timerDisplay').textContent = 'Timer: 00:00:00';
    document.getElementById('characterDisplay').textContent = 'No character generated';
    updateDisplay(); // This might be unnecessary if timer is stopped, but included for completeness
}

        function pad(num) {
            return num.toString().padStart(2, '0');
        }
        document.addEventListener('DOMContentLoaded', () => {
            // Khởi tạo lịch sử và thống kê
            charHistory = [];
            charStatistics = {};
            updateDisplay();
        });