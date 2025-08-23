const words = {
    easy: ['cat', 'dog', 'sun', 'moon', 'star', 'tree', 'bird', 'fish'],
    medium: ['computer', 'keyboard', 'monitor', 'internet', 'software', 'network'],
    hard: ['international', 'programming', 'algorithmic', 'cryptography', 'authentication', 'sophisticated']
};

let currentWord = '';
let score = 0;
let timeLeft = 0;
let totalTyped = 0;
let correctTyped = 0;
let timer;
let isGameRunning = false;

const wordDisplay = document.getElementById('word-display');
const userInput = document.getElementById('user-input');
const scoreDisplay = document.getElementById('score');
const timeDisplay = document.getElementById('time');
const accuracyDisplay = document.getElementById('accuracy');
const levelSelect = document.getElementById('level');
const startBtn = document.getElementById('start-btn');
const gameArea = document.getElementById('game');
const levelSelection = document.getElementById('level-selection');
const resultArea = document.getElementById('result');
const finalScore = document.getElementById('final-score');
const finalAccuracy = document.getElementById('final-accuracy');
const restartBtn = document.getElementById('restart-btn');
const backBtn = document.getElementById('back-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');

function getRandomWord(level) {
    const wordList = words[level];
    return wordList[Math.floor(Math.random() * wordList.length)];
}

function startGame() {
    const level = levelSelect.value;
    score = 0;
    totalTyped = 0;
    correctTyped = 0;
    timeLeft = level === 'easy' ? 60 : level === 'medium' ? 45 : 30;
    isGameRunning = true;

    levelSelection.style.display = 'none';
    gameArea.style.display = 'block';
    resultArea.style.display = 'none';
    userInput.value = '';
    userInput.focus();

    updateStats();
    nextWord();
    startTimer();
}

function nextWord() {
    currentWord = getRandomWord(levelSelect.value);
    wordDisplay.textContent = currentWord;
    userInput.value = '';
}

function updateStats() {
    scoreDisplay.textContent = score;
    timeDisplay.textContent = timeLeft;
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctTyped / totalTyped) * 100);
    accuracyDisplay.textContent = `${accuracy}%`;
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft;
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(timer);
    isGameRunning = false;
    gameArea.style.display = 'none';
    resultArea.style.display = 'block';
    finalScore.textContent = score;
    const accuracy = totalTyped === 0 ? 100 : Math.round((correctTyped / totalTyped) * 100);
    finalAccuracy.textContent = `${accuracy}%`;
}

function backToMenu() {
    clearInterval(timer);
    isGameRunning = false;
    gameArea.style.display = 'none';
    resultArea.style.display = 'none';
    levelSelection.style.display = 'block';
}

userInput.addEventListener('input', () => {
    if (!isGameRunning) return;

    const typedWord = userInput.value.trim();
    if (typedWord === currentWord) {
        score += levelSelect.value === 'easy' ? 10 : levelSelect.value === 'medium' ? 20 : 30;
        correctTyped++;
        totalTyped++;
        updateStats();
        nextWord();
    } else if (typedWord.length >= currentWord.length) {
        totalTyped++;
        updateStats();
        nextWord();
    }
});

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);
backBtn.addEventListener('click', backToMenu);
backToMenuBtn.addEventListener('click', backToMenu);