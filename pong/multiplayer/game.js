const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');

let p1Score = 0;
let p2Score = 0;
let isRunning = false;
let waitingForInput = true;
let isPaused = false;

const paddleWidth = 90;
const paddleHeight = 14;
const ballRadius = 8;
const baseSpeed = 4.5;
let currentSpeed = baseSpeed;

const p1 = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: canvas.height - paddleHeight - 15,
  width: paddleWidth,
  height: paddleHeight,
  speed: 8
};

const p2 = {
  x: canvas.width / 2 - paddleWidth / 2,
  y: 15,
  width: paddleWidth,
  height: paddleHeight,
  speed: 8
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  dx: 0,
  dy: 0
};

let p1Left = false, p1Right = false;
let p2Left = false, p2Right = false;

const activePointers = new Map();

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

function launchBall(firstMover) {
  if (!waitingForInput || isPaused) return;
  waitingForInput = false;

  const dirY = (firstMover === 1) ? 1 : -1;
  const dirX = Math.random() > 0.5 ? 1 : -1;

  ball.dy = dirY * currentSpeed * 0.8;
  ball.dx = dirX * currentSpeed * 0.6;
  status('Game in progress...');
}

function resetGame() {
  p1Score = 0;
  p2Score = 0;
  isPaused = false;
  p1.x = canvas.width / 2 - p1.width / 2;
  p2.x = canvas.width / 2 - p2.width / 2;
  prepareBall();
  status('Move a paddle to start');
  if (!isRunning) {
    isRunning = true;
    loop();
  }
}

function handleGoal(scorer) {
  isPaused = true;
  if (scorer === 'p1') {
    p1Score++;
    status('Point for Player 1! (' + p1Score + ' - ' + p2Score + ')');
  } else {
    p2Score++;
    status('Point for Player 2! (' + p1Score + ' - ' + p2Score + ')');
  }

  setTimeout(() => {
    isPaused = false;
    prepareBall();
    status('Move a paddle to continue (' + p1Score + ' - ' + p2Score + ')');
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

  if (p1Left && p1.x > 0) {
    p1.x -= p1.speed;
    if (waitingForInput) launchBall(1);
  }
  if (p1Right && p1.x < canvas.width - p1.width) {
    p1.x += p1.speed;
    if (waitingForInput) launchBall(1);
  }

  if (p2Left && p2.x > 0) {
    p2.x -= p2.speed;
    if (waitingForInput) launchBall(2);
  }
  if (p2Right && p2.x < canvas.width - p2.width) {
    p2.x += p2.speed;
    if (waitingForInput) launchBall(2);
  }

  if (!waitingForInput) {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) {
      ball.dx = -ball.dx;
    }

    if (ball.y + ball.radius >= p1.y && ball.y - ball.radius <= p1.y + p1.height) {
      if (ball.x >= p1.x && ball.x <= p1.x + p1.width) {
        ball.dy = -Math.abs(ball.dy);
        let hitPoint = (ball.x - (p1.x + p1.width / 2)) / (p1.width / 2);
        ball.dx = hitPoint * (currentSpeed * 0.8);
        increaseSpeed();
      }
    }

    if (ball.y - ball.radius <= p2.y + p2.height && ball.y + ball.radius >= p2.y) {
      if (ball.x >= p2.x && ball.x <= p2.x + p2.width) {
        ball.dy = Math.abs(ball.dy);
        let hitPoint = (ball.x - (p2.x + p2.width / 2)) / (p2.width / 2);
        ball.dx = hitPoint * (currentSpeed * 0.8);
        increaseSpeed();
      }
    }

    if (ball.y - ball.radius <= 0) {
      handleGoal('p1');
    } else if (ball.y + ball.radius >= canvas.height) {
      handleGoal('p2');
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
  ctx.fillRect(p1.x, p1.y, p1.width, p1.height);

  ctx.fillStyle = '#00f7ff';
  ctx.fillRect(p2.x, p2.y, p2.width, p2.height);

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
  if (e.key === 'ArrowLeft') p1Left = true;
  if (e.key === 'ArrowRight') p1Right = true;

  if (e.key === 'a' || e.key === 'A') p2Left = true;
  if (e.key === 'd' || e.key === 'D') p2Right = true;
});

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') p1Left = false;
  if (e.key === 'ArrowRight') p1Right = false;

  if (e.key === 'a' || e.key === 'A') p2Left = false;
  if (e.key === 'd' || e.key === 'D') p2Right = false;
});

function getCanvasPointerPos(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  };
}

function handlePointer(e) {
  const pos = getCanvasPointerPos(e);
  const targetPlayer = activePointers.get(e.pointerId);

  if (targetPlayer === 1) {
    const newX = Math.max(0, Math.min(canvas.width - p1.width, pos.x - p1.width / 2));
    if (Math.abs(newX - p1.x) > 1 && waitingForInput) {
      launchBall(1);
    }
    p1.x = newX;
  } else if (targetPlayer === 2) {
    const newX = Math.max(0, Math.min(canvas.width - p2.width, pos.x - p2.width / 2));
    if (Math.abs(newX - p2.x) > 1 && waitingForInput) {
      launchBall(2);
    }
    p2.x = newX;
  }
}

canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId);
  const pos = getCanvasPointerPos(e);
  const playerNum = pos.y >= canvas.height / 2 ? 1 : 2;
  activePointers.set(e.pointerId, playerNum);
  handlePointer(e);
});

canvas.addEventListener('pointermove', (e) => {
  if (activePointers.has(e.pointerId)) {
    handlePointer(e);
  }
});

canvas.addEventListener('pointerup', (e) => {
  activePointers.delete(e.pointerId);
  try {
    canvas.releasePointerCapture(e.pointerId);
  } catch(err) {}
});

canvas.addEventListener('pointercancel', (e) => {
  activePointers.delete(e.pointerId);
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