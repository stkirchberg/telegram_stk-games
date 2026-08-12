const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let playerScore = 0;
let botScore = 0;
let isRunning = false;
let waitingForInput = true;
let isPaused = false;

const paddleWidth = 90;
const paddleHeight = 14;
const ballRadius = 8;
const baseSpeed = 4.5;
let currentSpeed = baseSpeed;

const player = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - paddleHeight - 15,
  width: paddleWidth,
  height: paddleHeight,
  speed: 8
};

const bot = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: 15,
  width: paddleWidth,
  height: paddleHeight,
  speed: 4.5
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: 0,
  dy: 0
};

let leftPressed = false;
let rightPressed = false;
let isDragging = false;

function getCSSVar(name) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function status(text) {
  statusEl.textContent = text;
}

function prepareBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  currentSpeed = baseSpeed;
  ball.dx = 0;
  ball.dy = 0;
  waitingForInput = true;
}

function launchBall() {
  if (!waitingForInput || isPaused) return;
  waitingForInput = false;
  const dirY = Math.random() > 0.5 ? 1 : -1;
  const dirX = Math.random() > 0.5 ? 1 : -1;
  ball.dy = dirY * currentSpeed * 0.8;
  ball.dx = dirX * currentSpeed * 0.6;
  status('Game in progress...');
}

function resetGame() {
  playerScore = 0;
  botScore = 0;
  isPaused = false;
  player.x = canvas.width / 2 - player.width / 2;
  bot.x = canvas.width / 2 - bot.width / 2;
  prepareBall();
  status('Move paddle to start');
  if (!isRunning) {
    isRunning = true;
    loop();
  }
}

function handleGoal(scorer) {
  isPaused = true;
  if (scorer === 'player') {
    playerScore++;
    status('Point for You! (' + playerScore + ' - ' + botScore + ')');
  } else {
    botScore++;
    status('Point for Computer! (' + playerScore + ' - ' + botScore + ')');
  }

  setTimeout(() => {
    isPaused = false;
    prepareBall();
    status('Move paddle to continue (' + playerScore + ' - ' + botScore + ')');
  }, 1500);
}

function increaseSpeed() {
  currentSpeed = Math.min(currentSpeed + 0.35, 12);
  const angle = Math.atan2(ball.dy, ball.dx);
  ball.dx = Math.cos(angle) * currentSpeed;
  ball.dy = Math.sin(angle) * currentSpeed;
}

function update() {
  if (isPaused) return;

  if (leftPressed && player.x > 0) {
    player.x -= player.speed;
    if (waitingForInput) launchBall();
  }
  if (rightPressed && player.x < canvas.width - player.width) {
    player.x += player.speed;
    if (waitingForInput) launchBall();
  }

  if (!waitingForInput) {
    const botCenter = bot.x + bot.width / 2;
    if (botCenter < ball.x - 12) {
      bot.x += bot.speed;
    } else if (botCenter > ball.x + 12) {
      bot.x -= bot.speed;
    }
    bot.x = Math.max(0, Math.min(canvas.width - bot.width, bot.x));

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
      ball.dx = -ball.dx;
    }

    if (ball.y + ball.radius >= player.y && ball.y - ball.radius <= player.y + player.height) {
      if (ball.x >= player.x && ball.x <= player.x + player.width) {
        ball.dy = -Math.abs(ball.dy);
        let hitPoint = (ball.x - (player.x + player.width / 2)) / (player.width / 2);
        ball.dx = hitPoint * (currentSpeed * 0.8);
        increaseSpeed();
      }
    }

    if (ball.y - ball.radius <= bot.y + bot.height && ball.y + ball.radius >= bot.y) {
      if (ball.x >= bot.x && ball.x <= bot.x + bot.width) {
        ball.dy = Math.abs(ball.dy);
        increaseSpeed();
      }
    }

    if (ball.y - ball.radius <= 0) {
      handleGoal('player');
    } else if (ball.y + ball.radius >= canvas.height) {
      handleGoal('bot');
    }
  }
}

function draw() {
  ctx.fillStyle = getCSSVar('--bgc');
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = getCSSVar('--line');
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 8]);
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#2cdb00';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  ctx.fillStyle = '#00f7ff';
  ctx.fillRect(bot.x, bot.y, bot.width, bot.height);

  ctx.fillStyle = getCSSVar('--text');
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function loop() {
  if (!isRunning) return;
  update();
  draw();
  requestAnimationFrame(loop);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = true;
  if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft' || e.key === 'a') leftPressed = false;
  if (e.key === 'ArrowRight' || e.key === 'd') rightPressed = false;
});

function handlePointer(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const pointerX = (e.clientX - rect.left) * scaleX;
  const newX = Math.max(0, Math.min(canvas.width - player.width, pointerX - player.width / 2));
  
  if (Math.abs(newX - player.x) > 1 && waitingForInput) {
    launchBall();
  }
  player.x = newX;
}

canvas.addEventListener('pointerdown', (e) => {
  isDragging = true;
  canvas.setPointerCapture(e.pointerId);
  handlePointer(e);
});

canvas.addEventListener('pointermove', (e) => {
  if (isDragging) {
    handlePointer(e);
  }
});

canvas.addEventListener('pointerup', (e) => {
  isDragging = false;
  canvas.releasePointerCapture(e.pointerId);
});

canvas.addEventListener('pointercancel', () => {
  isDragging = false;
});

document.getElementById('mode-switch').addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  draw();
});

document.getElementById('new').addEventListener('click', () => {
  resetGame();
});

function resizeCanvas() {
  const wrap = document.getElementById('board-wrap');
  const maxW = wrap.clientWidth - 20;
  const maxH = wrap.clientHeight - 20;
  let w = maxW;
  let h = w * 1.5;
  if (h > maxH) {
    h = maxH;
    w = h / 1.5;
  }
  canvas.style.width = w + 'px';
  canvas.style.height = h + 'px';
  draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
resetGame();