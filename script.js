const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const settingsModal = document.getElementById("settingsModal");
const speedInput = document.getElementById("speedInput");
const boxInput = document.getElementById("boxInput");

let box = 20; 
let snake = [];
let direction = "RIGHT";
let food = {};
let bonus = null; 
let bonusTimeout;
let score = 0;
let game;
let speed = 150;
let level = 1;
let paused = false;
let countdown = 3;

const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const gameOverSound = new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg");
const bonusSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

const pauseBtn = document.getElementById("pauseBtn");

function createFood() {
  do {
    food = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y) || (bonus && bonus.x === food.x && bonus.y === food.y));
}

function createBonus() {
  do {
    bonus = {
      x: Math.floor(Math.random() * (canvas.width / box)) * box,
      y: Math.floor(Math.random() * (canvas.height / box)) * box,
    };
  } while (
    snake.some(segment => segment.x === bonus.x && segment.y === bonus.y) ||
    (food.x === bonus.x && food.y === bonus.y)
  );

  clearTimeout(bonusTimeout);
  bonusTimeout = setTimeout(() => {
    bonus = null;
  }, 7000);
}

function drawGrid() {
  ctx.strokeStyle = "#1e2a38";
  for (let x = 0; x <= canvas.width; x += box) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y <= canvas.height; y += box) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function draw() {
  if (paused) {
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#22c55e";
    ctx.font = "bold 40px Poppins";
    ctx.textAlign = "center";
    ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  for (let i = 0; i < snake.length; i++) {
    const gradient = ctx.createRadialGradient(
      snake[i].x + box / 2,
      snake[i].y + box / 2,
      5,
      snake[i].x + box / 2,
      snake[i].y + box / 2,
      15
    );
    gradient.addColorStop(0, i === 0 ? "#22c55e" : "#a7f3d0");
    gradient.addColorStop(1, "#0f172a");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(snake[i].x + box / 2, snake[i].y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
  }


  const foodGradient = ctx.createRadialGradient(
    food.x + box / 2,
    food.y + box / 2,
    5,
    food.x + box / 2,
    food.y + box / 2,
    15
  );
  foodGradient.addColorStop(0, "#dc2626");
  foodGradient.addColorStop(1, "#7f1d1d");
  ctx.fillStyle = foodGradient;
  ctx.beginPath();
  ctx.arc(food.x + box / 2, food.y + box / 2, box / 2, 0, 2 * Math.PI);
  ctx.fill();

 
  if (bonus) {
    const bonusGradient = ctx.createRadialGradient(
      bonus.x + box / 2,
      bonus.y + box / 2,
      5,
      bonus.x + box / 2,
      bonus.y + box / 2,
      15
    );
    bonusGradient.addColorStop(0, "#facc15");
    bonusGradient.addColorStop(1, "#a16207");
    ctx.fillStyle = bonusGradient;
    ctx.beginPath();
    ctx.arc(bonus.x + box / 2, bonus.y + box / 2, box / 2, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.fillStyle = "#a7f3d0";
  ctx.font = "bold 16px Poppins";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 10, 20);
  ctx.fillText(`Level: ${level}`, 10, 40);
  ctx.fillText(`Speed: ${speed}ms`, 10, 60);

  let head = { x: snake[0].x, y: snake[0].y };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 ||
    head.x >= canvas.width ||
    head.y < 0 ||
    head.y >= canvas.height ||
    collision(head, snake)
  ) {
    clearInterval(game);
    gameOverSound.play();
    countdown = 3;
    pauseBtn.disabled = true;
    showRestartCountdown();
    return;
  }


  if (head.x === food.x && head.y === food.y) {
    score++;
    eatSound.play();

    if (score % 4 === 0 && !bonus) {
      createBonus();
    }

    if (score % 5 === 0) {
      level++;
      clearInterval(game);
      speed = Math.max(50, speed - 15);
      game = setInterval(draw, speed);
      document.getElementById("score").textContent = `Score: ${score} (Level Up! Level: ${level})`;
    } else {
      document.getElementById("score").textContent = `Score: ${score}`;
    }

    createFood();
  } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
    score += 3;
    bonusSound.play();
    bonus = null;
    document.getElementById("score").textContent = `Score: ${score} (Bonus!)`;
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function collision(head, arr) {
  for (let i = 0; i < arr.length; i++) {
    if (head.x === arr[i].x && head.y === arr[i].y) return true;
  }
  return false;
}

document.addEventListener("keydown", (e) => {
  if (paused) return;

  if (e.key === "ArrowLeft" && direction !== "RIGHT") direction = "LEFT";
  if (e.key === "ArrowUp" && direction !== "DOWN") direction = "UP";
  if (e.key === "ArrowRight" && direction !== "LEFT") direction = "RIGHT";
  if (e.key === "ArrowDown" && direction !== "UP") direction = "DOWN";

  if (e.key.toLowerCase() === "p") togglePause();
});

function togglePause() {
  if (!game) return;

  paused = !paused;
  pauseBtn.textContent = paused ? "Resume" : "Pause";

  if (!paused) {
    clearInterval(game);
    game = setInterval(draw, speed);
  } else {
    clearInterval(game);
    draw();
  }
}

function startGame() {
  if (game) clearInterval(game);
  snake = [{ x: 200, y: 200 }];
  direction = "RIGHT";
  score = 0;
  level = 1;
  speed = 150;
  paused = false;
  bonus = null;
  clearTimeout(bonusTimeout);
  document.getElementById("score").textContent = "Score: 0";
  createFood();
  game = setInterval(draw, speed);
  pauseBtn.disabled = false;
  pauseBtn.textContent = "Pause";
}

function resetGame() {
  clearInterval(game);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake = [];
  score = 0;
  level = 1;
  speed = 150;
  paused = false;
  bonus = null;
  clearTimeout(bonusTimeout);
  document.getElementById("score").textContent = "Score: 0";
  pauseBtn.disabled = true;
  pauseBtn.textContent = "Pause";
}

function showRestartCountdown() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#dc2626";
  ctx.font = "bold 30px Poppins";
  ctx.textAlign = "center";
  ctx.fillText(`Game Over!`, canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(`Restarting in ${countdown}`, canvas.width / 2, canvas.height / 2 + 30);

  countdown--;
  if (countdown < 0) {
    clearInterval(game);
    startGame();
  } else {
    setTimeout(showRestartCountdown, 1000);
  }
}

function openSettings() {
  speedInput.value = speed;
  boxInput.value = box;
  settingsModal.style.display = "block";
}

function closeSettings() {
  settingsModal.style.display = "none";
}

function applySettings() {
  const newSpeed = parseInt(speedInput.value);
  const newBox = parseInt(boxInput.value);

  if (newSpeed >= 50 && newSpeed <= 500) {
    speed = newSpeed;
  }

  if (newBox >= 10 && newBox <= 40) {
    box = newBox;
  }

  if (game) {
    clearInterval(game);
    game = setInterval(draw, speed);
  }
  closeSettings();
}



const joystickCanvas = document.getElementById('joystick');
const jctx = joystickCanvas.getContext('2d');

const joystickRadius = joystickCanvas.width / 2;
const knobRadius = 30;
let knobX = joystickRadius;
let knobY = joystickRadius;

let dragging = false;

function drawJoystick() {
  jctx.clearRect(0, 0, joystickCanvas.width, joystickCanvas.height);

  let baseGradient = jctx.createRadialGradient(joystickRadius, joystickRadius, joystickRadius * 0.1, joystickRadius, joystickRadius, joystickRadius);
  baseGradient.addColorStop(0, '#22c55e88');
  baseGradient.addColorStop(1, '#0f172a');
  jctx.fillStyle = baseGradient;
  jctx.beginPath();
  jctx.arc(joystickRadius, joystickRadius, joystickRadius - 5, 0, Math.PI * 2);
  jctx.fill();

  let knobGradient = jctx.createRadialGradient(knobX, knobY, knobRadius * 0.2, knobX, knobY, knobRadius);
  knobGradient.addColorStop(0, '#14b8a6');
  knobGradient.addColorStop(1, '#065f46');
  jctx.fillStyle = knobGradient;
  jctx.beginPath();
  jctx.arc(knobX, knobY, knobRadius, 0, Math.PI * 2);
  jctx.fill();
}

drawJoystick();

function updateDirection(dx, dy) {
  const threshold = 15;

  if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dx > 0 && direction !== "LEFT") direction = "RIGHT";
    else if (dx < 0 && direction !== "RIGHT") direction = "LEFT";
  } else {
    if (dy > 0 && direction !== "UP") direction = "DOWN";
    else if (dy < 0 && direction !== "DOWN") direction = "UP";
  }
}

function pointerDown(e) {
  e.preventDefault();
  dragging = true;
  moveKnob(e);
}

function pointerUp(e) {
  e.preventDefault();
  dragging = false;
  knobX = joystickRadius;
  knobY = joystickRadius;
  drawJoystick();
}

function pointerMove(e) {
  if (!dragging) return;
  e.preventDefault();
  moveKnob(e);
}

function moveKnob(e) {
  const rect = joystickCanvas.getBoundingClientRect();
  let clientX, clientY;

  if (e.touches) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }

  let x = clientX - rect.left;
  let y = clientY - rect.top;

  let dx = x - joystickRadius;
  let dy = y - joystickRadius;
  let distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > joystickRadius - knobRadius) {
    const angle = Math.atan2(dy, dx);
    dx = (joystickRadius - knobRadius) * Math.cos(angle);
    dy = (joystickRadius - knobRadius) * Math.sin(angle);
  }

  knobX = joystickRadius + dx;
  knobY = joystickRadius + dy;
  drawJoystick();

  updateDirection(dx, dy);
}

joystickCanvas.addEventListener('mousedown', pointerDown);
window.addEventListener('mouseup', pointerUp);
window.addEventListener('mousemove', pointerMove);

joystickCanvas.addEventListener('touchstart', pointerDown);
window.addEventListener('touchend', pointerUp);
window.addEventListener('touchmove', pointerMove);




document.getElementById("startBtn").addEventListener("click", () => {
  startGame();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetGame();
});

pauseBtn.addEventListener("click", () => {
  togglePause();
});

document.getElementById("settingsBtn").addEventListener("click", () => {
  openSettings();
});

document.getElementById("closeSettings").addEventListener("click", () => {
  closeSettings();
});

document.getElementById("applySettings").addEventListener("click", () => {
  applySettings();
});

startGame();
