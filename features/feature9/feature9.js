        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreElement = document.getElementById('score');
        const instructionsElement = document.getElementById('instructions');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Game variables
        let gameRunning = false;
        let score = 0;
        let speed = 3;
        
        // Player ball
        const player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            radius: 20,
            color: '#3498db',
            dx: 0,
            dy: 0,
            speed: 5
        };
        
        // Obstacles
        let obstacles = [];
        
        // Keys
        const keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            a: false,
            s: false,
            d: false
        };
        
        // Event listeners
        window.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
            }
        });
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
        
        canvas.addEventListener('click', () => {
            if (!gameRunning) {
                startGame();
            }
        });
        
        function startGame() {
            gameRunning = true;
            score = 0;
            speed = 3;
            player.x = canvas.width / 2;
            player.y = canvas.height / 2;
            obstacles = [];
            instructionsElement.style.display = 'none';
            scoreElement.textContent = 'Score: 0';
            animate();
        }
        
        function createObstacle() {
            const size = Math.random() * 30 + 20;
            let x, y;
            
            // Place obstacle outside canvas
            if (Math.random() < 0.5) {
                x = Math.random() < 0.5 ? -size : canvas.width + size;
                y = Math.random() * canvas.height;
            } else {
                x = Math.random() * canvas.width;
                y = Math.random() < 0.5 ? -size : canvas.height + size;
            }
            
            obstacles.push({
                x: x,
                y: y,
                radius: size,
                color: '#e74c3c',
                dx: (canvas.width/2 - x) / 100 * speed,
                dy: (canvas.height/2 - y) / 100 * speed
            });
        }
        
        function updatePlayer() {
            // Reset movement
            player.dx = 0;
            player.dy = 0;
            
            // Handle key presses
            if (keys.ArrowUp || keys.w) player.dy = -player.speed;
            if (keys.ArrowDown || keys.s) player.dy = player.speed;
            if (keys.ArrowLeft || keys.a) player.dx = -player.speed;
            if (keys.ArrowRight || keys.d) player.dx = player.speed;
            
            // Normalize diagonal movement
            if (player.dx !== 0 && player.dy !== 0) {
                player.dx *= 0.7071;
                player.dy *= 0.7071;
            }
            
            // Update position with bounds checking
            player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x + player.dx));
            player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y + player.dy));
        }
        
        function updateObstacles() {
            // Create new obstacles occasionally
            if (Math.random() < 0.02) {
                createObstacle();
            }
            
            // Update obstacle positions
            for (let i = obstacles.length - 1; i >= 0; i--) {
                const obs = obstacles[i];
                obs.x += obs.dx;
                obs.y += obs.dy;
                
                // Remove if out of bounds
                if (obs.x < -obs.radius * 2 || obs.x > canvas.width + obs.radius * 2 ||
                    obs.y < -obs.radius * 2 || obs.y > canvas.height + obs.radius * 2) {
                    obstacles.splice(i, 1);
                    score++;
                    scoreElement.textContent = `Score: ${score}`;
                    
                    // Increase difficulty
                    if (score % 5 === 0) {
                        speed += 0.2;
                    }
                }
                
                // Check collision with player
                const dx = player.x - obs.x;
                const dy = player.y - obs.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < player.radius + obs.radius) {
                    gameOver();
                }
            }
        }
        
        function gameOver() {
            gameRunning = false;
            instructionsElement.innerHTML = `
                <h2>Game Over</h2>
                <p>Your score: ${score}</p>
                <p>Click to play again</p>
            `;
            instructionsElement.style.display = 'block';
        }
        
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw player
            ctx.beginPath();
            ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
            ctx.fillStyle = player.color;
            ctx.fill();
            ctx.closePath();
            
            // Draw obstacles
            obstacles.forEach(obs => {
                ctx.beginPath();
                ctx.arc(obs.x, obs.y, obs.radius, 0, Math.PI * 2);
                ctx.fillStyle = obs.color;
                ctx.fill();
                ctx.closePath();
            });
        }
        
        function animate() {
            if (!gameRunning) return;
            
            updatePlayer();
            updateObstacles();
            draw();
            
            requestAnimationFrame(animate);
        }