//Board Variables
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context; // Variable used to draw on canvas

// Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

// Ship Object
let ship = {
    x : shipX,
    y : shipY,
    width : shipWidth,
    height : shipHeight
}


// Ship
let shipImg;
let shipVelocityX = tileSize; // Ship Moving Speed

// Aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // Number of aliens to defeat
let alienVelocityX = 1; // Alien Moving Speed

//Bullets
let bulletArray = [];
let bulletVelocityY = -10; // Bullet moving speed

let score = 0;
let gameOver = false;


// Function
// When the window loads access the board
window.onload = function () {
    board = document.getElementById("board");
    // Set the board width and height
    board.width = boardWidth;
    board.height = boardHeight;
    context = board.getContext("2d"); // Used for drawing on the board

    // Load Images
    shipImg = new Image();
    shipImg.src = "./ship.png";
    shipImg.onload = function () {
        context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
    }

    alienImg = new Image();
    alienImg.src = "./alien.png";
    creatAliens();


    requestAnimationFrame(update);
    document.addEventListener("keydown", moveShip);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
    }

    context.clearRect(0, 0, board.width, board.height);

    // Ship
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

    // Alien
    for (let i = 0; i < alienArray.length; i++) {
        let alien = alienArray[i];
        if (alien.alive) {
            alien.x += alienVelocityX;

            // If alien touches the borders
            if (alien.x + alien.width >= board.width || alien.x <= 0) {
                alienVelocityX *= -1;
                // Fix aliens getting out of sync
                alien.x += alienVelocityX * 2;

                // Move all aliens up by one row
                for (let j = 0; j < alienArray.length; j++) {
                    alienArray[j].y += alienHeight;
                }
            }
            context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

            if (alien.y >= ship.y) {
                gameOver = true;
            }
        }
    }

    // Bullets
    for (let i = 0; i < bulletArray.length; i++) {
        let bullet = bulletArray[i];
        bullet.y += bulletVelocityY;
        context.fillStyle = "white";
        context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Bullet Collision
        for (let j = 0; j < alienArray.length; j++) {
            let alien = alienArray[j];
            if (!bullet.used && alien.alive && detectCollision(bullet, alien)) {
                bullet.used = true;
                alien.alive = false;
                alienCount--;
                score += 100;
            }
        }
    }

    // Clear the bullets
    while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
        bulletArray.shift(); // Removes the first element of the array
    }

    // Next Level
    if (alienCount == 0) {
        // Increase the number of aliens in clumns and rows by 1
        alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); //The cap is at 16/2 - 2 = 6
        alienRows = Math.min(alienRows + 1, rows - 4); // cap at 16 - 4 = 12
        alienVelocityX += 0.2; // Increase the alien movement speed
        // Clear the aliens and the bullets
        alienArray = [];
        bulletArray = [];
        creatAliens();
    }

    // Score
    context.fillStyle = "white";
    context.font = "16px courier";
    context.fillText(score, 5, 20);
}

function moveShip(e) {

    if (gameOver) {
        return;
    }

    if (e.code == "ArrowLeft" && ship.x - shipVelocityX >=0) {
        ship.x -= shipVelocityX; // Move Left
    }
    else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
        ship.x += shipVelocityX; // Move Right
    }
}

function creatAliens() {
    for (let c = 0; c < alienColumns; c++) {
        for (let r = 0; r < alienRows; r++) {
            let alien = {
                img : alienImg,
                x : alienX + c * alienWidth,
                y : alienY + r * alienHeight,
                width : alienWidth,
                height : alienHeight,
                alive : true
            }
            alienArray.push(alien);
        }
    }
    alienCount = alienArray.length;
}

function shoot(e) {

    if (gameOver) {
        return;
    }

    if (e.code == "Space") {
        // Shoot
        let bullet = {
            x : ship.x + shipWidth * 15 / 32,
            y : ship.y,
            width : tileSize / 8,
            height : tileSize / 2,
            used : false
        }
        bulletArray.push(bullet);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top left corner doesn't reach b's top right corner
        a.x + a.width > b.x && // a's top right corner passes b's top left corner
        a.y < b.y + b.height && // a's top left corner doesn't reach b's bottom left corner
        a.y + a.height > b.y; // a's bottom left corner passes b's top left corner
}