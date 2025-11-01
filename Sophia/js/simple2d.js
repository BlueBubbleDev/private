const canvas = document.getElementById('simpleGame');
const ctx = canvas.getContext('2d');
const scoreSpan = document.getElementById('score');
const messageDiv = document.getElementById('message');
const startBtn = document.getElementById('startBtn');
const codePopup = document.getElementById('code-popup');
const closeCodeBtn = document.getElementById('close-code-btn');

const W = canvas.width, H = canvas.height;

let player, hearts, enemies, score, running, heartTimer, enemyTimer, codeShown;
const PLAYER_SIZE = 32, HEART_SIZE = 20, ENEMY_SIZE = 28;
const ENEMY_SPEED = 2.4, CODE_SCORE = 50;

let targetX = null, targetY = null;

// ------------------------
function resetGame() {
  player = { x: W/2, y: H - 56 };
  score = 0;
  codeShown = false;
  hearts = [];
  enemies = [];
  running = true;
  placeHeart();
  spawnEnemy();
  updateScore();
  messageDiv.textContent = '';
  codePopup.classList.remove('show');
}

function placeHeart() {
  let x = 40 + Math.random() * (W-80);
  let y = 40 + Math.random() * (H-160);
  hearts = [{ x, y }];
}

function spawnEnemy() {
  const side = Math.random() < 0.5 ? 'left' : 'right';
  const ey = 30 + Math.random()*(H-140);
  let ex = side==='left' ? -ENEMY_SIZE : W+ENEMY_SIZE;
  enemies.push({ x: ex, y: ey, vx: side==='left' ? ENEMY_SPEED : -ENEMY_SPEED });
  enemyTimer = setTimeout(spawnEnemy, 1600 + Math.random()*1400);
}

function updateScore() {
  scoreSpan.textContent = score;
}

function drawPlayer() {
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.beginPath();
  ctx.moveTo(0, -PLAYER_SIZE/6);
  ctx.bezierCurveTo(PLAYER_SIZE/2.1, -PLAYER_SIZE/1.5, PLAYER_SIZE/1.6, PLAYER_SIZE/2.1, 0, PLAYER_SIZE/1.1);
  ctx.bezierCurveTo(-PLAYER_SIZE/1.6, PLAYER_SIZE/2.1, -PLAYER_SIZE/2.1, -PLAYER_SIZE/1.5, 0, -PLAYER_SIZE/6);
  ctx.closePath();
  ctx.fillStyle = "#ff3c78";
  ctx.fill();
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawHeart(h) {
  ctx.save();
  ctx.translate(h.x, h.y);
  ctx.beginPath();
  ctx.moveTo(0, -HEART_SIZE/6);
  ctx.bezierCurveTo(HEART_SIZE/2.1, -HEART_SIZE/1.5, HEART_SIZE/1.6, HEART_SIZE/2.1, 0, HEART_SIZE/1.1);
  ctx.bezierCurveTo(-HEART_SIZE/1.6, HEART_SIZE/2.1, -HEART_SIZE/2.1, -HEART_SIZE/1.5, 0, -HEART_SIZE/6);
  ctx.closePath();
  ctx.fillStyle = "#ffd1dc";
  ctx.fill();
  ctx.strokeStyle = "#ff3c78";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawEnemy(e) {
  ctx.save();
  ctx.translate(e.x, e.y);
  ctx.strokeStyle = "#ff3c78";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-ENEMY_SIZE/2, -ENEMY_SIZE/2);
  ctx.lineTo(ENEMY_SIZE/2, ENEMY_SIZE/2);
  ctx.moveTo(-ENEMY_SIZE/2, ENEMY_SIZE/2);
  ctx.lineTo(ENEMY_SIZE/2, -ENEMY_SIZE/2);
  ctx.stroke();
  ctx.restore();
}

function update() {
  // Folge Finger/Maus präzise
  if (targetX !== null && targetY !== null) {
    player.x = targetX;
    player.y = targetY;
  }
  // Grenzen
  player.x = Math.max(PLAYER_SIZE/2, Math.min(W - PLAYER_SIZE/2, player.x));
  player.y = Math.max(PLAYER_SIZE/2, Math.min(H - PLAYER_SIZE/2, player.y));

  // Herz einsammeln
  hearts.forEach(h => {
    if (Math.abs(player.x - h.x) < 27 && Math.abs(player.y - h.y) < 27) {
      score++;
      placeHeart();
      updateScore();
      if (score >= CODE_SCORE && !codeShown) showCodePopup();
    }
  });

  enemies.forEach(e => { e.x += e.vx; });
  enemies.forEach(e => {
    if (Math.abs(player.x - e.x) < 20 && Math.abs(player.y - e.y) < 20) gameOver();
  });
  enemies = enemies.filter(e => e.x > -ENEMY_SIZE && e.x < W + ENEMY_SIZE);
  if (hearts.length === 0) placeHeart();
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  hearts.forEach(drawHeart);
  enemies.forEach(drawEnemy);
  drawPlayer();
}

function loop() {
  if (!running) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

function gameOver() {
  running = false;
  clearTimeout(enemyTimer);
  messageDiv.textContent = `Game Over! Dein Score: ${score}`;
  startBtn.style.display = "block";
}

function showCodePopup() {
  codeShown = true;
  running = false;
  codePopup.classList.add('show');
  startBtn.style.display = "block";
}

// --- Finger/Maus folge ---
canvas.addEventListener('touchstart', e => followTouch(e));
canvas.addEventListener('touchmove', e => followTouch(e));
canvas.addEventListener('touchend', () => { targetX = null; targetY = null; });

function followTouch(e) {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  targetX = (touch.clientX - rect.left) * scaleX;
  targetY = (touch.clientY - rect.top) * scaleY;
}

canvas.addEventListener('mousedown', e => {
  followMouse(e);
  canvas.addEventListener('mousemove', followMouse);
});
canvas.addEventListener('mouseup', () => {
  targetX = null; targetY = null;
  canvas.removeEventListener('mousemove', followMouse);
});
function followMouse(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  targetX = (e.clientX - rect.left) * scaleX;
  targetY = (e.clientY - rect.top) * scaleY;
}

// --- Start & Close ---
startBtn.onclick = () => {
  startBtn.style.display = 'none';
  resetGame();
  loop();
};
closeCodeBtn.onclick = () => {
  codePopup.classList.remove('show');
};

window.onload = () => {
  startBtn.style.display = "block";
  messageDiv.textContent = "Berühre das Spielfeld und bewege das Herz!";
};
