import { map } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";
import { updateGhosts, drawGhosts } from "./ghosts.js";
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let tileSize;
let offsetX = 0;
let offsetY = 0;

function resizeGame(){

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

tileSize = Math.floor(
Math.min(
canvas.width / map[0].length,
canvas.height / map.length
)
);

let mapWidth = map[0].length * tileSize;
let mapHeight = map.length * tileSize;

offsetX = Math.floor((canvas.width - mapWidth) / 2);
offsetY = Math.floor((canvas.height - mapHeight) / 2);

}

resizeGame();
window.addEventListener("resize", resizeGame);

let lastMoveTime = 0;
let moveDelay = 120;

let score = { value: 0 };
let gameOver = false;
let level = 1;
let lives = { value: 3 };
function drawMap(){

for(let y=0;y<map.length;y++){
for(let x=0;x<map[y].length;x++){

let tile = map[y][x];

if(tile === 1){

ctx.fillStyle="blue";
ctx.fillRect(
offsetX + x*tileSize,
offsetY + y*tileSize,
tileSize,
tileSize
);

}

if(tile === 2){

ctx.fillStyle="white";

ctx.beginPath();
ctx.arc(
offsetX + x*tileSize + tileSize/2,
offsetY + y*tileSize + tileSize/2,
tileSize/8,
0,
Math.PI*2
);

ctx.fill();

}

}
}

}

function drawScore(){

ctx.fillStyle="white";
ctx.font="16px Arial";

ctx.fillText("Score: " + score.value,10,20);
ctx.fillText("Level: " + level,10,40);
ctx.fillText("Lives: " + lives.value,10,60);
}

function generateMaze(){

let width = map[0].length;
let height = map.length;

for(let y=0;y<height;y++){
for(let x=0;x<width;x++){
map[y][x] = 1;
}
}

function shuffle(array){
for(let i=array.length-1;i>0;i--){
let j=Math.floor(Math.random()*(i+1));
[array[i],array[j]]=[array[j],array[i]];
}
return array;
}

function carve(x,y){

let dirs = shuffle([
[2,0],
[-2,0],
[0,2],
[0,-2]
]);

for(let d of dirs){

let nx = x + d[0];
let ny = y + d[1];

if(
ny > 0 &&
ny < height-1 &&
nx > 0 &&
nx < width-1 &&
map[ny][nx] === 1
){

map[y + d[1]/2][x + d[0]/2] = 0;
map[ny][nx] = 0;

carve(nx,ny);

}

}

}

map[1][1] = 0;
carve(1,1);

for(let y=0;y<height;y++){
for(let x=0;x<width;x++){

if(map[y][x] === 0){
map[y][x] = 2;
}

}
}

map[1][1] = 0;

}

function pelletsRemaining(){

let count = 0;

for(let y=0;y<map.length;y++){
for(let x=0;x<map[y].length;x++){

if(map[y][x] === 2){
count++;
}

}
}

return count;

}

function nextLevel(){

level++;
generateMaze();

}

function update(){
  
  updatePlayer(score);
  updateGhosts(lives);
  if(lives.value <= 0){
gameOver = true;
}
if(gameOver) return;


let now = Date.now();

if(now - lastMoveTime > moveDelay){

updatePlayer(score);

if(pelletsRemaining() === 0){
nextLevel();
}

lastMoveTime = now;

}

}

function draw(){
  

ctx.clearRect(0,0,canvas.width,canvas.height);

drawMap();
drawGhosts(ctx,tileSize,offsetX,offsetY);
drawPlayer(ctx,tileSize,offsetX,offsetY);
drawScore();
if(gameOver){
drawGameOver();
}

}

function gameLoop(){

update();
draw();

requestAnimationFrame(gameLoop);
if(gameOver){
drawGameOver();

}

}

function drawGameOver(){

ctx.fillStyle = "rgba(0,0,0,0.9)";
ctx.fillRect(0,0,canvas.width,canvas.height);

ctx.textAlign = "center";

let blink = Math.floor(Date.now()/400)%2;
let pulse = Math.sin(Date.now()*0.005)*5;

let centerX = canvas.width/2;
let centerY = canvas.height/2;

function drawNeonText(text,x,y,color,size){

ctx.font = size + "px 'Press Start 2P'";

ctx.fillStyle = "black";
ctx.fillText(text,x+4,y+4);

ctx.fillStyle = color;
ctx.fillText(text,x,y);

ctx.shadowColor = color;
ctx.shadowBlur = 20;
ctx.fillText(text,x,y);

ctx.shadowBlur = 0;

}

drawNeonText(
"GAME OVER",
centerX,
centerY - 150,
blink ? "#ff0033" : "#ffaa00",
70
);

drawNeonText(
"SCORE: " + score.value,
centerX,
centerY - 70,
"#00ffff",
22
);

ctx.fillStyle = "#00ff00";

ctx.fillRect(
centerX - 160,
centerY + pulse,
320,
60
);

drawNeonText(
"RESTART",
centerX,
centerY + 40 + pulse,
"#000000",
20
);

ctx.fillStyle = "#ff4444";

ctx.fillRect(
centerX - 160,
centerY + 90 + pulse,
320,
60
);

drawNeonText(
"EXIT",
centerX,
centerY + 130 + pulse,
"#ffffff",
20
);

}

document.addEventListener("keydown", e => {

if(e.key === "ArrowUp") setDirection(0,-1);
if(e.key === "ArrowDown") setDirection(0,1);
if(e.key === "ArrowLeft") setDirection(-1,0);
if(e.key === "ArrowRight") setDirection(1,0);
document.addEventListener("keydown", e=>{


});

});

canvas.addEventListener("click",function(e){

if(!gameOver) return;

let rect = canvas.getBoundingClientRect();
let mouseX = e.clientX - rect.left;
let mouseY = e.clientY - rect.top;

let centerX = canvas.width/2;

if(
mouseX > centerX-120 &&
mouseX < centerX+120 &&
mouseY > canvas.height/2 + 20 &&
mouseY < canvas.height/2 + 80
){
location.reload();
}

if(
mouseX > centerX-120 &&
mouseX < centerX+120 &&
mouseY > canvas.height/2 + 100 &&
mouseY < canvas.height/2 + 160
){
window.location.href = "login.html";
}

});

gameLoop();