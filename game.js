import { map, TILE_SIZE } from "./map.js";
import { updatePlayer, drawPlayer, setDirection } from "./player.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let lastMoveTime = 0;
let moveDelay = 120;

let score = { value: 0 };
let level = 1;
let lives = 3;

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
ctx.fillText("Level: " + level, 10, 40);
ctx.fillText("Lives: " + lives, 10, 60);

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

function fixUnreachablePellets(){

let visited = [];

for(let y=0;y<map.length;y++){
visited[y] = [];
for(let x=0;x<map[y].length;x++){
visited[y][x] = false;
}
}

let queue = [];
queue.push({x:1,y:1});
visited[1][1] = true;

while(queue.length > 0){

let cell = queue.shift();

let directions = [
{x:1,y:0},
{x:-1,y:0},
{x:0,y:1},
{x:0,y:-1}
];

for(let d of directions){

let nx = cell.x + d.x;
let ny = cell.y + d.y;

if(
map[ny] &&
map[ny][nx] !== 1 &&
!visited[ny][nx]
){
visited[ny][nx] = true;
queue.push({x:nx,y:ny});
}

}

}

for(let y=0;y<map.length;y++){
for(let x=0;x<map[y].length;x++){

if(map[y][x] === 2 && !visited[y][x]){
map[y][x] = 0;
}

}
}

}

function pelletsRemaining(){

let count = 0;

for(let y = 0; y < map.length; y++){
for(let x = 0; x < map[y].length; x++){

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