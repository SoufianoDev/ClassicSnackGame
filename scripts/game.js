const gameBoard = document.getElementById("game-board");
const startScreen = document.getElementById("start-screen");
const startButton = document.getElementById("start-button");
const gameOverDialog = document.getElementById("game-over-dialog");
const restartButton = document.getElementById("restart-button");
const mainMenuButton = document.getElementById("main-menu-button");
const scoreElement = document.getElementById("score");
const gameScoreElement = document.getElementById("game-score");
const finalScoreElement = document.getElementById("final-score");
const mobileControls = document.getElementById("mobile-controls");

let snake = [];
let food = { x: 5, y: 5 };
let worm = null;
let direction = { x: 0, y: 0 };
let gameInterval;
let gameSpeed = 150;
let score = 0;
let gameScore = "0"; // String variable for game score
let isWormActive = false;
let wormDirection = { x: 0, y: 0 };
let wormTimer = null;
let lastWormScore = 0; // Track the score when the worm was last eaten

const appleSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128.1 146.4">
        <g transform="translate(0, 0)">
            <path fill="#91E63D" d="M64.3 12.5C69.9 22.3 65.5 35.4 65.5 35.4C65.5 35.4 51.9 32.7 46.2 22.9C40.5 13.1 45 0 45 0C45 0 58.6 2.7 64.3 12.5Z"/>
            <path fill="#8E3AE2" d="M128.1 75.1C128.1 110.4 99 146.4 63.6 146.4C28.2 146.4 0 110.5 0 75.1C0 59.9 0.7 44.8 14.1 35.1C37.3 18.2 56.8 39.7 63.6 39.7C70.4 39.7 98.6 21.1 114 35.1C129.4 49.1 128.1 60 128.1 75.1Z"/>
            <path fill="#91E63D" stroke="#FFF" stroke-width="2" d="M85.6 24.3C79.3 33.6 65.5 35.4 65.5 35.4C65.5 35.4 62 22 68.3 12.6C74.6 3.2 88.4 1.5 88.4 1.5C88.4 1.5 91.9 15 85.6 24.3Z"/>
            <circle fill="#FFF" cx="-30.36" cy="-9.8" r="12.9" transform="translate(30.36, 9.8)"/>
        </g>
    </svg>
`;

function startGame() {
  startScreen.style.display = "none";
  gameBoard.style.display = "grid";
  gameScoreElement.style.display = "block"; // Show game score during gameplay
  gameOverDialog.style.display = "none";
  if (window.innerWidth <= 1024) {
    mobileControls.style.display = "grid"; // Show mobile controls during gameplay
  }
  resetGame();
  gameInterval = setInterval(updateGame, gameSpeed);
}

function resetGame() {
  // Initialize snake with 3 segments
  snake = [
    { x: 10, y: 10 }, // Head
    { x: 9, y: 10 }, // Middle
    { x: 8, y: 10 }, // Tail
  ];
  direction = { x: 1, y: 0 }; // Initial direction: right
  score = 0;
  gameScore = "0"; // Reset game score
  lastWormScore = 0;
  updateScore();
  generateFood();
  worm = null;
  isWormActive = false;
  clearTimeout(wormTimer);
}

function updateScore() {
  scoreElement.textContent = `Score: ${score}`;
  gameScoreElement.textContent = `Game Score: ${gameScore}`; // Update game score
  finalScoreElement.textContent = score;
}

function updateGame() {
  moveSnake();
  if (checkSelfCollision()) {
    endGame();
    return;
  }
  if (snake[0].x === food.x && snake[0].y === food.y) {
    snake.push({});
    score += 10;
    gameScore = String(score); // Update game score as a string
    updateScore();
    generateFood();
    if (score >= 100 && !isWormActive && score >= lastWormScore + 100) {
      activateWorm();
    }
  }
  if (
    worm &&
    worm.some((segment) => segment.x === snake[0].x && segment.y === snake[0].y)
  ) {
    score += 100; // Add 100 points for eating the worm
    gameScore = String(score); // Update game score as a string
    updateScore();
    increaseSnakeLength(4); // Increase snake length by 4
    worm = null;
    isWormActive = false;
    lastWormScore = score; // Update the last worm score
    clearTimeout(wormTimer);
  }
  if (isWormActive) {
    moveWorm();
  }
  drawGame();
}

function moveSnake() {
  const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
  if (head.x < 0) head.x = 19;
  if (head.x >= 20) head.x = 0;
  if (head.y < 0) head.y = 19;
  if (head.y >= 20) head.y = 0;
  snake.unshift(head);
  if (!(snake[0].x === food.x && snake[0].y === food.y)) {
    snake.pop();
  }
}

function generateFood() {
  do {
    food.x = Math.floor(Math.random() * 20);
    food.y = Math.floor(Math.random() * 20);
  } while (
    snake.some((segment) => segment.x === food.x && segment.y === food.y)
  );
}

function activateWorm() {
  if (!isWormActive) {
    worm = [
      { x: food.x, y: food.y },
      { x: food.x, y: food.y + 1 },
      { x: food.x, y: food.y + 2 },
      { x: food.x, y: food.y + 3 },
    ];
    isWormActive = true;
    wormDirection = { x: 0, y: -1 }; // Initial direction: up
  }
}

function moveWorm() {
  if (!worm) return;

  // Calculate new head position
  const newHead = {
    x: worm[0].x + wormDirection.x,
    y: worm[0].y + wormDirection.y,
  };

  // Ensure the worm stays within the game board
  if (newHead.x < 0) newHead.x = 19;
  if (newHead.x >= 20) newHead.x = 0;
  if (newHead.y < 0) newHead.y = 19;
  if (newHead.y >= 20) newHead.y = 0;

  // Move the worm
  worm.unshift(newHead);
  worm.pop();

  // Change direction randomly to simulate fleeing behavior
  if (Math.random() < 0.3) {
    const possibleDirections = [
      { x: 0, y: -1 }, // Up
      { x: 0, y: 1 }, // Down
      { x: -1, y: 0 }, // Left
      { x: 1, y: 0 }, // Right
    ];
    const randomDirection =
      possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    wormDirection = randomDirection;
  }
}

function increaseSnakeLength(amount) {
  for (let i = 0; i < amount; i++) {
    snake.push({ ...snake[snake.length - 1] });
  }
}

function checkSelfCollision() {
  const head = snake[0];
  return snake
    .slice(1)
    .some((segment) => segment.x === head.x && segment.y === head.y);
}

function endGame() {
  clearInterval(gameInterval);
  gameOverDialog.style.display = "block";
  mobileControls.style.display = "none"; // Hide mobile controls on game over
  finalScoreElement.textContent = score; // Display the final score
}

function returnToMainMenu() {
  gameOverDialog.style.display = "none";
  startScreen.style.display = "flex";
  gameScoreElement.style.display = "none"; // Hide game score in main menu
  mobileControls.style.display = "none"; // Hide mobile controls in main menu
  scoreElement.textContent = `Score: ${score}`; // Update the score in the start screen
}

function drawGame() {
  gameBoard.innerHTML = "";
  snake.forEach((segment, index) => {
    const snakeElement = document.createElement("div");
    snakeElement.classList.add("cell", index === 0 ? "snake-head" : "snake");
    snakeElement.style.gridColumnStart = segment.x + 1;
    snakeElement.style.gridRowStart = segment.y + 1;
    gameBoard.appendChild(snakeElement);
  });

  if (!isWormActive) {
    const foodElement = document.createElement("div");
    foodElement.classList.add("cell", "food");
    foodElement.style.gridColumnStart = food.x + 1;
    foodElement.style.gridRowStart = food.y + 1;
    foodElement.innerHTML = appleSVG;
    gameBoard.appendChild(foodElement);
  }

  if (worm) {
    worm.forEach((segment, index) => {
      const wormElement = document.createElement("div");
      wormElement.classList.add("cell", "worm");
      wormElement.style.gridColumnStart = segment.x + 1;
      wormElement.style.gridRowStart = segment.y + 1;
      gameBoard.appendChild(wormElement);
      
    });
  }
}

// Function to change direction based on mobile controls
function changeDirection(dir) {
  switch (dir) {
    case "up":
      if (direction.y === 0) direction = { x: 0, y: -1 };
      break;
    case "down":
      if (direction.y === 0) direction = { x: 0, y: 1 };
      break;
    case "left":
      if (direction.x === 0) direction = { x: -1, y: 0 };
      break;
    case "right":
      if (direction.x === 0) direction = { x: 1, y: 0 };
      break;
  }
}

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", startGame);
mainMenuButton.addEventListener("click", returnToMainMenu);

window.addEventListener("keydown", (e) => {
  switch (e.key.toLowerCase()) {
    case "arrowup":
    case "w":
      if (direction.y === 0) direction = { x: 0, y: -1 }; // Up
      break;
    case "arrowdown":
    case "s":
      if (direction.y === 0) direction = { x: 0, y: 1 }; // Down
      break;
    case "arrowleft":
    case "a":
      if (direction.x === 0) direction = { x: -1, y: 0 }; // Left
      break;
    case "arrowright":
    case "d":
      if (direction.x === 0) direction = { x: 1, y: 0 }; // Right
      break;
  }
});

// Add Swipe Controls using Hammer.js
const gameContainer = document.getElementById("game-container");
const hammer = new Hammer(gameContainer);

hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

hammer.on("swipe", (event) => {
  switch (event.direction) {
    case Hammer.DIRECTION_UP:
      if (direction.y === 0) direction = { x: 0, y: -1 }; // Up
      break;
    case Hammer.DIRECTION_DOWN:
      if (direction.y === 0) direction = { x: 0, y: 1 }; // Down
      break;
    case Hammer.DIRECTION_LEFT:
      if (direction.x === 0) direction = { x: -1, y: 0 }; // Left
      break;
    case Hammer.DIRECTION_RIGHT:
      if (direction.x === 0) direction = { x: 1, y: 0 }; // Right
      break;
  }
});

// Detect orientation change on mobile devices
window.addEventListener("orientationchange", function () {
  if (
    window.innerWidth <= 1024 &&
    (window.orientation === 90 || window.orientation === -90)
  ) {
    alert("Please rotate your device to portrait mode to play the game.");
  }
});

// Check orientation on page load for mobile devices
if (window.innerWidth <= 1024 && window.innerWidth > window.innerHeight) {
  alert("Please rotate your device to portrait mode to play the game.");
}
