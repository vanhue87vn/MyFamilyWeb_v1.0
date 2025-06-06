    const canvas = document.getElementById('game');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const finalScore = document.getElementById('finalScore');
        const gameOverScreen = document.getElementById('gameOver');
        const box = 20; // Kích thước ô vuông (20x20)
        let snake = [{x: 10 * box, y: 10 * box}]; // Bắt đầu ở giữa màn hình
        let food = generateFood();
        let direction = null;
        let nextDirection = null; // Để xử lý hướng đi mượt mà hơn
        let score = 0;
        let gameSpeed = 200; // 200ms = 5 lần/giây (tương đương 2 ô/giây khi di chuyển liên tục)
        let gameInterval;
        let gameActive = true;

        // Tạo thức ăn mới, đảm bảo không trùng với thân rắn
        function generateFood() {
            let newFood;
            do {
                newFood = {
                    x: Math.floor(Math.random() * (canvas.width / box)) * box,
                    y: Math.floor(Math.random() * (canvas.height / box)) * box
                };
            } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
            return newFood;
        }

        // Điều khiển
        document.addEventListener('keydown', (e) => {
            if (!gameActive) return;
            
            if (e.key === 'ArrowUp' && direction !== 'DOWN') nextDirection = 'UP';
            if (e.key === 'ArrowDown' && direction !== 'UP') nextDirection = 'DOWN';
            if (e.key === 'ArrowLeft' && direction !== 'RIGHT') nextDirection = 'LEFT';
            if (e.key === 'ArrowRight' && direction !== 'LEFT') nextDirection = 'RIGHT';
        });

        // Vẽ game
        function draw() {
            // Xóa canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Vẽ rắn
            snake.forEach((segment, index) => {
                ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A'; // Đầu màu xanh đậm, thân màu xanh nhạt
                ctx.fillRect(segment.x, segment.y, box-1, box-1);
                
                // Thêm mắt cho đầu rắn
                if (index === 0) {
                    ctx.fillStyle = 'white';
                    const eyeSize = box / 5;
                    if (direction === 'RIGHT' || direction === null) {
                        ctx.fillRect(segment.x + box - eyeSize*2, segment.y + eyeSize, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + box - eyeSize*2, segment.y + box - eyeSize*2, eyeSize, eyeSize);
                    } else if (direction === 'LEFT') {
                        ctx.fillRect(segment.x + eyeSize, segment.y + eyeSize, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + eyeSize, segment.y + box - eyeSize*2, eyeSize, eyeSize);
                    } else if (direction === 'UP') {
                        ctx.fillRect(segment.x + eyeSize, segment.y + eyeSize, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + box - eyeSize*2, segment.y + eyeSize, eyeSize, eyeSize);
                    } else if (direction === 'DOWN') {
                        ctx.fillRect(segment.x + eyeSize, segment.y + box - eyeSize*2, eyeSize, eyeSize);
                        ctx.fillRect(segment.x + box - eyeSize*2, segment.y + box - eyeSize*2, eyeSize, eyeSize);
                    }
                }
            });
            
            // Vẽ thức ăn (hình tròn)
            ctx.fillStyle = 'red';
            ctx.beginPath();
            ctx.arc(food.x + box/2, food.y + box/2, box/2 - 1, 0, Math.PI * 2);
            ctx.fill();
            
            // Vẽ lưới (tùy chọn)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 0.5;
            for (let i = 0; i < canvas.width; i += box) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(canvas.width, i);
                ctx.stroke();
            }
        }

        // Hiển thị màn hình kết thúc
        function showGameOver() {
            gameActive = false;
            finalScore.textContent = score;
            gameOverScreen.style.display = 'block';
        }

        // Khởi động lại game
        function restartGame() {
            snake = [{x: 10 * box, y: 10 * box}];
            food = generateFood();
            direction = null;
            nextDirection = null;
            score = 0;
            scoreDisplay.textContent = '0';
            gameSpeed = 200;
            gameActive = true;
            gameOverScreen.style.display = 'none';
            
            clearInterval(gameInterval);
            gameInterval = setInterval(gameLoop, gameSpeed);
        }

        // Game loop
        function gameLoop() {
            if (!gameActive) return;
            
            // Cập nhật hướng đi
            if (nextDirection) {
                direction = nextDirection;
                nextDirection = null;
            }
            
            // Nếu chưa có hướng đi thì không di chuyển
            if (!direction) {
                draw();
                return;
            }
            
            // Di chuyển rắn
            const head = {...snake[0]};
            if (direction === 'UP') head.y -= box;
            if (direction === 'DOWN') head.y += box;
            if (direction === 'LEFT') head.x -= box;
            if (direction === 'RIGHT') head.x += box;
            
            // Kiểm tra va chạm
            if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height || 
                snake.some(segment => segment.x === head.x && segment.y === head.y)) {
                clearInterval(gameInterval);
                showGameOver();
                return;
            }
            
            snake.unshift(head);
            
            // Ăn thức ăn
            if (head.x === food.x && head.y === food.y) {
                score++;
                scoreDisplay.textContent = score;
                food = generateFood();
                
                // Tăng tốc độ khi đạt điểm nhất định
                if (score % 5 === 0 && gameSpeed > 100) {
                    gameSpeed -= 10;
                    clearInterval(gameInterval);
                    gameInterval = setInterval(gameLoop, gameSpeed);
                }
            } else {
                snake.pop();
            }
            
            draw();
        }

        // Bắt đầu game
        gameInterval = setInterval(gameLoop, gameSpeed);

        // Xử lý phím F5
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F5') {
                e.preventDefault(); // Ngăn hành động mặc định của F5 (refresh trang)
                restartGame();
            }
        });