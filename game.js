const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let pacman = {
    x: 50,
    y: 50,
    size: 20,
    speed: 5
};

function drawPacman() {
    ctx.beginPath();
    ctx.arc(pacman.x, pacman.y, pacman.size, 0.2 * Math.PI, 1.8 * Math.PI);
    ctx.lineTo(pacman.x, pacman.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
}

function update(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    drawPacman();
}

document.addEventListener("keydown", (e)=>{

    if(e.key === "ArrowUp") pacman.y -= pacman.speed;
    if(e.key === "ArrowDown") pacman.y += pacman.speed;
    if(e.key === "ArrowLeft") pacman.x -= pacman.speed;
    if(e.key === "ArrowRight") pacman.x += pacman.speed;

});

function gameLoop(){
    update();
    requestAnimationFrame(gameLoop);
}

gameLoop();