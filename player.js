import { map, TILE_SIZE } from "./map.js";

export let pacman = {

x: TILE_SIZE * 1.5,
y: TILE_SIZE * 1.5,

vx: 0,
vy: 0,

speed: 120

};

export function setDirection(dx,dy){

pacman.vx = dx * pacman.speed;
pacman.vy = dy * pacman.speed;

}

export function updatePlayer(scoreRef,deltaTime){

let moveX = pacman.vx * deltaTime / 1000;
let moveY = pacman.vy * deltaTime / 1000;

let nextX = pacman.x + moveX;
let nextY = pacman.y + moveY;

let tileX = Math.floor(nextX / TILE_SIZE);
let tileY = Math.floor(nextY / TILE_SIZE);

if(map[tileY] && map[tileY][tileX] !== 1){

pacman.x = nextX;
pacman.y = nextY;

if(map[tileY][tileX] === 2){

map[tileY][tileX] = 0;
scoreRef.value += 10;

}

}

}

export function drawPlayer(ctx){

let startAngle = 0.2*Math.PI;
let endAngle = 1.8*Math.PI;

if(pacman.vx < 0){

startAngle = 1.2*Math.PI;
endAngle = 0.8*Math.PI;

}

if(pacman.vy < 0){

startAngle = 1.7*Math.PI;
endAngle = 1.3*Math.PI;

}

if(pacman.vy > 0){

startAngle = 0.7*Math.PI;
endAngle = 0.3*Math.PI;

}

ctx.fillStyle="yellow";

ctx.beginPath();

ctx.arc(
pacman.x,
pacman.y,
TILE_SIZE/2 - 2,
startAngle,
endAngle
);

ctx.lineTo(pacman.x,pacman.y);

ctx.fill();

}