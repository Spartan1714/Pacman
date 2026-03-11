import { map } from "./map.js";

export let pacman = {
x:1,
y:1,
dx:0,
dy:0
};

let lastMoveTime = 0;
const MOVE_DELAY = 120;

export function setDirection(dx,dy){

pacman.dx = dx;
pacman.dy = dy;

}

export function updatePlayer(scoreRef){

let now = Date.now();

if(now - lastMoveTime < MOVE_DELAY) return;

let nextX = pacman.x + pacman.dx;
let nextY = pacman.y + pacman.dy;

if(map[nextY] && map[nextY][nextX] !== 1){

pacman.x = nextX;
pacman.y = nextY;

if(map[nextY][nextX] === 2){

map[nextY][nextX] = 0;
scoreRef.value += 10;

}

}

lastMoveTime = now;

}

export function drawPlayer(ctx,tileSize,offsetX,offsetY){

ctx.fillStyle="yellow";

let startAngle = 0.2*Math.PI;
let endAngle = 1.8*Math.PI;

if(pacman.dx === -1){
startAngle = 1.2*Math.PI;
endAngle = 0.8*Math.PI;
}

if(pacman.dy === -1){
startAngle = 1.7*Math.PI;
endAngle = 1.3*Math.PI;
}

if(pacman.dy === 1){
startAngle = 0.7*Math.PI;
endAngle = 0.3*Math.PI;
}

ctx.beginPath();

ctx.arc(
offsetX + pacman.x*tileSize + tileSize/2,
offsetY + pacman.y*tileSize + tileSize/2,
tileSize/2 - 2,
startAngle,
endAngle
);

ctx.lineTo(
offsetX + pacman.x*tileSize + tileSize/2,
offsetY + pacman.y*tileSize + tileSize/2
);

ctx.fill();

}