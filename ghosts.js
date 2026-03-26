import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];
export let berserker = { active: false, timer: 0 };

export function spawnGhosts() {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    // Posiciones manuales dentro de tu pasillo para asegurar que se vean
    const startPositions = [{x:18, y:1}, {x:1, y:9}, {x:18, y:9}, {x:9, y:5}];

    for (let i = 0; i < 4; i++) {
        let pos = startPositions[i];
        ghosts.push({
            x: pos.x, y: pos.y, vX: pos.x, vY: pos.y,
            color: colors[i], speed: 0.05, dirX: 0, dirY: 0, dead: false
        });
    }
}

export function updateGhosts(lives, score) {
    if (berserker.active) {
        berserker.timer--;
        if (berserker.timer <= 0) berserker.active = false;
    }

    for (let g of ghosts) {
        if (g.dead) continue;

        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[Math.round(g.y + m.dy)]?.[Math.round(g.x + m.dx)] !== 1
            );
            let choice = moves[Math.floor(Math.random() * moves.length)];
            if(choice) { g.dirX = choice.dx; g.dirY = choice.dy; g.x += g.dirX; g.y += g.dy; }
        }
        g.vX += (g.x - g.vX) * 0.1;
        g.vY += (g.y - g.vY) * 0.1;

        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            if (berserker.active) {
                g.dead = true; score.value += 200;
                setTimeout(() => { g.dead = false; g.x = 9; g.y = 5; g.vX = 9; g.vY = 5; }, 3000);
            } else {
                lives.value--; resetPlayer(); return;
            }
        }
    }
}

export function drawGhosts(ctx, offsetX, offsetY) {
    for (let g of ghosts) {
        if (g.dead) continue;
        let x = offsetX + g.vX * TILE_SIZE, y = offsetY + g.vY * TILE_SIZE, s = TILE_SIZE;
        ctx.fillStyle = berserker.active ? "#2121ff" : g.color;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2.5, s * 0.45, Math.PI, 0);
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.7, y + s * 0.75);
        ctx.lineTo(x + s * 0.5, y + s * 0.9);
        ctx.lineTo(x + s * 0.3, y + s * 0.75);
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();
        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath(); ctx.arc(x+s*0.35, y+s*0.4, s*0.15, 0, 7); ctx.arc(x+s*0.65, y+s*0.4, s*0.15, 0, 7); ctx.fill();
    }
}