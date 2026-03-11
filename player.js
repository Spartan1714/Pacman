import { map, TILE_SIZE } from "./map.js";

export let pacman = {
    x: TILE_SIZE * 1.5,
    y: TILE_SIZE * 1.5,
    dx: 0,
    dy: 0,
    speed: 120
};

let mouthAngle = 0.2;
let mouthDir = 1;

export function setDirection(dx, dy){
    pacman.dx = dx;
    pacman.dy = dy;
}

export function updatePlayer(scoreRef, deltaTime){

    let move = pacman.speed * deltaTime / 1000;

    let nextX = pacman.x + pacman.dx * move;
    let nextY = pacman.y + pacman.dy * move;

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

    // animación de boca
    mouthAngle += 0.02 * mouthDir;

    if(mouthAngle > 0.35 || mouthAngle < 0.05){
        mouthDir *= -1;
    }

}

export function drawPlayer(ctx){

    let startAngle = mouthAngle * Math.PI;
    let endAngle = (2 - mouthAngle) * Math.PI;

    if(pacman.dx === -1){
        startAngle = (1 + mouthAngle) * Math.PI;
        endAngle = (1 - mouthAngle) * Math.PI;
    }

    if(pacman.dy === -1){
        startAngle = (1.5 + mouthAngle) * Math.PI;
        endAngle = (1.5 - mouthAngle) * Math.PI;
    }

    if(pacman.dy === 1){
        startAngle = (0.5 + mouthAngle) * Math.PI;
        endAngle = (0.5 - mouthAngle) * Math.PI;
    }

    ctx.fillStyle = "yellow";

    ctx.beginPath();

    ctx.arc(
        pacman.x,
        pacman.y,
        TILE_SIZE/2 - 2,
        startAngle,
        endAngle
    );

    ctx.lineTo(pacman.x, pacman.y);

    ctx.fill();
}