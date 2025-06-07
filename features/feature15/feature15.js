const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const difficultySelect = document.getElementById('difficulty');
const startGameBtn = document.getElementById('startGameBtn');
const scoreDisplay = document.getElementById('score');
const gameOverDisplay = document.getElementById('gameOver');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');
const toggleMusicBtn = document.getElementById('toggleMusicBtn');

const bounceSound = document.getElementById('bounceSound');
const gameOverSound = document.getElementById('gameOverSound');
const bgMusic = document.getElementById('bgMusic');

let balls = [];
let paddle = {
  width: 160,
  height: 20,
  x: (canvas.width - 160) / 2,
  y: canvas.height - 50,
  dx: 0,
  speed: 10
};
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let isGameOver = false;
let musicStarted = false;
let lastAddedBallScore = 0;
let difficulty = 'trungbinh';

const difficultySettings = {
  de: 20,
  trungbinh: 10,
  kho: 5,
  ratkho: 2,
  thientai: 1
};

function createBall() {
  return {
    x: Math.random() * (canvas.width - 50) + 25,
    y: canvas.height / 2,
    radius: 20,
    dx: (Math.random() > 0.5 ? 1 : -1) * (6 + Math.random() * 3),
    dy: -6,
  };
}

function resetGame() {
  balls = [createBall()];
  score = 0;
  lastAddedBallScore = 0;
  isGameOver = false;
  paddle.x = (canvas.width - paddle.width) / 2;
  updateScore();
  gameOverDisplay.style.display = 'none';
  restartBtn.style.display = 'none';
  homeBtn.style.display = 'none';
  toggleMusicBtn.style.display = 'block';
  requestAnimationFrame(update);
}

function updateScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  scoreDisplay.textContent = `Điểm: ${score} | Kỷ lục: ${highScore}`;
}

function drawPaddle() {
  ctx.shadowColor = '#ff00ff';
  ctx.shadowBlur = 30;
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  ctx.shadowBlur = 0;
}

function drawBalls() {
  balls.forEach(ball => {
    const gradient = ctx.createRadialGradient(
      ball.x, ball.y, ball.radius / 3,
      ball.x, ball.y, ball.radius
    );
    gradient.addColorStop(0, '#0ff');
    gradient.addColorStop(1, 'rgba(0,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 25;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
}

function movePaddle() {
  paddle.x += paddle.dx;
  if (paddle.x < 0) paddle.x = 0;
  if (paddle.x + paddle.width > canvas.width)
    paddle.x = canvas.width - paddle.width;
}

function update() {
  if (isGameOver) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddle();
  drawBalls();
  movePaddle();

  balls.forEach((ball, index) => {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width)
      ball.dx = -ball.dx;
    if (ball.y - ball.radius < 0)
      ball.dy = -ball.dy;

    // Va chạm với paddle
    if (
      ball.y + ball.radius >= paddle.y &&
      ball.y + ball.radius <= paddle.y + paddle.height &&
      ball.x > paddle.x &&
      ball.x < paddle.x + paddle.width
    ) {
      ball.dy = -Math.abs(ball.dy);
      bounceSound.play();

      // Tăng điểm + cập nhật điểm
      score++;
      updateScore();

      // Tăng tốc bóng theo điểm
      ball.dx *= 1.05;
      ball.dy *= 1.05;

      // Check điểm để thêm bóng mới theo độ khó
      const addBallThreshold = difficultySettings[difficulty];
      if (score - lastAddedBallScore >= addBallThreshold) {
        balls.push(createBall());
        lastAddedBallScore = score;
      }
    }

    // Bóng rơi dưới màn hình thì game over
    if (ball.y - ball.radius > canvas.height) {
      gameOver();
    }
  });

  requestAnimationFrame(update);
}

function gameOver() {
  isGameOver = true;
  gameOverDisplay.style.display = 'block';
  restartBtn.style.display = 'inline-block';
  homeBtn.style.display = 'inline-block';
  toggleMusicBtn.style.display = 'none';
  gameOverSound.play();
}

// Bắt sự kiện bàn phím để điều khiển paddle
document.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft') {
    paddle.dx = -paddle.speed;
  } else if (e.code === 'ArrowRight') {
    paddle.dx = paddle.speed;
  }
});

document.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') {
    paddle.dx = 0;
  }
});

// Bật/tắt nhạc nền
toggleMusicBtn.addEventListener('click', () => {
  if (!musicStarted) {
    bgMusic.volume = 0.3;
    bgMusic.play();
    musicStarted = true;
    toggleMusicBtn.textContent = '🔊';
  } else if (bgMusic.paused) {
    bgMusic.play();
    toggleMusicBtn.textContent = '🔊';
  } else {
    bgMusic.pause();
    toggleMusicBtn.textContent = '🔈';
  }
});

// Bắt đầu game từ menu chọn độ khó
startGameBtn.addEventListener('click', () => {
  difficulty = difficultySelect.value;
  document.getElementById('difficultySelect').style.display = 'none';
  scoreDisplay.style.display = 'block';
  resetGame();
});

// Xử lý nút chơi lại
restartBtn.addEventListener('click', () => {
  resetGame();
  scoreDisplay.style.display = 'block';
  gameOverDisplay.style.display = 'none';
  restartBtn.style.display = 'none';
  homeBtn.style.display = 'none';
  toggleMusicBtn.style.display = 'block';
});

// Xử lý nút về trang chủ
homeBtn.addEventListener('click', () => {
  isGameOver = false;
  balls = [];
  score = 0;
  lastAddedBallScore = 0;
  scoreDisplay.style.display = 'none';
  gameOverDisplay.style.display = 'none';
  restartBtn.style.display = 'none';
  homeBtn.style.display = 'none';
  toggleMusicBtn.style.display = 'none';
  document.getElementById('difficultySelect').style.display = 'block';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
});