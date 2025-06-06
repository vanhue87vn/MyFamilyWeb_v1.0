// Khởi tạo scene, camera và renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Khởi tạo vật lý với Cannon.js
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);
world.broadphase = new CANNON.NaiveBroadphase();
world.solver.iterations = 10;

// Tạo sân bóng
const groundGeometry = new THREE.PlaneGeometry(40, 25);
const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x00AA00,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Vật lý cho mặt đất
const groundShape = new CANNON.Plane();
const groundBody = new CANNON.Body({ mass: 0 });
groundBody.addShape(groundShape);
groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(groundBody);

// Tạo đường giữa sân
const lineGeometry = new THREE.BoxGeometry(0.5, 0.1, 25);
const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
const line = new THREE.Mesh(lineGeometry, lineMaterial);
line.position.set(0, 0.1, 0);
scene.add(line);

// Tạo khung thành
function createGoal(x, z, color) {
    // Khung thành chính
    const goalGeometry = new THREE.BoxGeometry(3, 2, 1.5);
    const goalMaterial = new THREE.MeshStandardMaterial({
        color: color,
        transparent: true,
        opacity: 0.7
    });
    const goal = new THREE.Mesh(goalGeometry, goalMaterial);
    goal.position.set(x, 1, z);
    goal.castShadow = true;
    scene.add(goal);

    // Cột dọc
    const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5);
    const postMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });

    // 2 cột dọc
    const leftPost = new THREE.Mesh(postGeometry, postMaterial);
    leftPost.position.set(x, 1.25, z - 1.25);
    scene.add(leftPost);

    const rightPost = new THREE.Mesh(postGeometry, postMaterial);
    rightPost.position.set(x, 1.25, z + 1.25);
    scene.add(rightPost);

    // Xà ngang
    const crossbarGeometry = new THREE.BoxGeometry(0.2, 0.2, 2.5);
    const crossbar = new THREE.Mesh(crossbarGeometry, postMaterial);
    crossbar.position.set(x, 2.25, z);
    scene.add(crossbar);

    // Vật lý cho khung thành
    const goalShape = new CANNON.Box(new CANNON.Vec3(1.5, 1, 0.75));
    const goalBody = new CANNON.Body({ mass: 0 });
    goalBody.addShape(goalShape);
    goalBody.position.set(x, 1, z);
    world.addBody(goalBody);

    return { goal, goalBody };
}

// Khung thành của bạn (màu xanh)
const yourGoal = createGoal(-20, 0, 0x0000FF);
// Khung thành của bot (màu đỏ)
const botGoal = createGoal(20, 0, 0xFF0000);

// Tạo bóng
const ballGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const ballMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.1,
    metalness: 0.3
});
const ball = new THREE.Mesh(ballGeometry, ballMaterial);
ball.position.set(0, 2, 0);
ball.castShadow = true;
scene.add(ball);

// Vật lý cho bóng
const ballShape = new CANNON.Sphere(0.5);
const ballBody = new CANNON.Body({ mass: 0.5 });
ballBody.addShape(ballShape);
ballBody.position.set(0, 2, 0);
ballBody.linearDamping = 0.4;
ballBody.angularDamping = 0.4;
world.addBody(ballBody);

// Tạo cầu thủ của bạn (màu xanh)
const playerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x0000FF });
const player = new THREE.Mesh(playerGeometry, playerMaterial);
player.position.set(0, 0.9, 0);
player.castShadow = true;
scene.add(player);

// Vật lý cho cầu thủ của bạn
const playerShape = new CANNON.Cylinder(0.5, 0.5, 1.8, 16);
const playerBody = new CANNON.Body({ mass: 5 });
playerBody.addShape(playerShape);
playerBody.position.set(0, 0.9, 0);
playerBody.linearDamping = 0.5;
playerBody.angularDamping = 0.5;
world.addBody(playerBody);

// Tạo bot (màu đỏ)
const botGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
const botMaterial = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
const bot = new THREE.Mesh(botGeometry, botMaterial);
bot.position.set(10, 0.9, 0);
bot.castShadow = true;
scene.add(bot);

// Vật lý cho bot
const botShape = new CANNON.Cylinder(0.5, 0.5, 1.8, 16);
const botBody = new CANNON.Body({ mass: 5 });
botBody.addShape(botShape);
botBody.position.set(10, 0.9, 0);
botBody.linearDamping = 0.5;
botBody.angularDamping = 0.5;
world.addBody(botBody);

// Ánh sáng
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.8);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Đặt camera
camera.position.set(0, 15, 20);
camera.lookAt(0, 0, 0);

// Điều khiển
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;

    // Reset game
    if (event.code === 'KeyR') {
        resetGame();
    }
});
document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Biến điểm
let yourScore = 0;
let botScore = 0;
const scoreElement = document.getElementById('score');

// AI cho bot
function updateBot() {
    // Tính khoảng cách giữa bot và bóng
    const ballPos = ballBody.position;
    const botPos = botBody.position;

    // Vector hướng từ bot đến bóng
    const direction = new CANNON.Vec3();
    direction.set(ballPos.x - botPos.x, 0, ballPos.z - botPos.z);
    direction.normalize();

    // Nếu bóng ở phía bên kia sân (gần khung thành của bot)
    if (ballPos.x > 0) {
        // Bot sẽ đuổi theo bóng
        const speed = 5;
        botBody.velocity.x = direction.x * speed;
        botBody.velocity.z = direction.z * speed;

        // Nếu bot gần bóng thì sút
        const distance = botPos.distanceTo(ballPos);
        if (distance < 3) {
            const kickDirection = new CANNON.Vec3(-1, 0.2, (Math.random() - 0.5) * 0.5);
            kickDirection.normalize();
            kickDirection.scale(20, kickDirection);
            ballBody.velocity.copy(kickDirection);
        }
    } else {
        // Nếu bóng ở phía sân của bạn, bot sẽ lui về phòng thủ
        const homePos = new CANNON.Vec3(10, 0.9, 0);
        const homeDirection = new CANNON.Vec3();
        homeDirection.set(homePos.x - botPos.x, 0, homePos.z - botPos.z);
        homeDirection.normalize();

        const speed = 3;
        botBody.velocity.x = homeDirection.x * speed;
        botBody.velocity.z = homeDirection.z * speed;
    }
}

// Reset bóng về vị trí trung tâm
function resetBall() {
    ballBody.position.set(0, 2, 0);
    ballBody.velocity.set(0, 0, 0);
    ballBody.angularVelocity.set(0, 0, 0);

    playerBody.position.set(0, 0.9, 0);
    playerBody.velocity.set(0, 0, 0);

    botBody.position.set(10, 0.9, 0);
    botBody.velocity.set(0, 0, 0);
}

// Reset toàn bộ game
function resetGame() {
    yourScore = 0;
    botScore = 0;
    scoreElement.textContent = `Bạn: ${yourScore} - Bot: ${botScore}`;
    resetBall();
}

// Vòng lặp game
const clock = new THREE.Clock();
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    world.step(delta);

    // Cập nhật vị trí đồ họa từ vật lý
    ball.position.copy(ballBody.position);
    ball.quaternion.copy(ballBody.quaternion);

    player.position.copy(playerBody.position);
    player.quaternion.copy(playerBody.quaternion);

    bot.position.copy(botBody.position);
    bot.quaternion.copy(botBody.quaternion);

    // Điều khiển cầu thủ của bạn
    const speed = 7;
    if (keys['ArrowUp']) {
        playerBody.velocity.z = -speed;
    } else if (keys['ArrowDown']) {
        playerBody.velocity.z = speed;
    } else {
        playerBody.velocity.z = 0;
    }

    if (keys['ArrowLeft']) {
        playerBody.velocity.x = -speed;
    } else if (keys['ArrowRight']) {
        playerBody.velocity.x = speed;
    } else {
        playerBody.velocity.x = 0;
    }

    if (keys['Space']) {
        // Sút bóng nếu gần bóng
        const distance = playerBody.position.distanceTo(ballBody.position);
        if (distance < 2) {
            const direction = new CANNON.Vec3();
            direction.copy(ballBody.position);
            direction.vsub(playerBody.position, direction);
            direction.normalize();
            direction.scale(20, direction);
            ballBody.velocity.copy(direction);
        }
    }

    // Cập nhật AI cho bot
    updateBot();

    // Kiểm tra ghi bàn
    const ballPos = ballBody.position;

    // Bạn ghi bàn (bóng vào khung thành bot)
    if (ballPos.x > 19 && ballPos.z > -1.5 && ballPos.z < 1.5) {
        yourScore++;
        scoreElement.textContent = `Bạn: ${yourScore} - Bot: ${botScore}`;
        resetBall();
    }

    // Bot ghi bàn (bóng vào khung thành của bạn)
    if (ballPos.x < -19 && ballPos.z > -1.5 && ballPos.z < 1.5) {
        botScore++;
        scoreElement.textContent = `Bạn: ${yourScore} - Bot: ${botScore}`;
        resetBall();
    }

    // Giới hạn di chuyển cho cầu thủ
    if (playerBody.position.x < -18) playerBody.position.x = -18;
    if (playerBody.position.x > 18) playerBody.position.x = 18;
    if (playerBody.position.z < -10) playerBody.position.z = -10;
    if (playerBody.position.z > 10) playerBody.position.z = 10;

    // Giới hạn di chuyển cho bot
    if (botBody.position.x < 0) botBody.position.x = 0;
    if (botBody.position.x > 18) botBody.position.x = 18;
    if (botBody.position.z < -10) botBody.position.z = -10;
    if (botBody.position.z > 10) botBody.position.z = 10;

    renderer.render(scene, camera);
}

// Xử lý thay đổi kích thước cửa sổ
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();