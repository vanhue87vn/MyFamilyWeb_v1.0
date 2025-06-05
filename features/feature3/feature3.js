        // Khởi tạo canvas
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Cấu hình game
        const config = {
            botCount: 455,
            initialPlayerSize: 30,
            sizePerBot: 1,
            minBotSize: 10,
            maxBotSize: 25,
            minBotSpeed: 1,
            maxBotSpeed: 3,
            playerSpeed: 5
        };

        // Nhân vật hình vuông của người chơi
        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            size: config.initialPlayerSize,
            color: '#00FF00',
            score: 0
        };

        // Tạo 455 bot hình tròn
        const bots = [];
        for (let i = 0; i < config.botCount; i++) {
            bots.push(createBot());
        }

        function createBot() {
            const size = config.minBotSize + Math.random() * (config.maxBotSize - config.minBotSize);
            return {
                x: Math.random() * (canvas.width - size * 2) + size,
                y: Math.random() * (canvas.height - size * 2) + size,
                radius: size,
                dx: (Math.random() - 0.5) * (config.minBotSpeed + Math.random() * (config.maxBotSpeed - config.minBotSpeed)),
                dy: (Math.random() - 0.5) * (config.minBotSpeed + Math.random() * (config.maxBotSpeed - config.minBotSpeed)),
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            };
        }

        // Điều khiển
        const keys = {};
        window.addEventListener('keydown', (e) => {
            keys[e.key] = true;
        });
        window.addEventListener('keyup', (e) => {
            keys[e.key] = false;
        });

        // Vẽ nhân vật hình vuông
        function drawPlayer() {
            ctx.fillStyle = player.color;
            ctx.shadowColor = player.color;
            ctx.shadowBlur = 15;
            ctx.fillRect(
                player.x - player.size/2, 
                player.y - player.size/2, 
                player.size, 
                player.size
            );
            ctx.shadowBlur = 0;
        }

        // Vẽ bot hình tròn
        function drawBot(bot) {
            ctx.beginPath();
            ctx.arc(bot.x, bot.y, bot.radius, 0, Math.PI * 2);
            ctx.fillStyle = bot.color;
            ctx.fill();
            ctx.closePath();
        }

        // Kiểm tra va chạm giữa hình vuông và hình tròn
        function checkCollision(squareX, squareY, squareSize, circleX, circleY, circleRadius) {
            // Tìm điểm gần nhất trên hình vuông so với hình tròn
            const closestX = Math.max(squareX - squareSize/2, Math.min(circleX, squareX + squareSize/2));
            const closestY = Math.max(squareY - squareSize/2, Math.min(circleY, squareY + squareSize/2));
            
            // Tính khoảng cách từ điểm đó đến tâm hình tròn
            const distanceX = circleX - closestX;
            const distanceY = circleY - closestY;
            
            return (distanceX * distanceX + distanceY * distanceY) < (circleRadius * circleRadius);
        }

        // Di chuyển nhân vật
        function movePlayer() {
            if (keys['ArrowUp'] || keys['w']) player.y -= config.playerSpeed;
            if (keys['ArrowDown'] || keys['s']) player.y += config.playerSpeed;
            if (keys['ArrowLeft'] || keys['a']) player.x -= config.playerSpeed;
            if (keys['ArrowRight'] || keys['d']) player.x += config.playerSpeed;
            
            // Giới hạn trong màn hình
            player.x = Math.max(player.size/2, Math.min(canvas.width - player.size/2, player.x));
            player.y = Math.max(player.size/2, Math.min(canvas.height - player.size/2, player.y));
        }

        // Di chuyển bot
        function moveBots() {
            bots.forEach(bot => {
                // Di chuyển bot
                bot.x += bot.dx;
                bot.y += bot.dy;
                
                // Đổi hướng khi chạm biên
                if (bot.x < bot.radius || bot.x > canvas.width - bot.radius) {
                    bot.dx = -bot.dx;
                    bot.x = Math.max(bot.radius, Math.min(canvas.width - bot.radius, bot.x));
                }
                if (bot.y < bot.radius || bot.y > canvas.height - bot.radius) {
                    bot.dy = -bot.dy;
                    bot.y = Math.max(bot.radius, Math.min(canvas.height - bot.radius, bot.y));
                }
                
                // Tránh nhân vật nếu nhỏ hơn
                if (bot.radius < player.size/2) {
                    const distX = player.x - bot.x;
                    const distY = player.y - bot.y;
                    const distance = Math.sqrt(distX * distX + distY * distY);
                    
                    if (distance < player.size) {
                        const angle = Math.atan2(distY, distX);
                        bot.dx = -Math.cos(angle) * bot.dx;
                        bot.dy = -Math.sin(angle) * bot.dy;
                    }
                }
            });
        }

        // Kiểm tra ăn bot
        function checkEatBots() {
            for (let i = bots.length - 1; i >= 0; i--) {
                const bot = bots[i];
                if (checkCollision(player.x, player.y, player.size, bot.x, bot.y, bot.radius)) {
                    // Chỉ ăn được bot nhỏ hơn
                    if (bot.radius < player.size/2) {
                        // Tăng kích thước nhân vật
                        player.size += config.sizePerBot;
                        player.score++;
                        
                        // Xóa bot
                        bots.splice(i, 1);
                        
                        // Cập nhật UI
                        document.getElementById('botCount').textContent = bots.length;
                        document.getElementById('size').textContent = Math.floor(player.size);
                    }
                }
            }
            
            // Kiểm tra chiến thắng
            if (bots.length === 0) {
                document.getElementById('gameOver').style.display = 'block';
            }
        }

        // Game loop
        function gameLoop() {
            // Xóa màn hình
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Di chuyển
            movePlayer();
            moveBots();
            
            // Kiểm tra va chạm
            checkEatBots();
            
            // Vẽ
            bots.forEach(drawBot);
            drawPlayer();
            
            // Lặp lại
            requestAnimationFrame(gameLoop);
        }

        // Xử lý thay đổi kích thước màn hình
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });

        // Bắt đầu game
        gameLoop();