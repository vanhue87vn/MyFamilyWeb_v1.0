// Tạo bài toán mới
function generateNewProblem() {
    operator = Math.random() < 0.5 ? '+' : '-';
    
    // Điều chỉnh độ khó dựa trên điểm số
    currentDifficulty = Math.min(Math.floor(totalPoints / 100) + 1, 5);
    const baseRange = Math.min(100 * currentDifficulty, 900); // Giới hạn tối đa 900
    
    if (operator === '+') {
        num1 = Math.floor(Math.random() * baseRange) + 1; // 1-900
        const maxNum2 = 1000 - num1;
        num2 = Math.floor(Math.random() * Math.min(baseRange, maxNum2)) + 1; // Đảm bảo tổng ≤ 1000
        correctAnswer = num1 + num2;
    } else {
        num1 = Math.floor(Math.random() * baseRange) + 100; // 100-999
        num2 = Math.floor(Math.random() * (num1 - 1)) + 1; // Đảm bảo kết quả dương
        correctAnswer = num1 - num2;
    }
    
    // Phần còn lại giữ nguyên
    problemEl.textContent = `${num1} ${operator} ${num2} = ?`;
    answerEl.value = '';
    answerEl.className = 'answer';
    answerEl.disabled = false;
    resultEl.textContent = '';
    answerEl.focus();
    alreadyAnswered = false;
    remainingAttempts = 3;
    attemptsEl.textContent = remainingAttempts;
    
    if (!timerInterval) {
        startTimer();
    }
}