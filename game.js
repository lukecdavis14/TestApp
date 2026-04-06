// Shooting Stars Soccer Goalkeeper Game

let balls = []; // Array to hold spawned soccer balls
let projectiles = []; // Array to hold projectiles
let score = 0; // Player's score
let goalkeeper; // Goalkeeper object
let canvas, ctx; // Canvas and context
let spawnInterval; // Spawn interval reference
let leftPressed = false;
let rightPressed = false;

// Initialize game
function init() {
    canvas = document.getElementById('shootingStarsCanvas');
    ctx = canvas.getContext('2d');
    
    // Set canvas size based on viewport
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    goalkeeper = new Goalkeeper(canvas.width / 2, canvas.height - 100);
    spawnBall(); // Start spawning balls
    gameLoop(); // Start the game loop
    
    // Set up button event listeners
    setupButtonListeners();
}

// Resize canvas to fit screen
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = Math.min(window.innerWidth, 800);
    canvas.height = Math.min(window.innerHeight, 600);
}

// Set up button event listeners for touch controls
function setupButtonListeners() {
    const leftBtn = document.getElementById('leftBtn');
    const rightBtn = document.getElementById('rightBtn');
    const shootBtn = document.getElementById('shootBtn');
    
    if (leftBtn) {
        leftBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            leftPressed = true;
        });
        leftBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            leftPressed = false;
        });
    }
    
    if (rightBtn) {
        rightBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            rightPressed = true;
        });
        rightBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            rightPressed = false;
        });
    }
    
    if (shootBtn) {
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            shoot();
        });
    }
}

// Ball class
class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 2;
    }
    draw() {
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y += this.speed; // Move the ball downward
        if (this.y > canvas.height) {
            // If ball goes beyond the canvas, remove it and penalize
            balls = balls.filter(ball => ball !== this);
        }
    }
}

// Projectile class
class Projectile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 8;
        this.speed = 5;
    }
    draw() {
        ctx.fillStyle = 'yellow';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
    update() {
        this.y -= this.speed; // Move projectile upward
        if (this.y < 0) {
            projectiles = projectiles.filter(p => p !== this);
        }
    }
}

// Goalkeeper class
class Goalkeeper {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 20;
        this.speed = 5;
    }
    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    move(left) {
        if (left) {
            this.x -= this.speed;
            if (this.x < 0) this.x = 0;
        } else {
            this.x += this.speed;
            if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
        }
    }
}

// Spawn a new soccer ball
function spawnBall() {
    spawnInterval = setInterval(() => {
        let x = Math.random() * (canvas.width - 30) + 15;
        let ball = new Ball(x, 0);
        balls.push(ball);
    }, 1000); // Spawn a new ball every second
}

// Shoot a projectile
function shoot() {
    let projectile = new Projectile(goalkeeper.x + goalkeeper.width / 2, goalkeeper.y);
    projectiles.push(projectile);
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    
    // Handle continuous movement
    if (leftPressed) {
        goalkeeper.move(true);
    }
    if (rightPressed) {
        goalkeeper.move(false);
    }
    
    // Update and draw balls
    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });
    
    // Update and draw projectiles
    projectiles.forEach(projectile => {
        projectile.update();
        projectile.draw();
    });
    
    // Draw goalkeeper
    goalkeeper.draw();
    
    // Check for collisions
    checkCollisions();
    
    // Update score display
    updateScoreDisplay();
    
    requestAnimationFrame(gameLoop); // Keep the loop going
}

// Check for collisions
function checkCollisions() {
    // Check ball-goalkeeper collisions (catching)
    balls.forEach((ball, ballIndex) => {
        if (ball.y + ball.radius > goalkeeper.y && 
            ball.y - ball.radius < goalkeeper.y + goalkeeper.height &&
            ball.x > goalkeeper.x && 
            ball.x < goalkeeper.x + goalkeeper.width) {
            score += 50; // Increment score on catch
            balls.splice(ballIndex, 1); // Remove caught ball
        }
    });
    
    // Check projectile-ball collisions (shooting)
    projectiles.forEach((projectile, projIndex) => {
        balls.forEach((ball, ballIndex) => {
            const dx = projectile.x - ball.x;
            const dy = projectile.y - ball.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < projectile.radius + ball.radius) {
                score += 10; // Increment score on shoot
                projectiles.splice(projIndex, 1);
                balls.splice(ballIndex, 1);
            }
        });
    });
}

// Update score display
function updateScoreDisplay() {
    const scoreValue = document.getElementById('scoreValue');
    if (scoreValue) {
        scoreValue.textContent = score;
    }
}

// Start the game
window.addEventListener('load', init);