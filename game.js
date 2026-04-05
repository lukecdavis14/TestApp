const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 5;
const gameSpeed = 5;

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    size: ballSize,
    reset: function() {
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
        this.dy = 4 * (Math.random() > 0.5 ? 1 : -1);
    }
};

// Player paddle (left side)
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 6
};

// Computer/AI paddle (right side)
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    speed: 5
};

// Score
let score1 = 0;
let score2 = 0;

// Keyboard input
const keys = {};

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Draw rectangle
function drawRect(x, y, width, height, color = '#fff') {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Draw circle
function drawCircle(x, y, radius, color = '#fff') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw center line
function drawCenterLine() {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Update player position
function updatePlayer() {
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= player.speed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }
}

// Update computer position (simple AI)
function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    
    if (computerCenter < ball.y - 35) {
        computer.y += computer.speed;
    } else if (computerCenter > ball.y + 35) {
        computer.y -= computer.speed;
    }
    
    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - computer.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Bounce off top and bottom
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Check collision with paddles
    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * 5;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy = hitPos * 5;
    }

    // Score points
    if (ball.x - ball.size < 0) {
        score2++;
        document.getElementById('score2').textContent = score2;
        ball.reset();
    }

    if (ball.x + ball.size > canvas.width) {
        score1++;
        document.getElementById('score1').textContent = score1;
        ball.reset();
    }
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Update game state
    updatePlayer();
    updateComputer();
    updateBall();

    // Draw game objects
    drawRect(player.x, player.y, player.width, player.height); // Player paddle
    drawRect(computer.x, computer.y, computer.width, computer.height); // Computer paddle
    drawCircle(ball.x, ball.y, ball.size); // Ball

    requestAnimationFrame(gameLoop);
}

// Start game
gameLoop();