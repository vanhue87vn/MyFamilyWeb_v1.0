let score = 0;
const totalProblems = 20;

// Tạo bài tập khi trang được tải
window.onload = function() {
    generateProblems();
};

function generateProblems() {
    generateAdditionNoCarry();
    generateAdditionWithCarry();
    generateSubtractionNoBorrow();
    generateSubtractionWithBorrow();
}

function generateAdditionNoCarry() {
    const container = document.getElementById('additionNoCarry');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        let a, b;
        // Đảm bảo không có nhớ (tổng các chữ số < 10)
        do {
            a = Math.floor(Math.random() * 50) + 1;
            b = Math.floor(Math.random() * 50) + 1;
        } while ((a % 10) + (b % 10) >= 10 || a + b > 100);
        
        createProblem(container, a, '+', b);
    }
}

function generateAdditionWithCarry() {
    const container = document.getElementById('additionWithCarry');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        let a, b;
        // Đảm bảo có nhớ (tổng các chữ số >= 10)
        do {
            a = Math.floor(Math.random() * 50) + 30;
            b = Math.floor(Math.random() * 50) + 30;
        } while ((a % 10) + (b % 10) < 10 || a + b > 100);
        
        createProblem(container, a, '+', b);
    }
}

function generateSubtractionNoBorrow() {
    const container = document.getElementById('subtractionNoBorrow');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        let a, b;
        // Đảm bảo không có nhớ (chữ số bị trừ >= chữ số trừ)
        do {
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * (a - 1)) + 1;
        } while ((a % 10) < (b % 10));
        
        createProblem(container, a, '-', b);
    }
}

function generateSubtractionWithBorrow() {
    const container = document.getElementById('subtractionWithBorrow');
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        let a, b;
        // Đảm bảo có nhớ (chữ số bị trừ < chữ số trừ)
        do {
            a = Math.floor(Math.random() * 90) + 10;
            b = Math.floor(Math.random() * (a - 1)) + 1;
        } while ((a % 10) >= (b % 10));
        
        createProblem(container, a, '-', b);
    }
}

function createProblem(container, a, operator, b) {
    const problemDiv = document.createElement('div');
    problemDiv.className = 'exercise';
    
    const problemText = document.createElement('div');
    problemText.className = 'problem';
    problemText.innerHTML = `${a} ${operator} ${b} = `;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.dataset.a = a;
    input.dataset.operator = operator;
    input.dataset.b = b;
    input.dataset.correct = operator === '+' ? a + b : a - b;
    
    const feedback = document.createElement('span');
    feedback.className = 'feedback';
    
    problemText.appendChild(input);
    problemText.appendChild(feedback);
    problemDiv.appendChild(problemText);
    container.appendChild(problemDiv);
}

function checkAnswers() {
    score = 0;
    const inputs = document.querySelectorAll('input');
    const feedbacks = document.querySelectorAll('.feedback');
    
    inputs.forEach((input, index) => {
        const userAnswer = parseInt(input.value);
        const correctAnswer = parseInt(input.dataset.correct);
        const feedback = feedbacks[index];
        
        if (isNaN(userAnswer)) {
            feedback.textContent = 'Chưa nhập đáp án';
            feedback.className = 'feedback incorrect';
            return;
        }
        
        if (userAnswer === correctAnswer) {
            score++;
            feedback.textContent = 'Đúng!';
            feedback.className = 'feedback correct';
        } else {
            feedback.textContent = `Sai! Đáp án đúng là ${correctAnswer}`;
            feedback.className = 'feedback incorrect';
        }
    });
    
    document.getElementById('totalScore').textContent = score;
}

function generateNewProblems() {
    // Xóa tất cả phản hồi
    document.querySelectorAll('.feedback').forEach(fb => {
        fb.textContent = '';
        fb.className = 'feedback';
    });
    
    // Đặt lại điểm
    document.getElementById('totalScore').textContent = '0';
    
    // Tạo bài tập mới
    generateProblems();
    
    // Xóa tất cả giá trị nhập
    document.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
}