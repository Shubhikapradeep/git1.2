const funFacts = [
    "I once built a Tetris clone in Python just for fun",
    "I’m working on research at QuNAD Lab",
    "I obsessively plan outfits like code — logically and aesthetically"
];

const carouselImages = [
    { src: "bleachndye.png", caption: "Starting my hair dye journey — bleach time!" },
    { src: "hairdyebun.png", caption: "Waiting with dyed hair in a bun 🌀" },
    { src: "redhair.png", caption: "Red hair phase 💥" },
    { src: "purplehair.png", caption: "Went purple... and kinda magical" },
    { src: "garba.png", caption: "Garba night vibes ✨" },
    { src: "ATconcert.png", caption: "At the college fest concert, waiting for Mohit Chauhan🎶" },
    { src: "sunrise.png", caption: "Sunrises make me feel like I'm writing my own poem ☀️" }
];

let carouselIndex = 0;

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

function updateCarousel() {
    const carouselImage = document.getElementById('carouselImage');
    const carouselCaption = document.getElementById('carouselCaption');

    if (carouselImage && carouselCaption) {
        carouselImage.src = carouselImages[carouselIndex].src;
        carouselCaption.textContent = carouselImages[carouselIndex].caption;
    }
}

function nextSlide() {
    carouselIndex = (carouselIndex + 1) % carouselImages.length;
    updateCarousel();
}

function prevSlide() {
    carouselIndex = (carouselIndex - 1 + carouselImages.length) % carouselImages.length;
    updateCarousel();
}

function populateFunFacts() {
    const funFactsList = document.getElementById('funFactsList');
    if (funFactsList) {
        funFactsList.innerHTML = '';
        funFacts.forEach(fact => {
            const li = document.createElement('li');
            li.textContent = fact;
            funFactsList.appendChild(li);
        });
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const gameOverlay = document.getElementById('gameOverlay');
const startGameBtn = document.getElementById('startGameBtn');
const gameMessage = document.getElementById('gameMessage');

let gameRunning = false;
let animationFrameId;

const paddle = {
    height: 10,
    width: 75,
    x: (canvas ? canvas.width - 75 : 0) / 2,
    color: '#8B3A62'
};

const ball = {
    radius: 10,
    x: (canvas ? canvas.width : 0) / 2,
    y: (canvas ? canvas.height - paddle.height - 10 : 0) / 2,
    dx: 4,
    dy: -4,
    color: '#BE4343'
};

let bricks = [];
const brickRowCount = 30;
const brickColumnCount = 8;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 80;
const brickOffsetLeft = 30;

let score = 0;
let lives = 3;

const revealImage = new Image();
revealImage.src = 'surprise.png';

function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function drawPaddle() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
    ctx.fillStyle = paddle.color;
    ctx.fill();
    ctx.closePath();
}

function drawBall() {
    if (!ctx) return;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    if (!ctx) return;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                const gradient = ctx.createLinearGradient(brickX, brickY, brickX + brickWidth, brickY + brickHeight);
                gradient.addColorStop(0, '#A0522D');
                gradient.addColorStop(1, '#CD853F');
                ctx.fillStyle = gradient;
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawRevealedImage() {
    if (!ctx || !revealImage.complete) return;
    ctx.drawImage(revealImage, 0, 0, canvas.width, canvas.height);
}

function drawScore() {
    if (!ctx) return;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FADCCA';
    ctx.fillText(`Score: ${score}`, 8, 20);
}

function drawLives() {
    if (!ctx) return;
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FADCCA';
    ctx.fillText(`Lives: ${lives}`, canvas.width - 65, 20);
}

function collisionDetection() {
    if (!ctx) return;
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                    ball.dy = -ball.dy;
                    b.status = 0;
                    score++;
                    if (score === brickRowCount * brickColumnCount) {
                        winGame();
                    }
                }
            }
        }
    }
}

function update() {
    if (!ctx || !gameRunning) return;

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > canvas.height - paddle.height && ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
        ball.dy = -ball.dy;
    }

    if (ball.y + ball.radius > canvas.height) {
        lives--;
        if (lives === 0) {
            gameOver();
        } else {
            ball.x = canvas.width / 2;
            ball.y = canvas.height - paddle.height - ball.radius;
            ball.dx = 4;
            ball.dy = -4;
            paddle.x = (canvas.width - paddle.width) / 2;
        }
    }

    collisionDetection();
}

function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRevealedImage();

    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();
    drawLives();
}

function gameLoop() {
    update();
    draw();
    if (gameRunning) {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function initGame() {
    score = 0;
    lives = 3;
    createBricks();
    ball.x = canvas.width / 2;
    ball.y = canvas.height - paddle.height - ball.radius;
    ball.dx = 4;
    ball.dy = -4;
    paddle.x = (canvas.width - paddle.width) / 2;
    gameMessage.textContent = '';
    gameOverlay.classList.add('hidden');
}

function startGame() {
    if (!ctx) {
        console.error("Canvas context not available. Cannot start game.");
        return;
    }
    initGame();
    gameRunning = true;
    gameLoop();
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    gameMessage.textContent = `Game Over! Your score: ${score}`;
    gameOverlay.classList.remove('hidden');
    startGameBtn.textContent = 'Play Again';
}

function winGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    gameMessage.textContent = `You Won! Final score: ${score}`;
    gameOverlay.classList.remove('hidden');
    startGameBtn.textContent = 'Play Again';
}

function mouseMoveHandler(e) {
    if (!gameRunning || !canvas) return;
    const relativeX = e.clientX - canvas.getBoundingClientRect().left;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
        if (paddle.x < 0) paddle.x = 0;
        if (paddle.x + paddle.width > canvas.width) paddle.x = canvas.width - paddle.width;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    populateFunFacts();
    updateCarousel();

    const prevBtn = document.getElementById('prevSlideBtn');
    const nextBtn = document.getElementById('nextSlideBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    if (canvas && ctx && startGameBtn && gameOverlay && gameMessage) {
        const gameContainer = canvas.parentElement;
        if (gameContainer) {
            canvas.width = gameContainer.offsetWidth;
            canvas.height = gameContainer.offsetHeight;
            paddle.x = (canvas.width - paddle.width) / 2;
            ball.x = canvas.width / 2;
            ball.y = canvas.height - paddle.height - ball.radius;
        }
        createBricks();
        document.addEventListener('mousemove', mouseMoveHandler);
        startGameBtn.addEventListener('click', startGame);
        draw();
    } else {
        console.error("Game elements (canvas, buttons, etc.) not found in DOM.");
    }
});