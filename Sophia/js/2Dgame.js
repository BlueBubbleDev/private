const canvas = document.getElementById("simpleGame");
const ctx = canvas.getContext("2d");
const scoreSpan = document.getElementById("score");
const startBtn = document.getElementById("startBtn");
const messageDiv = document.getElementById("message");
const codePopup = document.getElementById("code-popup");
const copyButton = document.getElementById("copyButton");
const closeCodeBtn = document.getElementById("close-code-btn");
const copyText = document.getElementById("copyText");

const W = canvas.width;
const H = canvas.height;

let score = 0;
const totalPoints = 40;
let running = false;
let gameStartTime = 0;

const player = {
  width: 40,
  height: 50,
  x: 80,
  y: H / 2,
  targetY: H / 2,
  speed: 12,
  color: "#e75480",
};

let hearts = [];
const heartSize = 28;
let lastHeartSpawnTime = 0;
const spawnInterval = 1200;
const initialSpeed = 4;
let heartSpeed = initialSpeed;

const backgrounds = [
  { threshold: 0, url: "Backgroundimage.png" },
  { threshold: 1, url: "Backgroundimage.png" },
  { threshold: 2, url: "Backgroundimage.png" },
  { threshold: 3, url: "Backgroundimage.png" },
];

function getElapsedMinutes() {
  return Math.floor((Date.now() - gameStartTime) / 60000);
}

function updateBackground() {
  const elapsed = getElapsedMinutes();
  const bg = backgrounds.find((b) => b.threshold === elapsed);
  if (bg) {
    canvas.style.background = `url(${bg.url}) center/cover no-repeat`;
  }
}

function resetGame() {
  score = 0;
  running = true;
  hearts = [];
  lastHeartSpawnTime = 0;
  heartSpeed = initialSpeed;
  gameStartTime = Date.now();
  scoreSpan.textContent = `0 / ${totalPoints}`;
  messageDiv.textContent = "";
  codePopup.classList.remove("show");
  updateBackground();
  requestAnimationFrame(gameLoop);
}

function spawnHeart() {
  const paddingTopBottom = 20;
  const yPos =
    Math.random() * (H - heartSize - paddingTopBottom * 2) + paddingTopBottom;
  hearts.push({
    x: W + 30,
    y: yPos,
    width: heartSize,
    height: heartSize,
    color: "#ff3c78",
  });
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!running) return;
  if (e.touches && e.touches.length > 0) {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    let y = touch.clientY - rect.top;
    const paddingTopBottom = 20;
    if (y < paddingTopBottom) y = paddingTopBottom;
    if (y > H - paddingTopBottom - player.height)
      y = H - paddingTopBottom - player.height;
    player.targetY = y;
  }
}

function updatePlayer() {
  const deltaY = player.targetY - player.y;
  if (Math.abs(deltaY) > player.speed) {
    player.y += player.speed * Math.sign(deltaY);
  } else {
    player.y = player.targetY;
  }
}

function checkCollision(rectA, rectB) {
  return (
    rectA.x < rectB.x + rectB.width &&
    rectA.x + rectA.width > rectB.x &&
    rectA.y < rectB.y + rectB.height &&
    rectA.height + rectA.y > rectB.y
  );
}

function updateHearts(time) {
  if (!lastHeartSpawnTime || time - lastHeartSpawnTime > spawnInterval) {
    if (hearts.length < totalPoints) {
      spawnHeart();
      lastHeartSpawnTime = time;
    }
  }

  for (let i = hearts.length - 1; i >= 0; i--) {
    hearts[i].x -= heartSpeed;

    if (hearts[i].x + hearts[i].width < 0) {
      running = false;
      messageDiv.textContent = "Du hast ein Herz verpasst! Spiel vorbei!";
      startBtn.style.display = "block";
      return;
    }

    if (checkCollision(player, hearts[i])) {
      hearts.splice(i, 1);
      score++;
      scoreSpan.textContent = `${score} / ${totalPoints}`;
      updateBackground();

      if (score % 10 === 0) {
        heartSpeed += 0.8;
      }

      if (score >= totalPoints) {
        endGame();
      }
    }
  }
}

function drawHeart(x, y, size) {
  ctx.beginPath();
  const topCurveHeight = size * 0.3;
  ctx.moveTo(x, y + topCurveHeight);

  // Linke Kurve
  ctx.bezierCurveTo(
    x,
    y,
    x - size / 2,
    y,
    x - size / 2,
    y + topCurveHeight
  );

  // Linke untere Kurve
  ctx.bezierCurveTo(
    x - size / 2,
    y + (size + topCurveHeight) / 2,
    x,
    y + (size + topCurveHeight) / 1.4,
    x,
    y + size
  );

  // Rechte untere Kurve
  ctx.bezierCurveTo(
    x,
    y + (size + topCurveHeight) / 1.4,
    x + size / 2,
    y + (size + topCurveHeight) / 2,
    x + size / 2,
    y + topCurveHeight
  );

  // Rechte Kurve
  ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
  ctx.fillStyle = "#ff3c78";
  ctx.fill();
}

function drawRect(obj) {
  ctx.fillStyle = obj.color;
  ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
}

function drawPlayer() {
  drawRect(player);
}

function drawHearts() {
  hearts.forEach((h) => {
    drawHeart(h.x + h.width / 2, h.y, h.width);
  });
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  drawPlayer();
  drawHearts();
}

function endGame() {
  running = false;
  startBtn.style.display = "block";
  codePopup.classList.add("show");
  messageDiv.textContent = "";
}

function gameLoop(time) {
  if (!running) return;

  updatePlayer();
  updateHearts(time);
  draw();

  if (Date.now() - gameStartTime > 240000) {
    endGame();
  } else {
    requestAnimationFrame(gameLoop);
  }
}

window.addEventListener("resize", () => {
  draw();
});

startBtn.addEventListener("click", () => {
  startBtn.style.display = "none";
  resetGame();
});

canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

closeCodeBtn.addEventListener("click", () => {
  codePopup.classList.remove("show");
});

document.getElementById('copyButton').addEventListener('click', function() {
    const text = document.getElementById('textToCopy').innerText;
    navigator.clipboard.writeText(text).then(() => {
      alert('Text wurde in die Zwischenablage kopiert!');
    }).catch(err => {
      alert('Kopieren fehlgeschlagen: ' + err);
    });
  });