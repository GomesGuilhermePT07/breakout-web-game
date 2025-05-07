// Seleção do canvas e contexto 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dimensões do canvas
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Raquete
const paddleWidth = 100;
const paddleHeight = 10;
let paddleX = (canvasWidth - paddleWidth) / 2;

// Movimento da raquete
let rightPressed = false;
let leftPressed = false;
const paddleSpeed = 10;

// Bola
const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let ballDX = 2;
let ballDY = -2;

// Variáveis de controle de velocidade
let speedFactor = 1.05;
let speedDecreaseFactor = 1;

// Blocos
const blockRowCount = 6;
const blockColumnCount = 10;
const blockWidth = 70;
const blockHeight = 20;
const blockPadding = 0;
const blockOffsetTop = 0;
const blockOffsetLeft = 0;

let blocks = [];

let score = 0;

// Histórico com nome e score
let scoreHistory = [];

// Criação dos blocos
for (let c = 0; c < blockColumnCount; c++) {
  blocks[c] = [];
  for (let r = 0; r < blockRowCount; r++) {
    const isOddRow = r % 2 !== 0;
    const rowOffset = isOddRow ? blockWidth / 2 : 0;
    blocks[c][r] = {
      x: c * blockWidth + rowOffset,
      y: r * blockHeight,
      status: 1,
      color: getRandomColor()
    };
  }
}

function addNewRowAtTop(destroyedRowIndex) {
  for (let c = 0; c < blocks.length; c++) {
    blocks[c].splice(destroyedRowIndex, 1);
    blocks[c].unshift({
      x: c * blockWidth + (destroyedRowIndex % 2 !== 0 ? blockWidth / 2 : 0),
      y: 0,
      status: 1,
      color: getRandomColor()
    });
  }

  for (let c = 0; c < blocks.length; c++) {
    for (let r = 0; r < blocks[c].length; r++) {
      blocks[c][r].y = r * blockHeight;
    }
  }
}

// Controlo do teclado
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = true;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = true;
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") rightPressed = false;
  else if (e.key === "Left" || e.key === "ArrowLeft") leftPressed = false;
}

function drawBall() {
  ctx.beginPath();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawPaddle() {
  ctx.beginPath();
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.roundRect(paddleX, canvasHeight - paddleHeight - 10, paddleWidth, paddleHeight, 10);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.closePath();
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawBlocks() {
  for (let r = 0; r < blocks[0].length; r++) {
    const isOddRow = r % 2 !== 0;
    const rowOffset = isOddRow ? blockWidth / 2 : 0;
    const colsInThisRow = isOddRow ? blockColumnCount - 1 : blockColumnCount;

    for (let c = 0; c < colsInThisRow; c++) {
      const colIndex = c + (isOddRow ? 1 : 0);

      if (blocks[colIndex] && blocks[colIndex][r].status === 1) {
        const blockX = c * blockWidth + blockOffsetLeft + rowOffset;
        const blockY = r * blockHeight + blockOffsetTop;

        blocks[colIndex][r].x = blockX;
        blocks[colIndex][r].y = blockY;

        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = blocks[colIndex][r].color;
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.stroke();
        ctx.closePath();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }
    }
  }
}

function collisionDetection() {
  let rowsToCheck = new Set();

  for (let c = 0; c < blocks.length; c++) {
    for (let r = 0; r < blocks[c].length; r++) {
      const b = blocks[c][r];
      if (b.status === 1) {
        if (
          ballX > b.x &&
          ballX < b.x + blockWidth &&
          ballY > b.y &&
          ballY < b.y + blockHeight
        ) {
          ballDY = -ballDY;
          b.status = 0;
          score += 10;
          document.getElementById("scoreValue").textContent = score;
          rowsToCheck.add(r);
        }
      }
    }
  }

  rowsToCheck.forEach((r) => {
    let rowDestroyed = true;
    for (let c = 0; c < blocks.length; c++) {
      if (blocks[c][r] && blocks[c][r].status !== 0) {
        rowDestroyed = false;
        break;
      }
    }
    if (rowDestroyed) addNewRowAtTop(r);
  });
}

function drawScore() {
  ctx.font = "16px Gill Sans MT";
  ctx.fillStyle = "#fff";
  ctx.fillText("Score: " + score, 10, 20);
}

function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawScore();
  drawBall();
  drawPaddle();
  drawBlocks();
  collisionDetection();

  ballX += ballDX;
  ballY += ballDY;

  if (rightPressed && paddleX + paddleWidth < canvasWidth) paddleX += paddleSpeed;
  else if (leftPressed && paddleX > 0) paddleX -= paddleSpeed;

  if (
    ballY + ballRadius >= canvasHeight - paddleHeight - 10 &&
    ballX >= paddleX &&
    ballX <= paddleX + paddleWidth
  ) {
    ballDY = -ballDY * speedFactor;
    ballDX *= speedFactor;
  }

  if (ballX + ballRadius > canvasWidth) {
    ballDX = -ballDX * speedDecreaseFactor;
    ballX = canvasWidth - ballRadius;
  }
  if (ballX - ballRadius < 0) {
    ballDX = -ballDX * speedDecreaseFactor;
    ballX = ballRadius;
  }

  if (ballY - ballRadius < 0) {
    ballDY = -ballDY;
  }

  if (ballY + ballRadius > canvasHeight) {
    endGame();
  }

  requestAnimationFrame(draw);
}

function getRandomColor() {
  const colors = ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c", "#e67e22"];
  return colors[Math.floor(Math.random() * colors.length)];
}

function endGame() {
  addScoreToHistory(score);
  resetGame();
}

function resetGame() {
  paddleX = (canvasWidth - paddleWidth) / 2;
  ballX = canvasWidth / 2;
  ballY = canvasHeight - 30;
  ballDX = 2;
  ballDY = -2;

  score = 0;
  document.getElementById("scoreValue").textContent = score;

  blocks = [];
  for (let c = 0; c < blockColumnCount; c++) {
    blocks[c] = [];
    for (let r = 0; r < blockRowCount; r++) {
      const isOddRow = r % 2 !== 0;
      const rowOffset = isOddRow ? blockWidth / 2 : 0;

      blocks[c][r] = {
        x: c * blockWidth + rowOffset,
        y: r * blockHeight,
        status: 1,
        color: getRandomColor()
      };
    }
  }
}

function addScoreToHistory(score) {
  const topScores = [...scoreHistory].sort((a, b) => b.score - a.score);
  if (topScores.length < 5 || score > topScores[topScores.length - 1].score) {
    let name = prompt("Parabéns! Insere as tuas 3 letras:", "").toUpperCase();
    if (!name || name.length !== 3) name = "???";
    scoreHistory.push({ name, score });
  }
  updateScoreHistory();
}

function updateScoreHistory() {
  const scoreList = document.getElementById("scoreList");
  scoreList.innerHTML = "";

  const topScores = [...scoreHistory]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topScores.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Nenhum";
    scoreList.appendChild(li);
    return;
  }

  topScores.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="score-rank">${index + 1}. ${entry.name}</span><span class="score-value">${entry.score} pts</span>`;
    scoreList.appendChild(li);
  });
}

function udpdateScoreboard() {
  const storedScores = JSON.parse(localStorage.getItem('topScores')) || [];
  const scoreList = document.getElementById('scoreList');

  scoreList.innerHTML = '';

  if (storedScores.length === 0) {
    scoreList.innerHTML = '<li>Nenhum</li>';
    return;
  }

  storedScores.slice(0, 5).forEach((entry, index) => {
    const li = document.createElement('li');
    const rank = `${index + 1}.`;
    const name = entry.name.toUpperCase().padEnd(10, ' ');
    const score = `${entry.score} pts`;

    // Junta tudo numa string formatada
    li.textContent = `${rank} ${name} ${score}`;
    scoreList.appendChild(li);
  });
}

draw();