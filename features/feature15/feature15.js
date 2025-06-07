const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const cols = 20;
const rows = 20;
const cellSize = canvas.width / cols;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true]; // top, right, bottom, left
    this.visited = false;
  }
  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    if (this.walls[0]) drawLine(x, y, x + cellSize, y);
    if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls[2]) drawLine(x + cellSize, y + cellSize, x, y + cellSize);
    if (this.walls[3]) drawLine(x, y + cellSize, x, y);

    if (this.visited) {
      ctx.fillStyle = "#333";
      ctx.fillRect(x, y, cellSize, cellSize);
    }
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

const grid = [];
const stack = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    grid.push(new Cell(x, y));
  }
}
function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}
function removeWalls(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  if (dx === 1) {
    a.walls[3] = false;
    b.walls[1] = false;
  } else if (dx === -1) {
    a.walls[1] = false;
    b.walls[3] = false;
  }
  if (dy === 1) {
    a.walls[0] = false;
    b.walls[2] = false;
  } else if (dy === -1) {
    a.walls[2] = false;
    b.walls[0] = false;
  }
}

let current = grid[0];
function generateStep() {
  current.visited = true;
  const neighbors = getUnvisitedNeighbors(current);
  if (neighbors.length > 0) {
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    stack.push(current);
    removeWalls(current, next);
    current = next;
  } else if (stack.length > 0) {
    current = stack.pop();
  }
  draw();
  if (stack.length > 0) requestAnimationFrame(generateStep);
  else {
    placeTraps();
    placeMonsters();
    draw();
  }
}
function getUnvisitedNeighbors(cell) {
  const { x, y } = cell;
  const n = [];
  [
    [x, y - 1],
    [x + 1, y],
    [x, y + 1],
    [x - 1, y],
  ].forEach(([nx, ny]) => {
    const ni = index(nx, ny);
    if (ni !== -1 && !grid[ni].visited) n.push(grid[ni]);
  });
  return n;
}

let player = { x: 0, y: 0 };
let drawX = 0,
  drawY = 0;
const goal = { x: cols - 1, y: rows - 1 };

let lives = 3;
const livesDiv = document.getElementById("lives");
const statusDiv = document.getElementById("status");

let traps = []; // mảng chứa bẫy {x, y}
let monsters = []; // mảng chứa quái vật {x, y, dirX, dirY}

let aiActive = false;
let aiPath = [];

function drawPlayerSmooth() {
  ctx.fillStyle = "lime";
  ctx.fillRect(drawX + 5, drawY + 5, cellSize - 10, cellSize - 10);
  // Vẽ đích màu đỏ
  ctx.fillStyle = "red";
  ctx.fillRect(
    goal.x * cellSize + 8,
    goal.y * cellSize + 8,
    cellSize - 16,
    cellSize - 16
  );
}

function drawTraps() {
  ctx.fillStyle = "orange";
  traps.forEach(({ x, y }) => {
    ctx.fillRect(x * cellSize + 12, y * cellSize + 12, cellSize - 24, cellSize - 24);
  });
}

function drawMonsters() {
  ctx.fillStyle = "purple";
  monsters.forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(
      x * cellSize + cellSize / 2,
      y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  grid.forEach((c) => c.draw());
  drawTraps();
  drawMonsters();
  drawPlayerSmooth();
}

function findPathBFS(start, end, avoidPositions = []) {
  const queue = [start];
  const visited = new Set();
  const cameFrom = {};
  const key = (x, y) => `${x},${y}`;
  visited.add(key(start.x, start.y));

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr.x === end.x && curr.y === end.y) {
      const path = [];
      let c = key(end.x, end.y);
      while (c !== key(start.x, start.y)) {
        const [cx, cy] = c.split(",").map(Number);
        path.unshift({ x: cx, y: cy });
        c = cameFrom[c];
      }
      return path;
    }

    const cell = grid[index(curr.x, curr.y)];
    [
      [0, -1, 0],
      [1, 0, 1],
      [0, 1, 2],
      [-1, 0, 3],
    ].forEach(([dx, dy, wall]) => {
      if (!cell.walls[wall]) {
        const nx = curr.x + dx,
          ny = curr.y + dy,
          k = key(nx, ny);

        // Tránh các vị trí bẫy/quái vật (avoidPositions)
        const blocked = avoidPositions.some(pos => pos.x === nx && pos.y === ny);
        if (!visited.has(k) && !blocked) {
          visited.add(k);
          cameFrom[k] = key(curr.x, curr.y);
          queue.push({ x: nx, y: ny });
        }
      }
    });
  }
  return null;
}

function movePlayerAutoSmooth(path) {
  if (!path || path.length === 0) {
    aiActive = false;
    statusDiv.textContent = "AI: Tắt";
    return;
  }
  const next = path.shift();
  const startX = player.x * cellSize;
  const startY = player.y * cellSize;
  const endX = next.x * cellSize;
  const endY = next.y * cellSize;
  const duration = 300,
    startTime = performance.now();

  function animate(t) {
    if (!aiActive) return; // Nếu AI tắt, dừng luôn
    const elapsed = t - startTime;
    const progress = Math.min(elapsed / duration, 1);
    drawX = startX + (endX - startX) * progress;
    drawY = startY + (endY - startY) * progress;
    draw();
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      player.x = next.x;
      player.y = next.y;
      checkTrapCollision();
      checkMonsterCollision();
      if (player.x === goal.x && player.y === goal.y) {
        alert("🎉 AI đã chiến thắng!");
        aiActive = false;
        statusDiv.textContent = "AI: Tắt";
      } else {
        // AI tính đường mới tránh bẫy và quái vật hiện tại
        const avoid = traps.concat(monsters);
        const newPath = findPathBFS(player, goal, avoid);
        if (newPath) {
          movePlayerAutoSmooth(newPath);
        } else {
          alert("AI không tìm được đường đi!");
          aiActive = false;
          statusDiv.textContent = "AI: Tắt";
        }
      }
    }
  }
  requestAnimationFrame(animate);
}

function manualMove(dx, dy) {
  if (aiActive) return; // Nếu AI đang chạy thì không cho di chuyển thủ công
  const cx = player.x;
  const cy = player.y;
  const cell = grid[index(cx, cy)];
  let wallIndex = -1;
  if (dx === 1 && dy === 0) wallIndex = 1;
  else if (dx === -1 && dy === 0) wallIndex = 3;
  else if (dx === 0 && dy === 1) wallIndex = 2;
  else if (dx === 0 && dy === -1) wallIndex = 0;
  if (wallIndex !== -1 && !cell.walls[wallIndex]) {
    player.x += dx;
    player.y += dy;
    drawX = player.x * cellSize;
    drawY = player.y * cellSize;
    checkTrapCollision();
    checkMonsterCollision();
    if (player.x === goal.x && player.y === goal.y) {
      setTimeout(() => alert("🎉 Bạn đã chiến thắng!"), 100);
    }
  }
}

function checkTrapCollision() {
  const trapIndex = traps.findIndex((t) => t.x === player.x && t.y === player.y);
  if (trapIndex !== -1) {
    traps.splice(trapIndex, 1);
    lives--;
    livesDiv.textContent = `Mạng sống: ${lives}`;
    if (lives <= 0) {
      alert("💀 Bạn đã thua! Hết mạng sống.");
      resetGame();
    }
  }
}

function checkMonsterCollision() {
  if (monsters.some((m) => m.x === player.x && m.y === player.y)) {
    alert("👹 Bạn đã bị quái vật bắt! Thua cuộc.");
    resetGame();
  }
}

function resetGame() {
  lives = 3;
  livesDiv.textContent = `Mạng sống: ${lives}`;
  player.x = 0;
  player.y = 0;
  drawX = 0;
  drawY = 0;
  generateMaze();
}

function placeTraps() {
  traps = [];
  const maxTraps = 15;
  while (traps.length < maxTraps) {
    const x = Math.floor(Math.random() * cols);
    const y = Math.floor(Math.random() * rows);
    if (
      (x === 0 && y === 0) ||
      (x === goal.x && y === goal.y) ||
      traps.some((t) => t.x === x && t.y === y)
    )
      continue;
    traps.push({ x, y });
  }
}

function placeMonsters() {
  monsters = [];
  const maxMonsters = 2;
  for (let i = 0; i < maxMonsters; i++) {
    let x, y;
    do {
      x = Math.floor(Math.random() * cols);
      y = Math.floor(Math.random() * rows);
    } while (
      (x === 0 && y === 0) ||
      (x === goal.x && y === goal.y) ||
      traps.some((t) => t.x === x && t.y === y) ||
      monsters.some((m) => m.x === x && m.y === y)
    );
    monsters.push({ x, y, dirX: 1, dirY: 0 });
  }
}

let monsterMoveCounter = 0;
function moveMonsters() {
  // Quái vật di chuyển chậm: mỗi 20 khung mới di chuyển 1 bước
  monsterMoveCounter++;
  if (monsterMoveCounter < 20) return;
  monsterMoveCounter = 0;

  monsters.forEach((m) => {
    const cx = m.x;
    const cy = m.y;
    let nx = cx + m.dirX;
    let ny = cy + m.dirY;

    if (
      nx < 0 ||
      ny < 0 ||
      nx >= cols ||
      ny >= rows ||
      grid[index(cx, cy)].walls[
        m.dirX === 1 ? 1 : m.dirX === -1 ? 3 : m.dirY === 1 ? 2 : 0
      ]
    ) {
      m.dirX *= -1;
      m.dirY *= -1;
      nx = cx + m.dirX;
      ny = cy + m.dirY;
    }

    // Kiểm tra tường giữa 2 ô
    const wallIndex = m.dirX === 1 ? 1 : m.dirX === -1 ? 3 : m.dirY === 1 ? 2 : 0;
    if (!grid[index(cx, cy)].walls[wallIndex]) {
      m.x = nx;
      m.y = ny;
    } else {
      m.dirX *= -1;
      m.dirY *= -1;
    }
  });

  if (monsters.some((m) => m.x === player.x && m.y === player.y)) {
    alert("👹 Quái vật bắt bạn! Thua cuộc.");
    resetGame();
  }
}

function gameLoop() {
  moveMonsters();
  draw();
  requestAnimationFrame(gameLoop);
}

function generateMaze() {
  grid.forEach((c) => (c.visited = false));
  stack.length = 0;
  current = grid[0];
  traps = [];
  monsters = [];
  player = { x: 0, y: 0 };
  drawX = 0;
  drawY = 0;

  generateStep();
}

window.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") manualMove(0, -1);
  else if (e.key === "ArrowDown") manualMove(0, 1);
  else if (e.key === "ArrowLeft") manualMove(-1, 0);
  else if (e.key === "ArrowRight") manualMove(1, 0);
  else if (e.key.toLowerCase() === "a") {
    if (!aiActive) {
      aiActive = true;
      statusDiv.textContent = "AI: Bật";
      // Tính đường tránh bẫy và quái vật
      const avoid = traps.concat(monsters);
      const path = findPathBFS(player, goal, avoid);
      if (path) movePlayerAutoSmooth(path);
      else {
        alert("AI không tìm được đường đi!");
        aiActive = false;
        statusDiv.textContent = "AI: Tắt";
      }
    }
  } else if (e.key.toLowerCase() === "t") {
    // Tắt AI
    aiActive = false;
    statusDiv.textContent = "AI: Tắt";
  }
});

generateMaze();
gameLoop();