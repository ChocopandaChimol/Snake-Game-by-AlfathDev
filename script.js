const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startGame');
const pauseBtn = document.getElementById('pauseGame');
const resetBtn = document.getElementById('resetGame');
const settingsBtn = document.getElementById('settingsBtn');

const settingsModal = document.getElementById('settingsModal');
const speedInput = document.getElementById('speedInput');
const boxWidthInput = document.getElementById('boxWidthInput');
const boxHeightInput = document.getElementById('boxHeightInput');
const saveSettingsBtn = document.getElementById('saveSettings');
const cancelSettingsBtn = document.getElementById('cancelSettings');

const btnUp = document.getElementById('btn-up');
const btnDown = document.getElementById('btn-down');
const btnLeft = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
const gameOverSound = new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg");
const bonusSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");

let gridWidth = 20;
let gridHeight = 20;
let tileCountX = 30;
let tileCountY = 20; 


function updateTileCount() {
    tileCountX = Math.floor(canvas.width / gridWidth);
    tileCountY = Math.floor(canvas.height / gridHeight);
}

updateTileCount();

let snake = [];
let direction = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let bonus = null; 
let score = 0;
let gameSpeed = 100;
let gameInterval = null;
let isRunning = false;
let isStarted = false;

let bonusInterval = null;
let bonusTimeout = null;

function resetGame() {
    snake = [];
    direction = { x: 0, y: 0 };
    score = 0;
    bonus = null;
    updateScore();
    clearCanvas();
    draw();
    isStarted = false;
    clearBonusTimers();
}

function initializeGame() {
    snake = [{ x: 8, y: 10 }];
    direction = { x: 1, y: 0 };
    placeFood();
    score = 0;
    updateScore();
    isStarted = true;
    bonus = null;
    startBonusCycle();
    draw();
}

function placeFood() {
    let newFoodPosition;
    while (true) {
        newFoodPosition = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
        };
        if (!snake.some(segment => segment.x === newFoodPosition.x && segment.y === newFoodPosition.y) && !isBonusPosition(newFoodPosition)) {
            break;
        }
    }
    food = newFoodPosition;
}

function placeBonus() {
    let newBonusPosition;
    while (true) {
        newBonusPosition = {
            x: Math.floor(Math.random() * tileCountX),
            y: Math.floor(Math.random() * tileCountY),
        };
        if (!snake.some(segment => segment.x === newBonusPosition.x && segment.y === newBonusPosition.y)
            && !(food.x === newBonusPosition.x && food.y === newBonusPosition.y)) {
            break;
        }
    }
    bonus = newBonusPosition;
    bonusTimeout = setTimeout(() => {
        bonus = null;
    }, 5000);
}

function clearBonusTimers() {
    if (bonusInterval) clearInterval(bonusInterval);
    if (bonusTimeout) clearTimeout(bonusTimeout);
    bonus = null;
}

function startBonusCycle() {
    clearBonusTimers();
    bonusInterval = setInterval(() => {
        placeBonus();
    }, 7000);
}

function isBonusPosition(pos) {
    return bonus && pos.x === bonus.x && pos.y === bonus.y;
}

function clearCanvas() {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    clearCanvas();
    ctx.fillStyle = '#22c55e';
    snake.forEach((segment, index) => {
        ctx.fillRect(segment.x * gridWidth, segment.y * gridHeight, gridWidth - 2, gridHeight - 2);
        if (index === 0) {
            ctx.fillStyle = '#14b8a6';
            ctx.fillRect(segment.x * gridWidth, segment.y * gridHeight, gridWidth - 2, gridHeight - 2);
            ctx.fillStyle = '#22c55e';
        }
    });
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(food.x * gridWidth, food.y * gridHeight, gridWidth - 2, gridHeight - 2);
    if (bonus) {
        ctx.fillStyle = '#facc15'; 
        ctx.fillRect(bonus.x * gridWidth, bonus.y * gridHeight, gridWidth - 2, gridHeight - 2);
    }
}

function updateScore() {
    scoreDisplay.textContent = `Score: ${score}`;
}

function update() {
    if (!isRunning || !isStarted) return;

    const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    if (head.x < 0 || head.x >= tileCountX || head.y < 0 || head.y >= tileCountY) {
        return gameOver();
    }

    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        return gameOver();
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        eatSound.play();
        placeFood();
    } else if (bonus && head.x === bonus.x && head.y === bonus.y) {
        score += 5; 
        updateScore();
        bonusSound.play();   
        bonus = null;
    } else {
        snake.pop();
    }

    draw();
}

function gameOver() {
    isRunning = false;
    clearInterval(gameInterval);
    clearBonusTimers();
    gameOverSound.play();
    alert('Game Over! Your score: ' + score);
    resetGameBtn();
}

function startGame() {
    if (isRunning) return;

    if (!isStarted) initializeGame();

    isRunning = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    resetBtn.disabled = false;

    gameInterval = setInterval(update, gameSpeed);
}

function pauseGame() {
    if (!isRunning) return;
    isRunning = false;
    clearInterval(gameInterval);

    startBtn.disabled = false;
    pauseBtn.disabled = true;
}

function resetGameBtn() {
    isRunning = false;
    clearInterval(gameInterval);
    resetGame();
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    resetBtn.disabled = true;
}

function changeDirection(newDir) {
    if (direction.x === -newDir.x && direction.y === -newDir.y) return;
    direction = newDir;
}


document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
            changeDirection({ x: 0, y: -1 });
            break;
        case 'ArrowDown': case 's': case 'S':
            changeDirection({ x: 0, y: 1 });
            break;
        case 'ArrowLeft': case 'a': case 'A':
            changeDirection({ x: -1, y: 0 });
            break;
        case 'ArrowRight': case 'd': case 'D':
            changeDirection({ x: 1, y: 0 });
            break;
    }
});


btnUp.addEventListener('click', () => changeDirection({ x: 0, y: -1 }));
btnDown.addEventListener('click', () => changeDirection({ x: 0, y: 1 }));
btnLeft.addEventListener('click', () => changeDirection({ x: -1, y: 0 }));
btnRight.addEventListener('click', () => changeDirection({ x: 1, y: 0 }));


startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', pauseGame);
resetBtn.addEventListener('click', resetGameBtn);

// Settings modal
settingsBtn.addEventListener('click', () => {
    speedInput.value = gameSpeed;
    boxWidthInput.value = gridWidth;
    boxHeightInput.value = gridHeight;
    settingsModal.style.display = 'block';
    speedInput.focus();
});

cancelSettingsBtn.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettingsBtn.addEventListener('click', () => {
    const valSpeed = parseInt(speedInput.value, 10);
    const valWidth = parseInt(boxWidthInput.value, 10);
    const valHeight = parseInt(boxHeightInput.value, 10);

    if (valSpeed < 50 || valSpeed > 1000) {
        alert('Please enter a speed between 50 and 1000 ms.');
        return;
    }
    if (valWidth < 10 || valWidth > canvas.width) {
        alert(`Please enter a box width between 10 and ${canvas.width} px.`);
        return;
    }
    if (valHeight < 10 || valHeight > canvas.height) {
        alert(`Please enter a box height between 10 and ${canvas.height} px.`);
        return;
    }

    if (valWidth !== valHeight) {
        alert('Box width and height must be the same to keep the box square.');
        return;
    }

    gameSpeed = valSpeed;
    gridWidth = valWidth;
    gridHeight = valHeight;

    updateTileCount();

    if (isRunning) {
        clearInterval(gameInterval);
        gameInterval = setInterval(update, gameSpeed);
    }

    settingsModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
    }
});

resetGame();
pauseBtn.disabled = true;
resetBtn.disabled = true;
