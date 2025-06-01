// Game configuration
const config = {
    gridSize: 5, // 4x4 grid
    initialTime: 10,
    maxMistakes: 3,
    timeDecreasePerLevel: 2,
    baseScorePerCorrect: 10
};

// Game elements
const elements = {
    hiraganaBoard: document.getElementById('hiraganaBoard'),
    ball: document.getElementById('ball'),
    romajiDisplay: document.getElementById('romaji'), // Thêm hiển thị romaji
    message: document.getElementById('message'),
    timeDisplay: document.getElementById('time'),
    scoreDisplay: document.getElementById('score'),
    mistakesDisplay: document.getElementById('mistakes'),
    progressBar: document.getElementById('progress'),
    gameOverScreen: document.getElementById('gameOver'),
    finalScoreDisplay: document.getElementById('finalScore'),
    finalLevelDisplay: document.getElementById('finalLevel'),
    restartButton: document.getElementById('restartButton')
};

// Game state
let state = {
    currentCharacter: null, // Giờ sẽ lưu cả object character
    score: 0,
    level: 1,
    timeLeft: config.initialTime,
    mistakes: 0,
    timer: null,
    gameActive: true,
    roundActive: true,
    cells: [],
    hiraganaData: []
};

// Initialize the game
async function initGame() {
    try {
        // Load hiragana data from JSON
        const response = await fetch('../../data/JSON/hiragana-basic.json');
        const data = await response.json();
        
        // Lọc bỏ các ký tự trong ngoặc đơn (nếu muốn)
        state.hiraganaData = data.filter(item => !item.character.startsWith('('));
        
        resetGameState();
        setupEventListeners();
        startNewRound();
    } catch (error) {
        console.error('Error loading hiragana data:', error);
        elements.message.textContent = 'Error loading game data. Please try again.';
    }
}

function resetGameState() {
    state.gameActive = true;
    state.roundActive = true;
    clearInterval(state.timer);
    state.timeLeft = Math.max(10, config.initialTime - (state.level * config.timeDecreasePerLevel));
    state.mistakes = 0;
    updateDisplays();
}

function setupEventListeners() {
    // Ball drag and drop
    elements.ball.addEventListener('dragstart', handleDragStart);
    
    // Restart button
    elements.restartButton.addEventListener('click', initGame);
    
    // Prevent default drag behavior
    document.addEventListener('dragover', (e) => e.preventDefault());
    document.addEventListener('drop', (e) => e.preventDefault());
}

function startNewRound() {
    state.roundActive = true;
    clearInterval(state.timer);
    updateDisplays();
    
    // Clear the board
    elements.hiraganaBoard.innerHTML = '';
    state.cells = [];
    
    // Create 4x4 grid
    const totalCells = config.gridSize * config.gridSize;
    const selectedCharacters = getRandomCharacters(totalCells);
    
    // Display cells
    selectedCharacters.forEach(char => {
        const cell = document.createElement('div');
        cell.className = 'hiragana-cell';
        cell.textContent = char.character;
        cell.dataset.character = char.character;
        cell.dataset.romaji = char.romaji;
        
        // Add event listeners
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => handleAnswer(e, cell));
        cell.addEventListener('click', () => handleAnswer(null, cell));
        
        elements.hiraganaBoard.appendChild(cell);
        state.cells.push(cell);
    });
    
    // Set random character for the ball
    const randomIndex = Math.floor(Math.random() * totalCells);
    state.currentCharacter = selectedCharacters[randomIndex];
    elements.ball.textContent = state.currentCharacter.character;
    
    // Hiển thị romaji tương ứng
    if (elements.romajiDisplay) {
        elements.romajiDisplay.textContent = state.currentCharacter.romaji;
    }
    
    // Start timer
    state.timer = setInterval(updateTimer, 100);
    
    // Update message
    elements.message.textContent = `Find: ${state.currentCharacter.character}`;
    elements.message.style.color = '#2d3436';
}

function getRandomCharacters(count) {
    const shuffled = [...state.hiraganaData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function handleDragStart(e) {
    if (!state.gameActive || !state.roundActive) {
        e.preventDefault();
        return;
    }
    e.dataTransfer.setData('text/plain', state.currentCharacter.character);
}

function handleAnswer(e, cell) {
    if (e) e.preventDefault();
    if (!state.gameActive || !state.roundActive) return;
    
    const selectedCharacter = cell.dataset.character;
    
    if (selectedCharacter === state.currentCharacter.character) {
        // Correct answer
        cell.classList.add('correct');
        state.score += config.baseScorePerCorrect * state.level;
        updateDisplays();
        
        // Check for level up
        const newLevel = Math.floor(state.score / 100) + 1;
        if (newLevel > state.level) {
            state.level = newLevel;
            elements.message.textContent = `Level Up! Now level ${state.level}`;
        } else {
            elements.message.textContent = `Correct! +${config.baseScorePerCorrect * state.level} points`;
        }
        
        endRound(true);
    } else {
        // Wrong answer
        cell.classList.add('wrong');
        state.mistakes++;
        updateDisplays();
        
        // Lock cell temporarily
        cell.style.pointerEvents = 'none';
        setTimeout(() => {
            cell.style.pointerEvents = 'auto';
            cell.classList.remove('wrong');
        }, 1000);
        
        // Penalty
        state.timeLeft = Math.max(1, state.timeLeft - 2);
        
        // Check mistakes
        if (state.mistakes >= config.maxMistakes) {
            endGame();
            return;
        }
        
        elements.message.textContent = 'Wrong! Try again';
    }
}

function updateTimer() {
    if (!state.gameActive || !state.roundActive) return;
    
    state.timeLeft -= 0.1;
    updateDisplays();
    
    // Update progress bar
    const maxTime = config.initialTime - (state.level * config.timeDecreasePerLevel);
    const percentage = (state.timeLeft / maxTime) * 100;
    elements.progressBar.style.width = `${Math.max(0, percentage)}%`;
    
    if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        state.mistakes++;
        updateDisplays();
        
        if (state.mistakes >= config.maxMistakes) {
            endGame();
        } else {
            endRound(false);
        }
    }
}

function updateDisplays() {
    elements.timeDisplay.textContent = Math.max(0, Math.ceil(state.timeLeft));
    elements.scoreDisplay.textContent = state.score;
    elements.mistakesDisplay.textContent = `${state.mistakes}/${config.maxMistakes}`;
}

function endRound(success) {
    state.roundActive = false;
    clearInterval(state.timer);
    
    if (!success) {
        elements.message.textContent = `Time's up! ${config.maxMistakes - state.mistakes} mistakes left`;
        
        // Highlight correct answer
        state.cells.forEach(cell => {
            if (cell.dataset.hiragana === state.currentHiragana) {
                cell.classList.add('correct');
            }
        });
    }
    
    setTimeout(() => {
        if (state.gameActive) {
            resetGameState();
            startNewRound();
        }
    }, success ? 1500 : 3000);
}

function endGame() {
    state.gameActive = false;
    state.roundActive = false;
    clearInterval(state.timer);
    
    elements.finalScoreDisplay.textContent = state.score;
    elements.finalLevelDisplay.textContent = state.level;
    elements.gameOverScreen.style.display = 'flex';
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);