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
let ballDX = 2; // velocidade horizontal
let ballDY = -2; // velocidade vertical

// Variáveis de controle de velocidade
let speedFactor = 1.05; // Aumento de 5% na velocidade ao bater na raquete
let speedDecreaseFactor = 1; // Não diminui a velocidade ao bater nas paredes laterais

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
for (let c = 0; c < blockColumnCount + 1; c++) {
  blocks[c] = [];
  for (let r = 0; r < blockRowCount; r++) {
    blocks[c][r] = {
      x: 0,
      y: 0,
      status: 1,
      color: getRandomColor()
    };
  }
}

// Função para gerar uma nova linha no topo
function generateNewTopRow() {
  let newRow = [];
  for (let c = 0; c < blockColumnCount; c++) {
    newRow.push({
      x: 0,
      y: 0,
      status: 1,
      color: getRandomColor()
    });
  }
  return newRow;
}

// Função para adicionar uma nova linha no topo
function addNewRowAtTop() {
  for (let c = 0; c < blocks.length; c++) {
    // Remove a última linha (a mais baixa visualmente)
    blocks[c].pop();

    // Adiciona nova linha no topo
    blocks[c].unshift({
      x: 0,
      y: 0,
      status: 1,
      color: getRandomColor()
    });
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
  
  // Sombra
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "#fff";
  ctx.fill();
  ctx.closePath();
  
  // Reset da sombra
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}  

// Desenha a raquete
function drawPaddle() {
  ctx.beginPath();
  
  // Sombra
  ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Raquete com cantos arredondados (10px de raio)
  ctx.roundRect(paddleX, canvasHeight - paddleHeight - 10, paddleWidth, paddleHeight, 10);
  ctx.fillStyle = "#eee";
  ctx.fill();
  ctx.closePath();
  
  // Reset da sombra
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}   

// Desenha os blocos
function drawBlocks() {
  for (let r = 0; r < blockRowCount; r++) {
    const isOddRow = r % 2 !== 0;
    const rowOffset = isOddRow ? blockWidth / 2 : 0;
    const colsInThisRow = isOddRow ? blockColumnCount - 1 : blockColumnCount;
  
    for (let c = 0; c < colsInThisRow; c++) {
      // Usamos c + (isOddRow ? 1 : 0) para indexar corretamente a matriz blocks
      const colIndex = c + (isOddRow ? 1 : 0);
  
      if (blocks[colIndex] && blocks[colIndex][r].status === 1) {
        const blockX = c * blockWidth + blockOffsetLeft + rowOffset;
        const blockY = r * blockHeight + blockOffsetTop;
  
        blocks[colIndex][r].x = blockX;
        blocks[colIndex][r].y = blockY;

        ctx.beginPath();
        ctx.rect(blockX, blockY, blockWidth, blockHeight);
        ctx.fillStyle = blocks[colIndex][r].color;
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)"; // cor da sombra
        ctx.shadowBlur = 4;                     // suavidade
        ctx.shadowOffsetX = 2;                  // deslocamento horizontal
        ctx.shadowOffsetY = 2;                  // deslocamento vertical
        ctx.fill();
        ctx.strokeStyle = "#333"; // cor da borda (podes trocar)
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

// Colisão com os blocos
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
          b.status = 0; // destruir o bloco
          rowsToCheck.add(r); // guarda quais linhas foram tocadas
        }
      }
    }
  }
  
  // Verifica se alguma linha foi completamente destruída
  rowsToCheck.forEach((r) => {
    let rowDestroyed = true;
  
    for (let c = 0; c < blocks.length; c++) {
      if (blocks[c][r] && blocks[c][r].status !== 0) {
        rowDestroyed = false;
        break;
      }
    }
  
    if (rowDestroyed) {
      addNewRowAtTop();
    }
  });
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

function getRandomColor() {
  const colors = ["#e74c3c", "#f39c12", "#f1c40f", "#2ecc71", "#3498db", "#9b59b6", "#1abc9c", "#e67e22"];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Inicia o jogo
draw();