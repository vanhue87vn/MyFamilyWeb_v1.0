const canvas = document.getElementById("maze");
const ctx = canvas.getContext("2d");
const cols = 25;
const rows = 25;
const cellSize = canvas.width / cols;
let grid = [];
let stack = [];
let current;
let player = { x: 0, y: 0 };
let drawX = 0, drawY = 0;
let goal = { x: cols - 1, y: rows - 1 };
let monsters = [];
let lives = 3;
let monsterTick = 0;
const statusDiv = document.getElementById("status");
const livesDiv = document.getElementById("lives");

const moveSound = document.getElementById("moveSound");
const winSound = document.getElementById("winSound");
const loseSound = document.getElementById("loseSound");
const bgMusic = document.getElementById("bgMusic");

document.getElementById("musicToggle").onclick = () => {
  if (bgMusic.paused) bgMusic.play();
  else bgMusic.pause();
};

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.walls = [true, true, true, true];
    this.visited = false;
  }
  draw() {
    const x = this.x * cellSize;
    const y = this.y * cellSize;
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#0ff";
    ctx.shadowBlur = 6;
    if (this.walls[0]) drawLine(x, y, x + cellSize, y);
    if (this.walls[1]) drawLine(x + cellSize, y, x + cellSize, y + cellSize);
    if (this.walls[2]) drawLine(x + cellSize, y + cellSize, x, y + cellSize);
    if (this.walls[3]) drawLine(x, y + cellSize, x, y);
    ctx.shadowBlur = 0;
  }
}

function drawLine(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function index(x, y) {
  if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
  return x + y * cols;
}

function removeWalls(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  if (dx === 1) [a.walls[3], b.walls[1]] = [false, false];
  else if (dx === -1) [a.walls[1], b.walls[3]] = [false, false];
  if (dy === 1) [a.walls[0], b.walls[2]] = [false, false];
  else if (dy === -1) [a.walls[2], b.walls[0]] = [false, false];
}

function generateStep() {
  current.visited = true;
  const neighbors = [
    grid[index(current.x, current.y - 1)],
    grid[index(current.x + 1, current.y)],
    grid[index(current.x, current.y + 1)],
    grid[index(current.x - 1, current.y)]
  ].filter(c => c && !c.visited);
  if (neighbors.length > 0) {
    const next = neighbors[Math.floor(Math.random() * neighbors.length)];
    stack.push(current);
    removeWalls(current, next);
    current = next;
    generateStep();
  } else if (stack.length > 0) {
    current = stack.pop();
    generateStep();
  } else {
    placeMonsters();
  }
}

function placeMonsters() {
  for (let i = 0; i < 10; i++) {
    const mx = Math.floor(Math.random() * cols);
    const my = Math.floor(Math.random() * rows);
    if ((mx !== player.x || my !== player.y) && (mx !== goal.x || my !== goal.y)) {
      monsters.push({ x: mx, y: my });
    }
  }
}

function moveMonsters() {
  monsterTick++;
  if (monsterTick % 10 !== 0) return;

  for (let m of monsters) {
    const dx = player.x - m.x;
    const dy = player.y - m.y;
    const moveX = dx !== 0 ? dx / Math.abs(dx) : 0;
    const moveY = dy !== 0 ? dy / Math.abs(dy) : 0;

    const directions = [
      { dx: moveX, dy: 0 },
      { dx: 0, dy: moveY },
      { dx: moveX, dy: moveY }
    ];

    for (let dir of directions) {
      const next = grid[index(m.x + dir.dx, m.y + dir.dy)];
      const cell = grid[index(m.x, m.y)];
      const dirIndex = dir.dx === 1 ? 1 : dir.dx === -1 ? 3 : dir.dy === 1 ? 2 : 0;
      if (next && !cell.walls[dirIndex]) {
        m.x += dir.dx;
        m.y += dir.dy;
        break;
      }
    }
  }
}

function movePlayer(dx, dy) {
  const nextX = player.x + dx;
  const nextY = player.y + dy;
  const cell = grid[index(player.x, player.y)];
  const next = grid[index(nextX, nextY)];
  if (!next) return;
  const dir = dx === 1 ? 1 : dx === -1 ? 3 : dy === 1 ? 2 : 0;
  if (!cell.walls[dir]) {
    player.x = nextX;
    player.y = nextY;
    moveSound.currentTime = 0;
    moveSound.play();
  }
}

function update() {
  drawX += (player.x * cellSize - drawX) * 0.2;
  drawY += (player.y * cellSize - drawY) * 0.2;
  moveMonsters();

  for (let m of monsters) {
    if (player.x === m.x && player.y === m.y) {
      loseSound.play();
      alert("Bạn đã bị quái vật bắt! Thua cuộc!");
      player = { x: 0, y: 0 };
      lives = 3;
      monsters = [];
      placeMonsters();
    }
  }

  if (player.x === goal.x && player.y === goal.y) {
    winSound.play();
    alert("🎉 Bạn đã thắng!");
    player = { x: 0, y: 0 };
    lives = 3;
    monsters = [];
    placeMonsters();
  }
}

function draw() {
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  grid.forEach(cell => cell.draw());
  monsters.forEach(m => {
    ctx.fillStyle = "#8000ff";
    ctx.beginPath();
    ctx.arc(m.x * cellSize + cellSize / 2, m.y * cellSize + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.fillStyle = "red";
  ctx.fillRect(goal.x * cellSize + 4, goal.y * cellSize + 4, cellSize - 8, cellSize - 8);

  ctx.fillStyle = "lime";
  ctx.beginPath();
  ctx.arc(drawX + cellSize / 2, drawY + cellSize / 2, cellSize / 3, 0, Math.PI * 2);
  ctx.fill();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") movePlayer(0, -1);
  if (e.key === "ArrowDown") movePlayer(0, 1);
  if (e.key === "ArrowLeft") movePlayer(-1, 0);
  if (e.key === "ArrowRight") movePlayer(1, 0);
});

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    grid.push(new Cell(x, y));
  }
}
current = grid[0];
generateStep();
gameLoop();
bgMusic.volume = 0.5;
bgMusic.play();