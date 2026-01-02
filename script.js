const board = document.getElementById("board");
const cells = document.querySelectorAll(".cell");
const statusText = document.getElementById("status");
const resetBtn = document.getElementById("resetBtn");
const twoPlayerBtn = document.getElementById("twoPlayerBtn");
const vsComputerBtn = document.getElementById("vsComputerBtn");

const xScoreEl = document.getElementById("xScore");
const oScoreEl = document.getElementById("oScore");

const clickSound = document.getElementById("clickSound");
const winSound = document.getElementById("winSound");

let boardState = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = false;
let vsComputer = false;
let scores = { X: 0, O: 0 };

// Winning combinations
const winConditions = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

// Mode selection
twoPlayerBtn.addEventListener("click", () => { vsComputer = false; startGame(); });
vsComputerBtn.addEventListener("click", () => { vsComputer = true; startGame(); });
resetBtn.addEventListener("click", startGame);

function startGame() {
  boardState = ["", "", "", "", "", "", "", "", ""];
  currentPlayer = "X";
  gameActive = true;
  cells.forEach(cell => { 
    cell.textContent = "";
    cell.classList.remove("highlight");
  });
  statusText.textContent = vsComputer ? "X's Turn (You)" : "X's Turn";
}

cells.forEach(cell => cell.addEventListener("click", handleCellClick));

function handleCellClick(e) {
  const index = e.target.getAttribute("data-index");
  if (boardState[index] !== "" || !gameActive) return;

  makeMove(index, currentPlayer);
  clickSound.play();

  if (checkWinner()) return;

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = vsComputer && currentPlayer === "O" ? "Computer's Turn" : `${currentPlayer}'s Turn`;

  if (vsComputer && currentPlayer === "O" && gameActive) {
    setTimeout(computerMove, 500);
  }
}

function makeMove(index, player) {
  boardState[index] = player;
  cells[index].textContent = player;
}

function computerMove() {
  // Simple AI: Win/block random
  let move = findBestMove("O") || findBestMove("X") || randomMove();
  makeMove(move, "O");
  clickSound.play();
  if (!checkWinner()) {
    currentPlayer = "X";
    statusText.textContent = "X's Turn (You)";
  }
}

function randomMove() {
  let emptyCells = boardState.map((val, idx) => val === "" ? idx : null).filter(v => v !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
}

function findBestMove(player) {
  for (let condition of winConditions) {
    let [a,b,c] = condition;
    let values = [boardState[a], boardState[b], boardState[c]];
    if (values.filter(v => v===player).length === 2 && values.includes("")) {
      return condition[values.indexOf("")];
    }
  }
  return null;
}

function checkWinner() {
  for (let condition of winConditions) {
    const [a,b,c] = condition;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
      statusText.textContent = `${boardState[a]} Wins!`;
      cells[a].classList.add("highlight");
      cells[b].classList.add("highlight");
      cells[c].classList.add("highlight");
      gameActive = false;
      scores[boardState[a]]++;
      xScoreEl.textContent = scores.X;
      oScoreEl.textContent = scores.O;
      winSound.play();
      launchConfetti();
      return true;
    }
  }
  if (!boardState.includes("")) {
    statusText.textContent = "It's a Draw!";
    gameActive = false;
    return true;
  }
  return false;
}

// --- Confetti ---
function launchConfetti() {
  const confetti = document.getElementById("confetti");
  const ctx = confetti.getContext("2d");
  confetti.width = window.innerWidth;
  confetti.height = window.innerHeight;

  let particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push({x: Math.random()*confetti.width, y: Math.random()*confetti.height, r: Math.random()*6+2, d: Math.random()*1+1});
  }

  let interval = setInterval(() => {
    ctx.clearRect(0,0,confetti.width, confetti.height);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `hsl(${Math.random()*360}, 100%, 50%)`;
      ctx.fill();
      p.y += p.d;
      if(p.y > confetti.height) p.y = 0;
    });
  }, 20);

  setTimeout(() => { clearInterval(interval); ctx.clearRect(0,0,confetti.width, confetti.height); }, 3000);
}
