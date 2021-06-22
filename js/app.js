// *Canvas Variables
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const card = document.getElementById("card");
const cardScore = document.getElementById("card-score");
const HighScore = document.getElementById("HighScore");

// *Interface Variables
const wallThickness = 200;
const playAreaHeight = canvas.width - 2*wallThickness;
const SwitchFrames = 20;

const intervalTime = 1000;
let ObstacleSpeed = 10;

// *Score Variables
let score = 0;
let scoreIncrement = 0;
let canScore = true;

// *Utility : GetRandomNumber
function RandomNumberGenerator(min,max){
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// *Drawing Background
function drawBackground() {
    ctx.fillStyle = "#07020D";
    ctx.fillRect(0, 0, canvas.width, wallThickness)
    ctx.fillRect(0,canvas.height - wallThickness,canvas.width,wallThickness)
}


// A function to draw score on screen
// function Score() {
//     ctx.font = "80px Arial";
//     ctx.fillStyle = "red";
//     let scoreString = score.toString();
//     let xOffset  = ((scoreString.length -1) * 20);
//     ctx.fillText(scoreString,280-xOffset,100);
// }


// *Player Class
class Player {
    constructor(difficulty,w,h,color){
        // *The base variables
        this.width = w;
        this.height = h;
        this.difficulty = difficulty;
        this.color = color;
        this.x = 100;
        this.y = playAreaHeight + wallThickness - this.height;

        // *Variables for Switching Animation
        this.SwitchRate = (playAreaHeight-this.height)/SwitchFrames;
        this.shouldSwitch = false;
        this.SwitchFrameCounter = 0;
        this.SwitchTopBool = false;

        // *Variables for Rotation Animation
        this.spin = 0;
        this.spinIncrement = 180/SwitchFrames;

    }
    // *Rotation Function
    rotation() {
        let OffsetX = this.x + (this.width/2);
        let OffsetY = this.y + (this.height/2);
        ctx.translate(OffsetX, OffsetY);
        ctx.rotate(this.spin * Math.PI/ 180);
        ctx.rotate(this.spinIncrement * Math.PI/180);
        ctx.translate(-OffsetX,-OffsetY);
        this.spin += this.spinIncrement;
    }

    // *To counter the rotation done while doing the jump animation
    counterRotation() {
        let OffsetX = this.x + (this.width/2);
        let OffsetY = this.y + (this.height/2);
        ctx.translate(OffsetX,OffsetY);
        ctx.rotate(-this.spin * Math.PI/180);
        ctx.translate(-OffsetX,-OffsetY);
    }

    // * the jump animation
    jump() {
        if (this.shouldSwitch) {
            this.SwitchFrameCounter++;
            if (this.SwitchFrameCounter < SwitchFrames+1 && this.SwitchTopBool == false) {
                this.y -= this.SwitchRate;

            }else if(this.SwitchFrameCounter == SwitchFrames+1){
                this.SwitchTopBool = !this.SwitchTopBool;
            }else if (this.SwitchFrameCounter < SwitchFrames+1 && this.SwitchTopBool == true) {
                this.y += this.SwitchRate
            }
            this.rotation();
            if (this.SwitchFrameCounter > SwitchFrames+1) {
                this.counterRotation();
                this.spin = 0;
                this.shouldSwitch = false;
            }

        }
    }

    draw() {
        this.jump();
        ctx.fillStyle = this.color;
        if (this.difficulty == "easy") {

            ctx.fillRect(this.x, this.y, this.width, this.height);
            if (this.shouldSwitch) {
                this.counterRotation();
            }
        }
        // if (this.difficulty == "medium") {

        //     ctx.beginPath();
        //     ctx.moveTo(this.x,this.y);
        //     ctx.lineTo(this.x + this.width, this.y);
        //     ctx.lineTo(this.x + (this.width/2) , this.y - this.height);
        //     ctx.lineTo(this.x,this.y);
        //     ctx.fill();
        //     ctx.closePath();
        //     if (this.shouldSwitch) {
        //         this.counterRotation();
        //     }
        // }
    }
}

// * Hole Class

class Hole {
    constructor(size,pos,speed){
        this.x = canvas.width + size;
        if (pos == 0) {
            this.y = 0;
        }
        if (pos == 1) {
            this.y = canvas.height - wallThickness
        }
        this.type = "Hole";
        this.size = size;
        this.color = "#716A5C";
        this.speed = speed;
    }

    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.size,wallThickness);
    }
    slide(){
        this.draw();
        this.x -= this.speed;
    }
}

class Block {
    constructor(height,speed){
        this.x = canvas.width + 70;
        this.type = "block";
        this.y = canvas.height - wallThickness - height;
        this.width = 70;
        this.height = height;
        this.color = "black";
        this.speed = speed;
    }

    draw(){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }
    slide(){
        this.draw();
        this.x -= this.speed;
    }
}
let player = new Player("easy",60,60,"#5DB7DE");
let HolesArray = [];
function startGame() {
    player = new Player("easy",60,60,"#5DB7DE");
    HolesArray = [];
    ObstacleSpeed = 10;

    score = 0;
    scoreIncrement = 0;
    canScore = true;
}

function restartGame(button){
    card.style.display = "none";
    button.blur();
    startGame();
    requestAnimationFrame(animate);
}
function generateBlocks() {
    let timeDelay = intervalTime;
    let i = RandomNumberGenerator(0,1);
    if (i == 0) {
        HolesArray.push(new Hole(RandomNumberGenerator(100,200),RandomNumberGenerator(0,1),ObstacleSpeed));
    }else if (i == 1) {
        HolesArray.push(new Block(RandomNumberGenerator(100,200),ObstacleSpeed));
    }

    setTimeout(generateBlocks, timeDelay);
}

let animationId = null;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if (scoreIncrement == 10) {
        ObstacleSpeed = ObstacleSpeed + 3;
        scoreIncrement = 0;
        console.log(ObstacleSpeed);
    }
    drawBackground();
    // Score();

    player.draw();

    HolesArray.forEach((hole,index) => {
        hole.slide();
        if (hole.type == "Hole") {
            if (player.x <= hole.x + hole.size && player.x >= hole.x) {

                if (player.y == hole.y + wallThickness || player.y + player.height== hole.y) {
                    if (localStorage.getItem("HighScore") == null) {
                        localStorage.setItem("HighScore",score);
                        HighScore.innerText = "Thanks for first trying out the game"
                    }else{
                        currentHighScore = localStorage.getItem("HighScore");
                        if (currentHighScore > score) {
                            HighScore.innerText = `Better Luck Next Time, the current high score is ${currentHighScore}`;
                        }else if (currentHighScore == score) {
                            HighScore.innerText = `You got the same score as the highscore, Congrats`;
                        }else if (currentHighScore < score) {
                            HighScore.innerText = `You broke the record.. You are the Champion Now!`;
                            localStorage.setItem("HighScore",score);
                        }
                    }


                    cardScore.textContent= score;
                    card.style.display = "block";
                    cancelAnimationFrame(animationId);
                }
            }
            if (player.x >= hole.x + hole.size && canScore) {
                canScore = false;
                score++;
                scoreIncrement++;
            }

            if ((hole.x + hole.size) <= 0) {
                canScore = true;
                setTimeout(() => {
                    HolesArray.splice(index,1);
                }, 0);
            }
        }


        if (hole.type == "block") {
            if (player.x - 10 <= hole.x + hole.width && player.x + 10 >= hole.x) {

                if (player.y + 10 >= hole.y && player.y - 10<= hole.y + hole.height) {
                    if (localStorage.getItem("HighScore") == null) {
                        localStorage.setItem("HighScore",score);
                        HighScore.innerText = "Thanks for first trying out the game"
                    }else{
                        currentHighScore = localStorage.getItem("HighScore");
                        if (currentHighScore > score) {
                            HighScore.innerText = `Better Luck Next Time, the current high score is ${currentHighScore}`;
                        }else if (currentHighScore == score) {
                            HighScore.innerText = `You got the same score as the highscore, Congrats`;
                        }else if (currentHighScore < score) {
                            HighScore.innerText = `You broke the record.. You are the Champion Now!`;
                            localStorage.setItem("HighScore",score);
                        }
                    }


                    cardScore.textContent= score;
                    card.style.display = "block";
                    cancelAnimationFrame(animationId);
                }
            }
            if (player.x >= hole.x + hole.width && canScore) {
                canScore = false;
                score++;
                scoreIncrement++;
            }

            if ((hole.x + hole.width) <= 0) {
                canScore = true;
                setTimeout(() => {
                    HolesArray.splice(index,1);
                }, 0);
            }
        }





    })
}

animate();
setTimeout(() => {
    generateBlocks();
}, intervalTime);
addEventListener("keydown", event => {
    if (event.code === "Space") {
        if (!player.shouldSwitch) {
            player.SwitchFrameCounter = 0;
            player.shouldSwitch = true;

        }
    }
})

addEventListener("click", event => {
    if (!player.shouldSwitch) {
        player.SwitchFrameCounter = 0;
        player.shouldSwitch = true;

    }
})