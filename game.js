// Shooting Stars Soccer Goalkeeper Game

let balls = []; // Array to hold spawned soccer balls
let projectiles = []; // Array to hold projectiles
let score = 0; // Player's score
let goalkeeper; // Goalkeeper object
let canvas, ctx; // Canvas and context

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    goalkeeper = new Goalkeeper(canvas.width / 2, canvas.height - 100);
    spawnBall(); // Start spawning balls
    gameLoop(); // Start the game loop
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
            // If ball goes beyond the canvas, remove it
            balls = balls.filter(ball => ball !== this);
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
    setInterval(() => {
        let x = Math.random() * (canvas.width - 30) + 15;
        let ball = new Ball(x, 0);
        balls.push(ball);
    }, 1000); // Spawn a new ball every second
}

// Handle touch controls
canvas.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    if (touch.clientX < canvas.width / 2) {
        goalkeeper.move(true); // Move left
    } else {
        goalkeeper.move(false); // Move right
    }
});

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    balls.forEach(ball => {
        ball.update();
        ball.draw();
    });
    goalkeeper.draw();
    requestAnimationFrame(gameLoop); // Keep the loop going
}

// Check for collisions
function checkCollisions() {
    balls.forEach((ball, index) => {
        if (ball.y + ball.radius > goalkeeper.y && 
            ball.x > goalkeeper.x && 
            ball.x < goalkeeper.x + goalkeeper.width) {
            score++; // Increment score on catch
            balls.splice(index, 1); // Remove caught ball
        }
    });
}

// Start the game
window.onload = init;
