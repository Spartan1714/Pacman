import { map } from "./map.js";

export let ghosts = [
{ x:5, y:5, dx:1, dy:0, color:"red" },
{ x:7, y:5, dx:-1, dy:0, color:"pink" }
];

function randomDirection(){

let dirs = [
{dx:1,dy:0},
{dx:-1,dy:0},
{dx:0,dy:1},
{dx:0,dy:-1}
];

return dirs[Math.floor(Math.random()*dirs.length)];

}

export function updateGhosts(){

for(let g of ghosts){

let nextX = g.x + g.dx;
let nextY = g.y + g.dy;

if(map[nextY] && map[nextY][nextX] !== 1){

g.x = nextX;
g.y = nextY;

}
else{

let d = randomDirection();
g.dx = d.dx;
g.dy = d.dy;

}

}

}

export function drawGhosts(ctx,tileSize,offsetX,offsetY){

for(let g of ghosts){

ctx.fillStyle = g.color;

ctx.beginPath();

ctx.arc(
offsetX + g.x*tileSize + tileSize/2,
offsetY + g.y*tileSize + tileSize/2,
tileSize/2-2,
0,
Math.PI*2
);

ctx.fill();

}

}