import { map } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [
{ x:5, y:5, dx:1, dy:0, color:"red" }
];

let lastGhostMove = 0;
const GHOST_DELAY = 180;

function randomDirection(){

let dirs = [
{dx:1,dy:0},
{dx:-1,dy:0},
{dx:0,dy:1},
{dx:0,dy:-1}
];

return dirs[Math.floor(Math.random()*dirs.length)];

}

export function updateGhosts(livesRef){

let now = Date.now();

if(now - lastGhostMove < GHOST_DELAY) return;

for(let g of ghosts){

let nextX = g.x + g.dx;
let nextY = g.y + g.dy;

if(map[nextY] && map[nextY][nextX] !== 1){

g.x = nextX;
g.y = nextY;

}else{

let d = randomDirection();
g.dx = d.dx;
g.dy = d.dy;

}

if(g.x === pacman.x && g.y === pacman.y){

livesRef.value--;

pacman.x = 1;
pacman.y = 1;

g.x = 5;
g.y = 5;

}

}

lastGhostMove = now;

}

export function drawGhosts(ctx,tileSize,offsetX,offsetY){

for(let g of ghosts){

let x = offsetX + g.x*tileSize;
let y = offsetY + g.y*tileSize;

ctx.fillStyle = g.color;

ctx.beginPath();

ctx.arc(
x + tileSize/2,
y + tileSize/2,
tileSize/2,
Math.PI,
0
);

ctx.lineTo(x + tileSize,y + tileSize);
ctx.lineTo(x + tileSize*0.75,y + tileSize*0.8);
ctx.lineTo(x + tileSize*0.5,y + tileSize);
ctx.lineTo(x + tileSize*0.25,y + tileSize*0.8);
ctx.lineTo(x,y + tileSize);

ctx.closePath();
ctx.fill();

ctx.fillStyle="white";

ctx.beginPath();
ctx.arc(x+tileSize*0.35,y+tileSize*0.45,tileSize*0.1,0,Math.PI*2);
ctx.arc(x+tileSize*0.65,y+tileSize*0.45,tileSize*0.1,0,Math.PI*2);
ctx.fill();

}

}