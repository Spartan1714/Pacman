import { map, TILE_SIZE } from "./map.js";

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;
let ghostSpeed = 2.5;

export function activarPowerMode() {
    powerMode = true;
    powerTimer = 400;
}

export function spawnGhosts() {
    const colores = ["red", "pink", "cyan", "orange", "purple"];
    const cant = Math.floor(Math.random() * 5) + 1;
    ghosts = [];
    for (let i = 0; i < cant; i++) {
        ghosts.push({ x: 9, y: 4, color: colores[i], dirX: 0, dirY: 0, dead: false });
    }
}

export function updateGhosts(lives, score, dt, pPos) {
    if (!dt) return;
    if (powerMode && --powerTimer <= 0) powerMode = false;

    ghosts.forEach(g => {
        if (g.dead) return;
        let cx = Math.round(g.x), cy = Math.round(g.y);
        let s = powerMode ? ghostSpeed * 0.5 : ghostSpeed;

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => map[cy+m.dy]?.[cx+m.dx] !== 1);
            let choice = moves[Math.floor(Math.random() * moves.length)];
            if (choice) { g.dirX = choice.dx; g.dirY = choice.dy; }
        }
        g.x += g.dirX * s * dt; g.y += g.dirY * s * dt;

        if (Math.hypot(g.x - pPos.x, g.y - pPos.y) < 0.7) {
            if (powerMode) { g.dead = true; score.value += 200; }
            else { lives.value--; pPos.x = 1; pPos.y = 1; }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        ctx.fillStyle = powerMode ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(ox + g.x * TILE_SIZE + TILE_SIZE/2, oy + g.y * TILE_SIZE + TILE_SIZE/2, TILE_SIZE/2.5, 0, Math.PI*2);
        ctx.fill();
    });
}