    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startGameBtn');
    const difficultySelect = document.getElementById('difficulty');
    const preGameScore = document.getElementById('preGameScore');
    const scoreBoard = document.getElementById('scoreBoard');

    let paddle = {
      x: canvas.width / 2 - 50,
      y: canvas.height - 20,
      width: 100,
      height: 10,
      dx: 0,
      speed: 7
    };

    let balls = [];
    let score = 0;
    let highScore = localStorage.getItem('highScore') || 0;
    let gameInterval;
    let gameRunning = false;
    let difficulty = 'trungbinh';
    let scoreToAddBall = 10;

    const paddleSound = new Audio('https://www.soundjay.com/button/beep-07.wav');
    const scoreSound = new Audio('https://www.soundjay.com/button/beep-10.wav');

    function drawPaddle() {
      ctx.fillStyle = '#0ff';
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function drawBall(ball) {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0ff';
      ctx.fill();
      ctx.closePath();
    }

    function movePaddle() {
      paddle.x += paddle.dx;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }

    function moveBalls() {
      balls.forEach(ball => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Wall collision
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
          ball.dx *= -1;
        }
        if (ball.y - ball.radius < 0) {
          ball.dy *= -1;
        }

        // Paddle collision
        if (
          ball.y + ball.radius > paddle.y &&
          ball.x > paddle.x &&
          ball.x < paddle.x + paddle.width
        ) {
          ball.dy *= -1;
          paddleSound.play();
          // Paddle glow effect
          canvas.classList.add('glow');
          setTimeout(() => canvas.classList.remove('glow'), 100);
        }

        // Bottom collision
        if (ball.y - ball.radius > canvas.height) {
          balls.splice(balls.indexOf(ball), 1);
          if (balls.length === 0) {
            endGame();
          }
        }
      });
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawPaddle();
      balls.forEach(drawBall);
    }

    function update() {
      movePaddle();
      moveBalls();
      draw();
      updateScoreBoard();
    }

    function gameLoop() {
      update();
      if (gameRunning) {
        requestAnimationFrame(gameLoop);
      }
    }

    function startGame() {
      paddle.x = canvas.width / 2 - 50;
      balls = [{
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: 3,
        dy: -3,
        radius: 8
      }];
      score = 0;
      gameRunning = true;
      difficulty = difficultySelect.value;
      switch (difficulty) {
        case 'de':
          scoreToAddBall = 20;
          break;
        case 'trungbinh':
          scoreToAddBall = 10;
          break;
        case 'kho':
          scoreToAddBall = 5;
          break;
        case 'ratkho':
          scoreToAddBall = 2;
          break;
        case 'thientai':
          scoreToAddBall = 1;
          break;
      }
      preGameScore.textContent = `Điểm: 0 | Kỷ lục: ${highScore}`;
      gameLoop();
    }

    function endGame() {
      gameRunning = false;
      if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
      }
      preGameScore.textContent = `Điểm: 0 | Kỷ lục: ${highScore}`;
      alert('Game Over!');
    }

    function updateScoreBoard() {
      scoreBoard.textContent = `Điểm: ${score} | Kỷ lục: ${highScore}`;
    }

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') {
        paddle.dx = -paddle.speed;
      } else if (e.key === 'ArrowRight') {
        paddle.dx = paddle.speed;
      }
    });

    document.addEventListener('keyup', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        paddle.dx = 0;
      }
    });

    startBtn.addEventListener('click', () => {
      startGame();
    });

    // Increase score and add balls based on difficulty
    setInterval(() => {
      if (gameRunning) {
        score++;
        if (score % scoreToAddBall === 0) {
          balls.push({
            x: canvas.width / 2,
            y: canvas.height / 2,
            dx: 3 * (Math.random() > 0.5 ? 1 : -1),
            dy: -3,
            radius: 8
          });
          scoreSound.play();
        }
      }
    }, 1000);

    // Initialize high score display
    preGameScore.textContent = `Điểm: 0 | Kỷ lục: ${highScore}`;
    scoreBoard.textContent = `Điểm: 0 | Kỷ lục: ${highScore}`;
    // Add glow effect to canvas
    canvas.classList.add('glow');   