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
const paddleSpeed = 5;

// Bola
const ballRadius = 8;
let ballX = canvasWidth / 2;
let ballY = canvasHeight - 30;
let ballDX = 2; // velocidade horizontal
let ballDY = -2; // velocidade vertical

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

// Limpa e redesenha o jogo a cada frame
function draw() {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  drawBall();
  drawPaddle();

  // Atualiza posição da bola
  ballX += ballDX;
  ballY += ballDY;

  // Movimento da raquete
  if (rightPressed && paddleX + paddleWidth < canvasWidth) {
    paddleX += paddleSpeed;
  } else if (leftPressed && paddleX > 0) {
    paddleX -= paddleSpeed;
  }

  // Colisão com as paredes
  if (ballX + ballRadius > canvasWidth || ballX - ballRadius < 0) {
    ballDX = -ballDX;
  }
  if (ballY - ballRadius < 0) {
    ballDY = -ballDY;
  }

  // Colisão com a raquete
  if (
    ballY + ballRadius >= canvasHeight - paddleHeight - 10 &&
    ballX >= paddleX &&
    ballX <= paddleX + paddleWidth
  ) {
    ballDY = -ballDY;
  }
  // Se falhar a raquete (atinge fundo)
  else if (ballY + ballRadius > canvasHeight) {
    document.location.reload(); // reinicia o jogo
  }
  

  requestAnimationFrame(draw);
}

// Inicia o jogo
draw();
