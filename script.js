// Seleção do canvas e contexto 2D
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Dimensões do canvas
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

// Raquete
const paddleWidth = 75;
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
let ballDX = 2; // velocidade horizontal
let ballDY = -2; // velocidade vertical

// Variáveis de controle de velocidade
let speedFactor = 1.15; // Aumento de 50% na velocidade ao bater na raquete
let speedDecreaseFactor = 0.9; // Diminui a velocidade em 10% ao bater nas paredes laterais

// Blocos
const blockRowCount = 6;
const blockColumnCount = 10;
const blockWidth = 70;
const blockHeight = 20;
const blockPadding = 0;
const blockOffsetTop = 0;
const blockOffsetLeft = 0;

let blocks = [];

// Criação dos blocos
for (let c = 0; c < blockColumnCount; c++) {
  blocks[c] = [];
  for (let r = 0; r < blockRowCount; r++) {
    blocks[c][r] = { x: 0, y: 0, status: 1 };
  }
}

// Controlo do teclado
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = true;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = true;
  }
}

function keyUpHandler(e) {
  if (e.key === "Right" || e.key === "ArrowRight") {
    rightPressed = false;
  } else if (e.key === "Left" || e.key === "ArrowLeft") {
    leftPressed = false;
  }
}

// Desenha a bola
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
}

// Desenha a raquete
function drawPaddle() {
  ctx.beginPath();
  ctx.rect(paddleX, canvasHeight - paddleHeight - 10, paddleWidth, paddleHeight);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.closePath();
}

// Desenha os blocos
function drawBlocks() {
  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      if (blocks[c][r].status === 1) {
        const blockX = c * blockWidth + blockOffsetLeft;
        const blockY = r * blockHeight + blockOffsetTop;
        blocks[c][r].x = blockX;
        blocks[c][r].y = blockY;
        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = "#c0392b";
        ctx.fill();
        ctx.closePath();
      }
    }
  }
}

// Colisão com os blocos
function collisionDetection() {
  for (let c = 0; c < blockColumnCount; c++) {
    for (let r = 0; r < blockRowCount; r++) {
      const b = blocks[c][r];
      if (b.status === 1) {
        if (ballX > b.x && ballX < b.x + blockWidth && ballY > b.y && ballY < b.y + blockHeight) {
          ballDY = -ballDY;
          b.status = 0; // Destruir o bloco
        }
      }
    }
  }
}

// Limpa e redesenha o jogo a cada frame
function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBall();
  drawPaddle();
  drawBlocks();
  collisionDetection();

  // Atualiza posição da bola
  ballX += ballDX;
  ballY += ballDY;

  // Movimento da raquete
  if (rightPressed && paddleX + paddleWidth < canvasWidth) {
    paddleX += paddleSpeed;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }

  // Colisão com a raquete
  if (
    ballY + ballRadius >= canvasHeight - paddleHeight - 10 &&
    ballX >= paddleX &&
    ballX <= paddleX + paddleWidth
  ) {
    ballDY = -ballDY * speedFactor; // Aumenta a velocidade vertical (50%)
    ballDX *= speedFactor; // Aumenta a velocidade horizontal (50%)
  }

  // Colisão com as paredes laterais
  if (ballX + ballRadius > canvasWidth) {
    ballDX = -ballDX * speedDecreaseFactor; // Diminui a velocidade horizontal em 10%
    ballX = canvasWidth - ballRadius; // Ajusta a posição da bola para evitar que ela fique presa
  }
  if (ballX - ballRadius < 0) {
    ballDX = -ballDX * speedDecreaseFactor; // Diminui a velocidade horizontal em 10%
    ballX = ballRadius; // Ajusta a posição da bola para evitar que ela fique presa
  }

  // Colisão com as paredes superior e inferior
  if (ballY - ballRadius < 0) {
    ballDY = -ballDY;
  }

  // Colisão com o fundo (final do jogo)
  if (ballY + ballRadius > canvasHeight) {
    document.location.reload(); // reinicia o jogo
  }

  requestAnimationFrame(draw);
}

// Inicia o jogo
draw();
