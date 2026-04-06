// Soccer Penalty Kick Game - Golf Style Power Meter

let gameState = 'aiming'; // aiming, charging, kicking, goalieReacting, resultDisplay
let score = { goals: 0, saves: 0 };
let canvas, ctx;
let ball;
let goalie;
let power = 0; // 0-100 for power meter
let isCharging = false;
let aimAngle = 0; // Angle to aim at goal (-45 to 45 degrees)
let shootPower = 0; // Final power when shot
let ballTrajectory = null;
let lastMouseX = 0;
let lastMouseY = 0;
let touchStartPos = null;
let resultMessage = '';
let resultTimer = 0;

// Initialize game
function init() {
    canvas = document.getElementById('shootingStarsCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Mouse and touch listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    resetKick();
    gameLoop();
}

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth, 1000);
    canvas.height = Math.min(window.innerHeight, 700);
}

function resetKick() {
    gameState = 'aiming';
    power = 0;
    isCharging = false;
    aimAngle = 0;
    shootPower = 0;
    ballTrajectory = null;
    resultMessage = '';
    resultTimer = 0;
    
    // Initialize ball at penalty spot
    ball = {
        x: canvas.width / 2,
        y: canvas.height * 0.75,
        radius: 8,
        vx: 0,
        vy: 0,
        speed: 0
    };
    
    // Initialize goalie
    goalie = {
        x: canvas.width / 2,
        y: canvas.height * 0.15,
        bodyHeight: 60,
        armLength: 40,
        divingDirection: 0,
        diveProgress: 0
    };
}

// Handle mouse/touch aiming and charging
function handleMouseDown(e) {
    if (gameState !== 'aiming' && gameState !== 'charging') return;
    
    const rect = canvas.getBoundingClientRect();
    lastMouseX = e.clientX - rect.left;
    lastMouseY = e.clientY - rect.top;
    
    if (gameState === 'aiming') {
        startCharging();
    }
}

function handleMouseMove(e) {
    if (!isCharging) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    updatePowerAndAngle(mouseX, mouseY);
}

function handleMouseUp(e) {
    if (isCharging) {
        fireShot();
    }
}

function handleTouchStart(e) {
    if (gameState !== 'aiming' && gameState !== 'charging') return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    touchStartPos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
    };
    
    if (gameState === 'aiming') {
        startCharging();
    }
    e.preventDefault();
}

function handleTouchMove(e) {
    if (!isCharging) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const touchX = touch.clientX - rect.left;
    const touchY = touch.clientY - rect.top;
    
    updatePowerAndAngle(touchX, touchY);
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (isCharging) {
        fireShot();
    }
    e.preventDefault();
}

function startCharging() {
    gameState = 'charging';
    isCharging = true;
    power = 0;
}

function updatePowerAndAngle(x, y) {
    // Power meter: distance dragged back (upward)
    const footX = ball.x;
    const footY = ball.y;
    const dragX = x - footX;
    const dragY = y - footY;
    
    // Only consider upward drag (towards goal)
    if (dragY < 0) {
        power = Math.min(100, Math.sqrt(dragX * dragX + dragY * dragY) / 2);
    }
    
    // Aiming: horizontal component determines angle
    const maxAngle = 45;
    aimAngle = Math.max(-maxAngle, Math.min(maxAngle, dragX / 5));
}

function fireShot() {
    gameState = 'kicking';
    isCharging = false;
    shootPower = power;
    
    // Calculate shot trajectory based on power and aim
    const goalCenterX = canvas.width / 2;
    const goalCenterY = canvas.height * 0.15;
    const goalWidth = 150;
    
    // Convert aim angle to radians
    const angleRad = (aimAngle * Math.PI) / 180;
    
    // Adjust shot based on power and angle
    const targetX = goalCenterX + Math.sin(angleRad) * (goalWidth / 2) * (power / 100);
    const targetY = goalCenterY - 50;
    
    // Calculate velocity
    const dx = targetX - ball.x;
    const dy = targetY - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    ball.speed = (shootPower / 100) * 8;
    ball.vx = (dx / distance) * ball.speed;
    ball.vy = (dy / distance) * ball.speed;
    
    // Goalie reacts - randomly dives left or right
    goalie.divingDirection = Math.random() > 0.5 ? 1 : -1;
    goalie.diveProgress = 0;
    
    gameState = 'kicking';
}

function updateBall() {
    if (gameState !== 'kicking' && gameState !== 'goalieReacting') return;
    
    // Apply gravity
    ball.vy += 0.15;
    
    ball.x += ball.vx;
    ball.y += ball.vy;
    
    // Check if ball reached goal area
    const goalX = canvas.width / 2;
    const goalY = canvas.height * 0.15;
    const goalWidth = 150;
    const goalHeight = 80;
    
    if (ball.y < goalY - goalHeight) {
        checkIfGoal();
        gameState = 'resultDisplay';
        resultTimer = 180;
    }
}

function checkIfGoal() {
    const goalCenterX = canvas.width / 2;
    const goalWidth = 150;
    const goalLeft = goalCenterX - goalWidth / 2;
    const goalRight = goalCenterX + goalWidth / 2;
    
    // Check if ball is within goal width
    const ballInGoalWidth = ball.x > goalLeft && ball.x < goalRight;
    
    // Check if goalie saved it
    const goalieReach = 60;
    const goalieCenterX = goalie.x + (goalie.divingDirection * goalie.diveProgress);
    const ballHitGoalie = Math.abs(ball.x - goalieCenterX) < goalieReach;
    
    if (ballInGoalWidth && !ballHitGoalie) {
        resultMessage = '⚽ GOAL! +1';
        score.goals++;
    } else {
        resultMessage = '🛡️ SAVED!';
        score.saves++;
    }
}

function updateGoalieDive() {
    if (gameState === 'kicking' || gameState === 'goalieReacting') {
        goalie.diveProgress = Math.min(100, goalie.diveProgress + 3);
    }
}

// Drawing functions
function drawGoal() {
    const goalX = canvas.width / 2;
    const goalY = canvas.height * 0.15;
    const goalWidth = 150;
    const goalHeight = 80;
    
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 3;
    
    // Goal posts
    ctx.beginPath();
    ctx.moveTo(goalX - goalWidth / 2, goalY);
    ctx.lineTo(goalX - goalWidth / 2, goalY + goalHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(goalX + goalWidth / 2, goalY);
    ctx.lineTo(goalX + goalWidth / 2, goalY + goalHeight);
    ctx.stroke();
    
    // Crossbar
    ctx.beginPath();
    ctx.moveTo(goalX - goalWidth / 2, goalY);
    ctx.lineTo(goalX + goalWidth / 2, goalY);
    ctx.stroke();
}

function drawField() {
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
}

function drawBall() {
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Ball pattern
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawStickFigureGoalie() {
    const bodyX = goalie.x;
    const bodyY = goalie.y;
    const headRadius = 8;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    
    // Apply dive animation
    const divingX = goalie.divingDirection * (goalie.diveProgress / 100) * 40;
    
    // Head
    ctx.beginPath();
    ctx.arc(bodyX + divingX, bodyY - 25, headRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    // Body
    ctx.beginPath();
    ctx.moveTo(bodyX + divingX, bodyY - 17);
    ctx.lineTo(bodyX + divingX, bodyY + 10);
    ctx.stroke();
    
    // Left arm
    ctx.beginPath();
    ctx.moveTo(bodyX + divingX, bodyY - 10);
    ctx.lineTo(bodyX + divingX - 25 - (goalie.diveProgress / 100) * 15, bodyY - 15);
    ctx.stroke();
    
    // Right arm
    ctx.beginPath();
    ctx.moveTo(bodyX + divingX, bodyY - 10);
    ctx.lineTo(bodyX + divingX + 25 + (goalie.diveProgress / 100) * 15, bodyY - 15);
    ctx.stroke();
    
    // Left leg
    ctx.beginPath();
    ctx.moveTo(bodyX + divingX, bodyY + 10);
    ctx.lineTo(bodyX + divingX - 15, bodyY + 30);
    ctx.stroke();
    
    // Right leg
    ctx.beginPath();
    ctx.moveTo(bodyX + divingX, bodyY + 10);
    ctx.lineTo(bodyX + divingX + 15, bodyY + 30);
    ctx.stroke();
}

function drawPowerMeter() {
    if (gameState !== 'charging') return;
    
    const meterX = canvas.width / 2;
    const meterY = canvas.height - 120;
    const meterWidth = 200;
    const meterHeight = 20;
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(meterX - meterWidth / 2, meterY, meterWidth, meterHeight);
    
    // Power fill
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(meterX - meterWidth / 2, meterY, (power / 100) * meterWidth, meterHeight);
    
    // Border
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(meterX - meterWidth / 2, meterY, meterWidth, meterHeight);
    
    // Text
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`Power: ${Math.round(power)}%`, meterX, meterY - 10);
    
    // Aim angle display
    ctx.fillText(`Aim: ${Math.round(aimAngle)}°`, meterX, meterY + 40);
}

function drawInstructions() {
    ctx.fillStyle = '#FFF';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    if (gameState === 'aiming') {
        ctx.fillText('Click/Touch and drag BACK to charge power and aim', canvas.width / 2, canvas.height - 20);
        ctx.fillText('Drag LEFT/RIGHT to aim • Release to shoot', canvas.width / 2, canvas.height - 40);
    }
}

function drawResultScreen() {
    if (gameState !== 'resultDisplay' || resultTimer <= 0) return;
    
    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Result message
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(resultMessage, canvas.width / 2, canvas.height / 2);
    
    // Countdown
    ctx.font = '18px Arial';
    ctx.fillText('Next kick in ' + Math.ceil(resultTimer / 60) + 's', canvas.width / 2, canvas.height / 2 + 50);
    
    resultTimer--;
    
    if (resultTimer <= 0) {
        resetKick();
    }
}

function drawScore() {
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Goals: ${score.goals}`, 20, 30);
    ctx.fillText(`Saves: ${score.saves}`, 20, 60);
}

// Main game loop
function gameLoop() {
    drawField();
    drawGoal();
    drawBall();
    drawStickFigureGoalie();
    updateBall();
    updateGoalieDive();
    drawPowerMeter();
    drawInstructions();
    drawScore();
    drawResultScreen();
    
    requestAnimationFrame(gameLoop);
}

// Update score display in HTML
function updateScoreDisplay() {
    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        scoreValue.textContent = score.goals + score.saves;
    }
}

// Start the game
window.addEventListener('load', init);