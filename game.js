import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = { value: 0 };

function drawMap(){

for(let y = 0; y < map.length; y++){

for(let x = 0; x < map[y].length; x++){

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

function drawScore(){

ctx.fillStyle = "white";
ctx.font = "16px Arial";
ctx.fillText("Score: " + score.value, 10, 20);

}

function update(){

updatePlayer(score);

}

function draw(){

ctx.clearRect(0,0,canvas.width,canvas.height);

drawMap();
drawPlayer(ctx);
drawScore();

}

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);

}

document.addEventListener("keydown", e => {

if(e.key === "ArrowUp") setDirection(0,-1);
if(e.key === "ArrowDown") setDirection(0,1);
if(e.key === "ArrowLeft") setDirection(-1,0);
if(e.key === "ArrowRight") setDirection(1,0);

});

gameLoop();