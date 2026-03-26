import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];
export let berserker = { active: false, timer: 0 };

export function spawnGhosts(level) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    // Buscamos celdas libres lejos del (1,1) de Pacman
    let cells = [];
    map.forEach((row, y) => row.forEach((v, x) => {
        if (v !== 1 && (x > 6 || y > 6)) cells.push({x, y});
    }));

    for (let i = 0; i < Math.min(2 + level, 4); i++) {
        let pos = cells[Math.floor(Math.random() * cells.length)];
        ghosts.push({
            x: pos.x, y: pos.y, vX: pos.x, vY: pos.y,
            color: colors[i % colors.length],
            speed: 0.07 + (level * 0.005),
            dirX: 0, dirY: 0, dead: false
        });
    }
}

export function updateGhosts(lives, level, score) {
    if (berserker.active) {
        berserker.timer--;
        if (berserker.timer <= 0) berserker.active = false;
    }

    for (let g of ghosts) {
        if (g.dead) continue;

        // Movimiento por rejilla (Tu lógica original)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[Math.round(g.y + m.dy)]?.[Math.round(g.x + m.dx)] !== 1
            );
            if (moves.length > 1) moves = moves.filter(m => m.dx !== -g.dirX || m.dy !== -g.dirY);
            let choice = moves[Math.floor(Math.random() * moves.length)];
            if(choice) { g.dirX = choice.dx; g.dirY = choice.dy; g.x += g.dirX; g.y += g.dy; }
        }

        g.vX += (g.x - g.vX) * g.speed;
        g.vY += (g.y - g.vY) * g.speed;

        // Colisión
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            if (berserker.active) {
                g.dead = true; score.value += 200;
                setTimeout(() => { g.dead = false; g.x = 9; g.y = 9; g.vX = 9; g.vY = 9; }, 3000);
            } else {
                lives.value--; resetPlayer(); spawnGhosts(level); return;
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        if (g.dead) continue;
        let x = offsetX + g.vX * tileSize, y = offsetY + g.vY * tileSize, s = tileSize;

        ctx.fillStyle = berserker.active ? "#2121ff" : g.color;
        ctx.beginPath();
        // Cabeza circular
        ctx.arc(x + s/2, y + s/2.5, s * 0.4, Math.PI, 0);
        // Cuerpo y las 3 puntas inferiores (Estilo imagen original)
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.75, y + s * 0.75);
        ctx.lineTo(x + s * 0.6, y + s * 0.9);
        ctx.lineTo(x + s * 0.5, y + s * 0.75);
        ctx.lineTo(x + s * 0.4, y + s * 0.9);
        ctx.lineTo(x + s * 0.25, y + s * 0.75);
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();

        // Ojos: Blancos con pupila azul mirando hacia ARRIBA
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.4, s*0.12, 0, 7);
        ctx.arc(x + s*0.65, y + s*0.4, s*0.12, 0, 7);
        ctx.fill();
        ctx.fillStyle = berserker.active ? "white" : "blue";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.32, s*0.05, 0, 7);
        ctx.arc(x + s*0.65, y + s*0.32, s*0.05, 0, 7);
        ctx.fill();
    }
}