const canvas = document.getElementById("tetris");
const ctx = canvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

ctx.scale(BLOCK, BLOCK);

const colors = [
  null,
  "#00f0f0",
  "#0000f0",
  "#f0a000",
  "#f0f000",
  "#00f000",
  "#a000f0",
  "#f00000"
];

const pieces = [
  [[1, 1, 1, 1]],

  [
    [2, 0, 0],
    [2, 2, 2]
  ],

  [
    [0, 0, 3],
    [3, 3, 3]
  ],

  [
    [4, 4],
    [4, 4]
  ],

  [
    [0, 5, 5],
    [5, 5, 0]
  ],

  [
    [0, 6, 0],
    [6, 6, 6]
  ],

  [
    [7, 7, 0],
    [0, 7, 7]
  ]
];

let board;
let player;

let score = 0;
let lines = 0;
let level = 1;

let dropCounter = 0;
let lastTime = 0;
let dropInterval = 1000;

let gameOver = false;


// ==========================
// TABULEIRO
// ==========================

function createBoard() {
  return Array.from(
    { length: ROWS },
    () => Array(COLS).fill(0)
  );
}


// ==========================
// CRIAR PEÇA
// ==========================

function createPiece() {
  const piece =
    pieces[Math.floor(Math.random() * pieces.length)];

  return piece.map(row => [...row]);
}


// ==========================
// COLISÃO
// ==========================

function collide() {

  const m = player.matrix;
  const o = player.pos;

  for (let y = 0; y < m.length; y++) {

    for (let x = 0; x < m[y].length; x++) {

      if (m[y][x] === 0) {
        continue;
      }

      const newX = x + o.x;
      const newY = y + o.y;

      if (newX < 0 || newX >= COLS) {
        return true;
      }

      if (newY >= ROWS) {
        return true;
      }

      if (
        newY >= 0 &&
        board[newY][newX] !== 0
      ) {
        return true;
      }
    }
  }

  return false;
}


// ==========================
// NOVA PEÇA
// ==========================

function resetPlayer() {

  player.matrix = createPiece();

  player.pos.y = 0;

  player.pos.x =
    Math.floor(COLS / 2) -
    Math.floor(player.matrix[0].length / 2);

  if (collide()) {

    gameOver = true;

    saveScore();

    alert(
      "Game Over!\nPontuação: " + score
    );
  }
}


// ==========================
// DESENHAR MATRIZ
// ==========================

function drawMatrix(matrix, offset) {

  matrix.forEach((row, y) => {

    row.forEach((value, x) => {

      if (value !== 0) {

        ctx.fillStyle = colors[value];

        ctx.fillRect(
          x + offset.x,
          y + offset.y,
          1,
          1
        );

        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 0.05;

        ctx.strokeRect(
          x + offset.x,
          y + offset.y,
          1,
          1
        );
      }
    });
  });
}


// ==========================
// DESENHAR JOGO
// ==========================

function draw() {

  ctx.fillStyle = "#020617";

  ctx.fillRect(
    0,
    0,
    COLS,
    ROWS
  );

  drawMatrix(
    board,
    { x: 0, y: 0 }
  );

  drawMatrix(
    player.matrix,
    player.pos
  );
}


// ==========================
// JUNTAR PEÇA
// ==========================

function merge() {

  player.matrix.forEach((row, y) => {

    row.forEach((value, x) => {

      if (value !== 0) {

        board[
          y + player.pos.y
        ][
          x + player.pos.x
        ] = value;
      }
    });
  });
}


// ==========================
// DESCER
// ==========================

function playerDrop() {

  player.pos.y++;

  if (collide()) {

    player.pos.y--;

    merge();

    clearLines();

    resetPlayer();
  }

  dropCounter = 0;
}


// ==========================
// MOVER
// ==========================

function playerMove(dir) {

  player.pos.x += dir;

  if (collide()) {
    player.pos.x -= dir;
  }
}


// ==========================
// GIRAR
// ==========================

function rotate(matrix) {

  return matrix[0].map(
    (_, index) =>
      matrix
        .map(row => row[index])
        .reverse()
  );
}


function playerRotate() {

  const oldMatrix = player.matrix;
  const oldX = player.pos.x;

  player.matrix =
    rotate(player.matrix);

  let offset = 1;

  while (collide()) {

    player.pos.x += offset;

    offset =
      -(offset + (offset > 0 ? 1 : -1));

    if (
      offset >
      player.matrix[0].length
    ) {

      player.matrix = oldMatrix;
      player.pos.x = oldX;

      return;
    }
  }
}


// ==========================
// QUEDA RÁPIDA
// ==========================

function hardDrop() {

  while (!collide()) {
    player.pos.y++;
  }

  player.pos.y--;

  merge();

  clearLines();

  resetPlayer();

  dropCounter = 0;
}


// ==========================
// LIMPAR LINHAS
// ==========================

function clearLines() {

  let cleared = 0;

  outer:

  for (
    let y = ROWS - 1;
    y >= 0;
    y--
  ) {

    for (
      let x = 0;
      x < COLS;
      x++
    ) {

      if (board[y][x] === 0) {
        continue outer;
      }
    }

    const row =
      board.splice(y, 1)[0];

    board.unshift(row.fill(0));

    y++;

    cleared++;
  }

  if (cleared > 0) {

    const points =
      [0, 100, 300, 500, 800];

    score +=
      points[cleared] * level;

    lines += cleared;

    level =
      Math.floor(lines / 10) + 1;

    updateSpeed();

    updateInfo();
  }
}


// ==========================
// VELOCIDADE
// ==========================

function updateSpeed() {

  dropInterval =
    Math.max(
      100,
      1000 - (level - 1) * 80
    );
}


// ==========================
// INFORMAÇÕES
// ==========================

function updateInfo() {

  document.getElementById("score").textContent =
    score;

  document.getElementById("lines").textContent =
    lines;

  document.getElementById("level").textContent =
    level;
}


// ==========================
// RANKING
// ==========================

function saveScore() {

  const name =
    document.getElementById("playerName").value.trim();

  const playerClass =
    document.getElementById("playerClass").value.trim();

  if (!name || !playerClass) {
    return;
  }

  let ranking =
    JSON.parse(
      localStorage.getItem("tetrisRanking")
    ) || [];

  ranking.push({
    name: name,
    playerClass: playerClass,
    score: score
  });

  ranking.sort(
    (a, b) => b.score - a.score
  );

  ranking =
    ranking.slice(0, 10);

  localStorage.setItem(
    "tetrisRanking",
    JSON.stringify(ranking)
  );

  updateRanking();
}


// ==========================
// MOSTRAR RANKING
// ==========================

function updateRanking() {

  const rankingList =
    document.getElementById("rankingList");

  if (!rankingList) {
    return;
  }

  rankingList.innerHTML = "";

  const ranking =
    JSON.parse(
      localStorage.getItem("tetrisRanking")
    ) || [];

  ranking.forEach((item, index) => {

    const li =
      document.createElement("li");

    li.innerHTML =
      `<strong>${index + 1}º</strong>
      ${item.name} - ${item.playerClass}
      <br>
      🎯 ${item.score} pontos`;

    rankingList.appendChild(li);
  });
}


// ==========================
// MÚSICA
// ==========================

const music =
  document.getElementById("arcadeMusic");

let musicPlaying = false;

function toggleMusic() {

  if (!music) {
    return;
  }

  if (musicPlaying) {

    music.pause();

    musicPlaying = false;

    document.getElementById(
      "musicStatus"
    ).textContent = "OFF";

  } else {

    music.play()
      .then(() => {

        musicPlaying = true;

        document.getElementById(
          "musicStatus"
        ).textContent = "ON";

      })
      .catch(error => {

        console.log(
          "Erro ao tocar música:",
          error
        );
      });
  }
}


// ==========================
// REINICIAR
// ==========================

function restartGame() {

  board = createBoard();

  player = {

    pos: {
      x: 0,
      y: 0
    },

    matrix: null
  };

  score = 0;
  lines = 0;
  level = 1;

  dropCounter = 0;
  lastTime = 0;

  dropInterval = 1000;

  gameOver = false;

  updateInfo();

  resetPlayer();
}


// ==========================
// TECLADO
// ==========================

document.addEventListener(
  "keydown",
  event => {

    if (gameOver) {
      return;
    }

    if (event.key === "ArrowLeft") {

      playerMove(-1);

    } else if (
      event.key === "ArrowRight"
    ) {

      playerMove(1);

    } else if (
      event.key === "ArrowDown"
    ) {

      playerDrop();

    } else if (
      event.key === "ArrowUp"
    ) {

      playerRotate();

    } else if (
      event.code === "Space"
    ) {

      event.preventDefault();

      hardDrop();
    }
  }
);


// ==========================
// LOOP DO JOGO
// ==========================

function update(time = 0) {

  const deltaTime =
    time - lastTime;

  lastTime = time;

  dropCounter += deltaTime;

  if (
    !gameOver &&
    dropCounter > dropInterval
  ) {

    playerDrop();
  }

  draw();

  requestAnimationFrame(update);
}


// ==========================
// INICIAR
// ==========================

updateRanking();

restartGame();

update();