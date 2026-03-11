import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tileSize = 24;

let score = 0;

const map = [

[1,1,1,1,1,1,1,1,1,1],
[1,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,2,1,1,2,1],
[1,2,2,2,1,2,2,2,2,1],
[1,1,1,2,1,1,1,2,1,1],
[1,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,1,1,1,1]

];


let pacman = {
x:1,
y:1,
dx:0,
dy:0
};

function drawMap(){

for(let y=0; y<map.length; y++){

for(let x=0; x<map[y].length; x++){

let tile = map[y][x];

if(tile === 1){

ctx.fillStyle = "blue";
ctx.fillRect(
x*TILE_SIZE,
y*TILE_SIZE,
TILE_SIZE,
TILE_SIZE
);

}

if(tile === 2){

ctx.fillStyle = "white";

ctx.beginPath();

ctx.arc(
x*TILE_SIZE + TILE_SIZE/2,
y*TILE_SIZE + TILE_SIZE/2,
3,
0,
Math.PI*2
);

ctx.fill();

}

}

}

} 

function drawMap(){

for(let y=0;y<map.length;y++){

for(let x=0;x<map[y].length;x++){

let tile = map[y][x];

if(tile === 1){

ctx.fillStyle = "blue";
ctx.fillRect(x*tileSize,y*tileSize,tileSize,tileSize);

}

if(tile === 2){

ctx.fillStyle = "white";

ctx.beginPath();
ctx.arc(
x*tileSize+tileSize/2,
y*tileSize+tileSize/2,
3,
0,
Math.PI*2
);

ctx.fill();

}

}

}

}

function drawPacman(){

ctx.fillStyle = "yellow";

ctx.beginPath();

ctx.arc(
pacman.x*tileSize + tileSize/2,
pacman.y*tileSize + tileSize/2,
tileSize/2-2,
0.2*Math.PI,
1.8*Math.PI
);

ctx.lineTo(
pacman.x*tileSize + tileSize/2,
pacman.y*tileSize + tileSize/2
);

ctx.fill();

}

function movePacman(){

let nextX = pacman.x + pacman.dx;
let nextY = pacman.y + pacman.dy;

if(map[nextY][nextX] !== 1){

pacman.x = nextX;
pacman.y = nextY;

if(map[nextY][nextX] === 2){

map[nextY][nextX] = 0;
score += 10;

}

}

}

function drawScore(){

ctx.fillStyle = "white";
ctx.font = "16px Arial";

ctx.fillText("Score: "+score,10,20);

}

function update(){

movePacman();

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawMap();
drawPacman();
drawScore();

}

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);

}

document.addEventListener("keydown",e=>{

if(e.key === "ArrowUp"){
pacman.dx=0;
pacman.dy=-1;
}

if(e.key === "ArrowDown"){
pacman.dx=0;
pacman.dy=1;
}

if(e.key === "ArrowLeft"){
pacman.dx=-1;
pacman.dy=0;
}

if(e.key === "ArrowRight"){
pacman.dx=1;
pacman.dy=0;
}

});

gameLoop();