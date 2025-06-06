        function getRandomHiragana() {
            const range = hiraganaRanges[Math.floor(Math.random() * hiraganaRanges.length)];
            return String.fromCharCode(
                Math.floor(Math.random() * (range.end - range.start + 1)) + range.start
            );
        }

        function updateDisplay() {
            // Cập nhật lịch sử
            const historyHTML = charHistory.map(char => `
                <div class="history-item">
                    ${char}
                    <div class="count-badge">${charStatistics[char]}</div>
                </div>
            `).join('');
            document.getElementById('historyContainer').innerHTML = historyHTML;
        }

        function generateNewCharacter() {
            // Bắt đầu đồng hồ
            if (!timerRunning) {
                timerRunning = true;
                startTimestamp = Date.now() - currentTimer;
                requestAnimationFrame(updateTimer);
            }

            // Tạo ký tự mới
            const newChar = getRandomHiragana();
            
            // Cập nhật thống kê
            charStatistics[newChar] = (charStatistics[newChar] || 0) + 1;
            charHistory.unshift(newChar);

            // Hiển thị
            document.getElementById('main-character').textContent = newChar;
            updateDisplay();
        }

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
            charHistory = [];
            charStatistics = {};
            document.getElementById('main-character').textContent = '?';
            document.getElementById('timer').textContent = '00:00:00';
            updateDisplay();
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