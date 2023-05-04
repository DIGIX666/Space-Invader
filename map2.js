const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_SPACE = 32;
const KEY_PAUSE = 80;

const GAME_WIDTH = 900;
const GAME_HEIGHT = 600;


const STATE = {
    x_pos: 0,
    y_pos: 0,
    move_right: false,
    move_left: false,
    shoot : false,
    lasers: [],
    enemies: [],
    enemyLasers: [], 
    spaceship_width: 50,
    enemy_width: 80,
    cooldown: 0,
    number_of_enemies: 16,
    enemy_cooldown: 0,
    gameOver : false,
    score: 0,
    pause : false,
    lives : 3,
    invincible : false,
    timer : false,
};

//General Functions

/*----------------------- SET POSITION -------------------*/
function setPosition($element, x, y){
    $element.style.transform = `translate(${x}px, ${y}px)`;
}

/*----------------------- SET SIZE -------------------*/
function setSize($element, width){
    $element.style.width = `${width}px`;
    $element.style.height = "auto";
}


/*----------------------- BOUND -------------------*/
function bound(x){
    if (x >= GAME_WIDTH-STATE.spaceship_width){
        STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
        return STATE.x_pos;
    }else if (x <= 0){
        STATE.x_pos = 0;
        return STATE.x_pos;
    }else{
        return x;
    }
}


/*----------------------- DELETELASER -------------------*/
function deleteLaser(lasers, laser, $laser){
    const index = lasers.indexOf(laser);
    lasers.splice(index, 1);
    $container.removeChild($laser);
}


/*----------------------- COLLIDERECT -------------------*/
function collideRect(rect1, rect2){
    return !(
        rect2.left > rect1.right ||
        rect2.right < rect1.left ||
        rect2.top > rect1.bottom ||
        rect2.bottom < rect1.top
    );
}

//Player

/*----------------------- CREATE PLAYER -------------------*/
function createPlayer($container){
    STATE.lives = 3;
    STATE.x_pos = GAME_WIDTH / 2 ;
    STATE.y_pos = GAME_HEIGHT - 5;
    const $player = document.createElement("img");
    $player.src = "images/shit.png";
    $player.className = "player";
    $container.appendChild($player);
    setPosition($player, STATE.x_pos, STATE.y_pos);
    setSize($player, STATE.spaceship_width);
}


/*----------------------- UPDATE PLAYER -------------------*/
function updatePlayer(){
    if (STATE.move_right){
        STATE.x_pos += 3;
    } if(STATE.move_left){
        STATE.x_pos -= 3;
    } if (STATE.shoot && STATE.cooldown == 0){
        createLaser($container, STATE.x_pos - STATE.spaceship_width/2, STATE.y_pos );
        STATE.cooldown = 10;
    }
    const $player = document.querySelector(".player");
    setPosition($player, bound(STATE.x_pos), STATE.y_pos - 15);
    if (STATE.cooldown > 0){
        STATE.cooldown -= 0.5;
    }
}


// Player Laser

/*----------------------- CREATE LASER -------------------*/
function createLaser($container, x, y){
    const $laser = document.createElement("img");
    $laser.src = "images/laser.png";
    $laser.className = "laser";
    $container.appendChild($laser);
    const laser = {$laser, x, y};
    STATE.lasers.push(laser);
    setPosition($laser, x, y);
}


let musicdead = new Audio('dead-alien.mp3');

/*----------------------- UPDATE LASER -------------------*/
function updateLaser($container){
    const lasers = STATE.lasers;
    for (let i = 0; i < lasers.length; i++){
        const laser = lasers[i];
        laser.y -= 5;
        if (laser.y < 0){
            deleteLaser(lasers, laser, laser.$laser)
        }
        setPosition(laser.$laser, laser.x, laser.y); // laser.$laser is the DOM element and $laser is the object
        const laser_rectangle = laser.$laser.getBoundingClientRect();
        const enemies = STATE.enemies;  
        for (let j = 0; j < enemies.length; j++){
            const enemy = enemies[j];
            const enemy_rectangle = enemy.$enemy.getBoundingClientRect();
            if (collideRect(enemy_rectangle, laser_rectangle)){
                deleteLaser(lasers, laser, laser.$laser);
                const index = enemies.indexOf(enemy);
                enemies.splice(index, 1);
                $container.removeChild(enemy.$enemy);
                STATE.score += 100;
                updateScore();
                musicdead.play();
            }
        }
    }
}



//Enemies

/*----------------------- CREATE ENEMY -------------------*/
function createEnemy($container, x, y){
    const $enemy = document.createElement("img");
    $enemy.src = "images/enemy2.png";
    $enemy.className = "enemy";
    $container.appendChild($enemy);
    const enemy_cooldown = Math.floor(Math.random() * 100);
    const enemy = {x, y, $enemy, enemy_cooldown }; 
    STATE.enemies.push(enemy);
    setSize($enemy, STATE.enemy_width);
    setPosition($enemy, x, y);
}


/*----------------------- UPDATE ENEMIES -------------------*/
function updateEnemies(){
    const dx = Math.sin(Date.now() / 1000) * 50;
    const dy = Math.cos(Date.now() / 1000) * 40;
    const enemies = STATE.enemies;
    for (let i = 0; i < enemies.length; i++){
        const enemy = enemies[i];
        var a = enemy.x + dx;
        var b = enemy.y + dy;
        setPosition(enemy.$enemy, a, b);
        if (enemy.enemy_cooldown == 0){
            createEnemyLaser($container, a, b);
            enemy.enemy_cooldown = Math.floor(Math.random()* 50)+100;
        }
        enemy.enemy_cooldown -= 0.5;
    }
}


/*----------------------- CREATE ENEMIES -------------------*/
function createEnemies($container){
    for (let i = 0; i < STATE.number_of_enemies/2; i++){
        createEnemy($container, i * 90, 100);
    }
    for (let i = 0; i < STATE.number_of_enemies/2; i++){
        createEnemy($container, i * 100, 190);
    }
}


/*----------------------- CREATE ENEMY LASER -------------------*/
function createEnemyLaser($container, x, y){
    const $enemyLaser = document.createElement("img");
    $enemyLaser.src = "images/enemyLaser.png";
    $enemyLaser.className = "enemyLaser";
    $container.appendChild($enemyLaser);
    const enemyLaser = {x, y, $enemyLaser};
    STATE.enemyLasers.push(enemyLaser);
    setPosition($enemyLaser, x, y);
}



/*----------------------- UPDATE ENEMY LASER -------------------*/
function updateEnemyLaser($container){
    const enemyLasers = STATE.enemyLasers;
    for (let i = 0; i < enemyLasers.length; i++){
        const enemyLaser = enemyLasers[i];
        enemyLaser.y += 2;
        if (enemyLaser.y > GAME_HEIGHT-5){
            deleteLaser(enemyLasers, enemyLaser, enemyLaser.$enemyLaser)
        }
        const enemyLaser_rectangle = enemyLaser.$enemyLaser.getBoundingClientRect();
        const spaceship_rectangle = document.querySelector(".player").getBoundingClientRect();
        if (collideRect(spaceship_rectangle, enemyLaser_rectangle) && !STATE.invincible){
            
            STATE.lives -= 1;
            STATE.invincible = true;
            console.log(STATE.lives);
            document.querySelector(".player").style.opacity = 0.3;
            updateLives();
            console.log(STATE.invincible);
            if (STATE.lives == 0){
            STATE.gameOver = true;
            }
        }
        setPosition(enemyLaser.$enemyLaser, enemyLaser.x + STATE.enemy_width/2, enemyLaser.y+50);   
    }
}



/*----------------------- UPDATE SCORE -------------------*/
function updateScore(){
    document.querySelector("#score").innerHTML = "Score: " + STATE.score;
}


/*----------------------- UPADTE LIVES -------------------*/
function updateLives(){
    setInterval(function(){
        document.querySelector(".player").style.opacity = 1;
        STATE.invincible = false;
    }, 1200);
    document.querySelector("#lives").innerHTML = "Lives: " + STATE.lives;
}



let musicshoot = new Audio('laser-gun.mp3');
//Key Presses

/*----------------------- KEY PRESS -------------------*/
function KeyPress(event){
    if(event.keyCode === KEY_RIGHT){
        STATE.move_right = true;
    }else if(event.keyCode === KEY_LEFT){
        STATE.move_left = true;
    } else if(event.keyCode === KEY_SPACE){
        STATE.shoot = true;
        musicshoot.play();
    } else if ( event.keyCode === KEY_PAUSE){
        if (STATE.pause){
            STATE.pause = false;
        } else {
            STATE.pause = true;
        }
    }
}



/*----------------------- KEY RELEASE -------------------*/
function KeyRelease(event){
    if(event.keyCode === KEY_RIGHT){
        STATE.move_right = false;
    }else if(event.keyCode === KEY_LEFT){
        STATE.move_left = false;
    } else if(event.keyCode === KEY_SPACE){
        STATE.shoot = false;
    }
}


//Main Update Function

/*----------------------- UPDATE -------------------*/
function update(){
    // set a timer of 3min and if it reaches 0, game over

    

    window.requestAnimationFrame(update);
    if (STATE.pause){
        document.querySelector(".pause").style.display = "block";

    }else if (STATE.gameOver){
        document.querySelector(".lose").style.display = "block";
        startStop();
    
    }else{
        updatePlayer();
        updateLaser($container);
        updateEnemies($container);
        updateEnemyLaser();
    }

    if (!STATE.pause){
        document.querySelector(".pause").style.display = "none";
    }

    if (STATE.enemies.length == 0){
        document.querySelector(".win").style.display = "block";
        startStop();
    }
}

//Init. Game
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);


//Event Listeners
window.addEventListener("keydown", KeyPress);
window.addEventListener("keyup", KeyRelease);


//Game Loop
update();



/*----------------------- CHRONO -------------------*/

// Variables pour stocker les minutes et les secondes
var minutes = 0;
var seconds = 0;

// Variables pour stocker l'état du chronomètre (en cours ou arrêté)
var running = false;

// Fonction pour mettre à jour l'affichage du chronomètre
function updateTimer() {
    var m = (minutes < 10) ? "0" + minutes : minutes;
    var s = (seconds < 10) ? "0" + seconds : seconds;
    document.getElementById("timer").innerHTML = m + ":" + s;
}

// Fonction pour incrémenter les secondes
function tick() {
    if (running) {
        seconds++;
        if (seconds >= 60) {
            minutes++;
            seconds = 0;
        }
    }
    updateTimer();
}

// Fonction pour lancer ou arrêter le chronomètre
function startStop() {
    running = !running;
    if (running) {
        interval = setInterval(tick, 1000);
    } else {
        clearInterval(interval);
    }
}

// Ajouter un écouteur d'événement pour détecter quand la touche "p" est pressée
document.addEventListener("keydown", function(event) {
    if (event.keyCode === 80) { // 80 est le code pour la touche "p"
        startStop();
    }
});

// Lancer automatiquement le chronomètre
startStop();
