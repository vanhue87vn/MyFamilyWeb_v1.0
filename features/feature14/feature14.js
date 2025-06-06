        // Game elements
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const manaDisplay = document.getElementById('manaDisplay');
        const startScreen = document.getElementById('startScreen');
        const startButton = document.getElementById('startButton');

        // Game state
        let gameRunning = false;
        let score = 0;
        let mana = 100;
        let manaRegenInterval;
        let animationFrameId;
        let particles = [];
        let powerUps = [];
        let isCharging = false;
        let chargePower = 0;
        let chargeStartTime = 0;

        // Player
        const player = {
            x: canvas.width / 2,
            y: canvas.height - 80,
            width: 50,
            height: 50,
            speed: 6,
            color: '#5d3fd3'
        };

        // Spells (bullets)
        let spells = [];
        const spellTypes = {
            basic: { width: 8, height: 25, color: '#00ffff', speed: 10, manaCost: 5 },
            charged: { width: 15, height: 40, color: '#ff00ff', speed: 15, manaCost: 20 },
            super: { width: 25, height: 60, color: '#ffff00', speed: 20, manaCost: 40 }
        };

        // Enemies
        let enemies = [];
        const enemyTypes = {
            small: { width: 30, height: 30, color: '#e74c3c', speed: 2, health: 1, score: 10 },
            medium: { width: 45, height: 45, color: '#9b59b6', speed: 1.5, health: 3, score: 30 },
            large: { width: 60, height: 60, color: '#1abc9c', speed: 1, health: 5, score: 50 }
        };
        let enemySpawnRate = 90; // frames
        let enemySpawnCounter = 0;

        // Controls
        const keys = {
            ArrowLeft: false,
            ArrowRight: false,
            ArrowUp: false,
            ArrowDown: false,
            ' ': false
        };

        // Event listeners
        document.addEventListener('keydown', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = true;
                if (e.key === ' ' && !isCharging && mana >= spellTypes.basic.manaCost) {
                    isCharging = true;
                    chargeStartTime = Date.now();
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (keys.hasOwnProperty(e.key)) {
                keys[e.key] = false;
                if (e.key === ' ' && isCharging) {
                    castSpell();
                    isCharging = false;
                }
            }
        });

        startButton.addEventListener('click', startGame);

        function startGame() {
            gameRunning = true;
            score = 0;
            mana = 100;
            spells = [];
            enemies = [];
            particles = [];
            powerUps = [];
            scoreDisplay.textContent = `Score: ${score}`;
            manaDisplay.textContent = `Mana: ${mana}%`;
            startScreen.style.display = 'none';
            
            // Start mana regeneration
            clearInterval(manaRegenInterval);
            manaRegenInterval = setInterval(() => {
                if (mana < 100) {
                    mana = Math.min(100, mana + 1);
                    updateManaDisplay();
                }
            }, 500);
            
            gameLoop();
        }

        function gameLoop() {
            if (!gameRunning) {
                cancelAnimationFrame(animationFrameId);
                return;
            }
            
            update();
            draw();
            animationFrameId = requestAnimationFrame(gameLoop);
        }

        function update() {
            // Player movement
            if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown) {
                const moveX = (keys.ArrowRight ? 1 : 0) - (keys.ArrowLeft ? 1 : 0);
                const moveY = (keys.ArrowDown ? 1 : 0) - (keys.ArrowUp ? 1 : 0);
                
                // Normalize to prevent faster diagonal movement
                const length = Math.sqrt(moveX * moveX + moveY * moveY);
                const normalizedX = length > 0 ? moveX / length : 0;
                const normalizedY = length > 0 ? moveY / length : 0;
                
                player.x += normalizedX * player.speed;
                player.y += normalizedY * player.speed;
                
                // Replace movement code with:
                player.x = Math.max(10, Math.min(canvas.width - player.width - 10, player.x));
                player.y = Math.max(10, Math.min(canvas.height - player.height - 10, player.y));
            }

            // Update charging
            if (isCharging) {
                const chargeTime = Date.now() - chargeStartTime;
                chargePower = Math.min(100, Math.floor(chargeTime / 50)); // 0-100 based on charge time
                
                // Drain mana while charging
                if (chargeTime % 100 === 0 && mana > 0) {
                    mana = Math.max(0, mana - 1);
                    updateManaDisplay();
                }
                
                // Auto-release if mana runs out
                if (mana <= 0) {
                    castSpell();
                    isCharging = false;
                }
            }

            // Update spells
            for (let i = spells.length - 1; i >= 0; i--) {
                spells[i].y -= spells[i].speed;

                // Remove spells that go off screen
                if (spells[i].y + spells[i].height < 0) {
                    spells.splice(i, 1);
                }
            }

            // Spawn enemies
            enemySpawnCounter++;
            if (enemySpawnCounter >= enemySpawnRate) {
                spawnEnemy();
                enemySpawnCounter = 0;
                
                // Randomly spawn power-ups (5% chance)
                if (Math.random() < 0.05) {
                    spawnPowerUp();
                }
            }

            // Update enemies
            for (let i = enemies.length - 1; i >= 0; i--) {
                enemies[i].y += enemies[i].speed;

                // Remove enemies that go off screen
                if (enemies[i].y > canvas.height) {
                    enemies.splice(i, 1);
                }

                // Check for collision with player
                if (checkCollision(player, enemies[i])) {
                    createExplosion(enemies[i].x + enemies[i].width/2, enemies[i].y + enemies[i].height/2, enemies[i].color);
                    enemies.splice(i, 1);
                    mana = Math.max(0, mana - 15);
                    updateManaDisplay();
                    
                    if (mana <= 0) {
                        gameOver();
                        return;
                    }
                }

                // Check for spell collisions
                for (let j = spells.length - 1; j >= 0; j--) {
                    if (checkCollision(spells[j], enemies[i])) {
                        enemies[i].health -= spells[j].damage;
                        
                        createImpactParticles(
                            spells[j].x + spells[j].width/2, 
                            spells[j].y + spells[j].height/2, 
                            spells[j].color
                        );
                        
                        if (enemies[i].health <= 0) {
                            createExplosion(
                                enemies[i].x + enemies[i].width/2, 
                                enemies[i].y + enemies[i].height/2, 
                                enemies[i].color
                            );
                            score += enemies[i].score;
                            scoreDisplay.textContent = `Score: ${score}`;
                            enemies.splice(i, 1);
                            
                            // Increase difficulty
                            if (score > 0 && score % 100 === 0) {
                                enemySpawnRate = Math.max(30, enemySpawnRate - 5);
                            }
                        }
                        
                        spells.splice(j, 1);
                        break;
                    }
                }
            }
            
            // Update power-ups
            for (let i = powerUps.length - 1; i >= 0; i--) {
                powerUps[i].y += powerUps[i].speed;
                
                // Remove power-ups that go off screen
                if (powerUps[i].y > canvas.height) {
                    powerUps.splice(i, 1);
                }
                
                // Check for collision with player
                if (checkCollision(player, powerUps[i])) {
                    mana = Math.min(100, mana + 30);
                    updateManaDisplay();
                    createParticles(
                        powerUps[i].x + powerUps[i].width/2, 
                        powerUps[i].y + powerUps[i].height/2, 
                        powerUps[i].color, 
                        20
                    );
                    powerUps.splice(i, 1);
                }
            }
            
            // Update particles
            for (let i = particles.length - 1; i >= 0; i--) {
                particles[i].x += particles[i].vx;
                particles[i].y += particles[i].vy;
                particles[i].alpha -= 0.02;
                
                if (particles[i].alpha <= 0) {
                    particles.splice(i, 1);
                }
            }
        }

        function draw() {
            // Clear canvas with semi-transparent black for motion blur effect
            ctx.fillStyle = 'rgba(0, 0, 20, 0.2)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw starry background
            drawStars();
            
            // Draw spells
            spells.forEach(spell => {
                ctx.fillStyle = spell.color;
                ctx.beginPath();
                ctx.moveTo(spell.x + spell.width/2, spell.y);
                ctx.lineTo(spell.x + spell.width, spell.y + spell.height);
                ctx.lineTo(spell.x, spell.y + spell.height);
                ctx.closePath();
                ctx.fill();
                
                // Glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = spell.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            // Draw enemies
            enemies.forEach(enemy => {
                // Enemy glow
                ctx.shadowBlur = 10;
                ctx.shadowColor = enemy.color;
                
                // Enemy body
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(
                    enemy.x + enemy.width/2, 
                    enemy.y + enemy.height/2, 
                    enemy.width/2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                
                // Reset shadow
                ctx.shadowBlur = 0;
                
                // Enemy eyes (for creepiness)
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(
                    enemy.x + enemy.width/3, 
                    enemy.y + enemy.height/3, 
                    enemy.width/8, 
                    0, 
                    Math.PI * 2
                );
                ctx.arc(
                    enemy.x + enemy.width*2/3, 
                    enemy.y + enemy.height/3, 
                    enemy.width/8, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            });
            
            // Draw power-ups
            powerUps.forEach(power => {
                ctx.fillStyle = power.color;
                ctx.beginPath();
                ctx.arc(
                    power.x + power.width/2, 
                    power.y + power.height/2, 
                    power.width/2, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
                
                // Pulsing effect
                ctx.strokeStyle = power.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(
                    power.x + power.width/2, 
                    power.y + power.height/2, 
                    power.width/2 + Math.sin(Date.now()/200) * 3, 
                    0, 
                    Math.PI * 2
                );
                ctx.stroke();
                
                // Plus sign
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(power.x + power.width/2, power.y + power.height/3);
                ctx.lineTo(power.x + power.width/2, power.y + power.height*2/3);
                ctx.moveTo(power.x + power.width/3, power.y + power.height/2);
                ctx.lineTo(power.x + power.width*2/3, power.y + power.height/2);
                ctx.stroke();
            });
            
            // Draw particles
            particles.forEach(particle => {
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = particle.color;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
            
            // Draw player
            ctx.fillStyle = player.color;
            ctx.beginPath();
            ctx.moveTo(player.x + player.width/2, player.y);
            ctx.lineTo(player.x + player.width, player.y + player.height);
            ctx.lineTo(player.x, player.y + player.height);
            ctx.closePath();
            ctx.fill();
            
            // Player glow
            ctx.shadowBlur = 20;
            ctx.shadowColor = player.color;
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Draw charge effect if charging
            if (isCharging) {
                const chargeRadius = 20 + chargePower / 5;
                const gradient = ctx.createRadialGradient(
                    player.x + player.width/2, 
                    player.y + player.height/2, 
                    5, 
                    player.x + player.width/2, 
                    player.y + player.height/2, 
                    chargeRadius
                );
                gradient.addColorStop(0, 'rgba(93, 63, 211, 0.8)');
                gradient.addColorStop(1, 'rgba(93, 63, 211, 0)');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(
                    player.x + player.width/2, 
                    player.y + player.height/2, 
                    chargeRadius, 
                    0, 
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        function drawStars() {
            // Create stars on first call
            if (!drawStars.stars) {
                drawStars.stars = [];
                for (let i = 0; i < 100; i++) {
                    drawStars.stars.push({
                        x: Math.random() * canvas.width,
                        y: Math.random() * canvas.height,
                        radius: Math.random() * 1.5,
                        alpha: Math.random(),
                        speed: Math.random() * 0.2
                    });
                }
            }
            
            // Draw and update stars
            ctx.fillStyle = 'white';
            drawStars.stars.forEach(star => {
                star.y += star.speed;
                if (star.y > canvas.height) {
                    star.y = 0;
                    star.x = Math.random() * canvas.width;
                }
                
                ctx.globalAlpha = star.alpha;
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        function spawnEnemy() {
            const typeRoll = Math.random();
            let enemyType;
            
            if (typeRoll < 0.6) {
                enemyType = 'small';
            } else if (typeRoll < 0.9) {
                enemyType = 'medium';
            } else {
                enemyType = 'large';
            }
            
// In spawnEnemy():
enemies.push({
    ...enemyTypes[enemyType],
    currentHealth: enemyTypes[enemyType].health, // Add this
    maxHealth: enemyTypes[enemyType].health     // Add this
});

// In collision check:
enemies[i].currentHealth -= spells[j].damage;
if (enemies[i].currentHealth <= 0) {
    // Enemy defeated logic
}
            enemies.push({
                x: Math.random() * (canvas.width - enemyTypes[enemyType].width),
                y: -enemyTypes[enemyType].height,
                width: enemyTypes[enemyType].width,
                height: enemyTypes[enemyType].height,
                speed: enemyTypes[enemyType].speed,
                color: enemyTypes[enemyType].color,
                health: enemyTypes[enemyType].health,
                score: enemyTypes[enemyType].score
            });
        }
        
        function spawnPowerUp() {
            powerUps.push({
                x: Math.random() * (canvas.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 2,
                color: '#00ffaa'
            });
        }
        
function castSpell() {
    // Prevent casting with no mana
    if (mana <= 0) {
        isCharging = false;
        chargePower = 0;
        return;
    }
    // ... rest of casting logic
}
            
            if (mana >= manaCost) {
                spells.push({
                    x: player.x + player.width/2 - spellTypes[spellType].width/2,
                    y: player.y,
                    width: spellTypes[spellType].width,
                    height: spellTypes[spellType].height,
                    color: spellTypes[spellType].color,
                    speed: spellTypes[spellType].speed,
                    damage: spellType === 'basic' ? 1 : spellType === 'charged' ? 2 : 3
                });
                
                mana = Math.max(0, mana - manaCost);
                updateManaDisplay();
                
                // Casting particles
                createParticles(
                    player.x + player.width/2, 
                    player.y + player.height, 
                    spellTypes[spellType].color, 
                    15
                );
            }
            
            chargePower = 0;
 
        
function createParticles(x, y, color, count) {
    // Limit total particles to 500
    if (particles.length > 500) {
        particles.splice(0, 100); // Remove oldest 100 particles
    }
    // ... rest of particle creation
}
            for (let i = 0; i < count; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 0.5;
                particles.push({
                    x: x,
                    y: y,
                    radius: Math.random() * 2 + 1,
                    color: color,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 0.8
                });
            }
        

        function createImpactParticles(x, y, color) {
            for (let i = 0; i < 10; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 0.5;
                particles.push({
                    x: x,
                    y: y,
                    radius: Math.random() * 2 + 1,
                    color: color,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 0.8
                });
            }
        }
        
        function createExplosion(x, y, color) {
            for (let i = 0; i < 30; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 5 + 2;
                particles.push({
                    x: x,
                    y: y,
                    radius: Math.random() * 4 + 1,
                    color: color,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    alpha: 1
                });
            }
        }

        function checkCollision(obj1, obj2) {
            const buffer = 5;
            return obj1.x + buffer < obj2.x + obj2.width - buffer &&
                   obj1.x + obj1.width - buffer > obj2.x + buffer &&
                   obj1.y + buffer < obj2.y + obj2.height - buffer &&
                   obj1.y + obj1.height - buffer > obj2.y + buffer;
        }
        
        function updateManaDisplay() {
            manaDisplay.textContent = `Mana: ${mana}%`;
            manaDisplay.style.textShadow = `0 0 ${mana/5}px #5d3fd3`;
        }

function gameOver() {
    if (!gameRunning) return; // Prevent multiple triggers
    gameRunning = false;
    // ... rest of game over logic
}
            
            // Create big explosion
            createExplosion(
                player.x + player.width/2, 
                player.y + player.height/2, 
                player.color
            );
            
            // Show game over screen after a delay
            setTimeout(() => {
                startScreen.style.display = 'block';
                startScreen.innerHTML = `
                    <h1>Quest Failed</h1>
                    <p>Your magical score: ${score}</p>
                    <p>Your mana was exhausted</p>
                    <button id="startButton">Try Again</button>
                `;
                document.getElementById('startButton').addEventListener('click', startGame);
            }, 1000);

            // Create big explosion
            createExplosion(
                player.x + player.width/2,
                player.y + player.height/2,
                player.color
            );

            // Replace key event listeners with:
window.addEventListener('blur', () => {
    // Reset all keys when window loses focus
    Object.keys(keys).forEach(key => keys[key] = false);
    if (isCharging) {
        castSpell();
        isCharging = false;
    }
});
        // Start the game loop
        gameLoop();