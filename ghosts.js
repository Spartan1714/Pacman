import { map } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["red", "pink", "cyan", "orange"];
    const num = 1 + Math.floor(Math.random() * 4); // Entre 1 y 4

    for (let i = 0; i < num; i++) {
        ghosts.push({
            x: 5, y: 5, vX: 5, vY: 5,
            dx: 0, dy: 0,
            color: colors[i],
            type: (i === 0) ? "berserker" : "random",
            speed: 0.1 // Un poco más lentos que Pacman
        });
    }
}

function getPossibleDirs(g) {
    let dirs = [{x:1, y:0}, {x:-1, y:0}, {x:0, y:1}, {x:0, y:-1}];
    return dirs.filter(d => map[Math.round(g.y + d.y)][Math.round(g.x + d.x)] !== 1);
}

export function updateGhosts(livesRef) {
    for (let g of ghosts) {
        // Movimiento suave
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            let dirs = getPossibleDirs(g);
            let chosen;

            if (g.type === "berserker" && !pacman.isSuper) {
                // IA que busca a Pacman
                dirs.sort((a, b) => {
                    let distA = Math.abs((g.x+a.x) - pacman.x) + Math.abs((g.y+a.y) - pacman.y);
                    let distB = Math.abs((g.x+b.x) - pacman.x) + Math.abs((g.y+b.y) - pacman.y);
                    return distA - distB;
                });
                chosen = dirs[0];
            } else {
                chosen = dirs[Math.floor(Math.random() * dirs.length)];
            }

            if (chosen) {
                g.dx = chosen.x; g.dy = chosen.y;
                g.x += g.dx; g.y += g.dy;
            }
        }

        if (g.vX < g.x) g.vX += g.speed;
        if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed;
        if (g.vY > g.y) g.vY -= g.speed;

        // Colisión
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.5) {
            if (pacman.isSuper) {
                g.x = 5; g.y = 5; g.vX = 5; g.vY = 5;
            } else {
                livesRef.value--;
                resetPlayer();
                ghosts.forEach(gh => { gh.x=5; gh.y=5; gh.vX=5; gh.vY=5; });
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let tx = offsetX + g.vX * tileSize + tileSize / 2;
        let ty = offsetY + g.vY * tileSize + tileSize / 2;
        ctx.fillStyle = pacman.isSuper ? "blue" : g.color;
        
        ctx.beginPath();
        ctx.arc(tx, ty, tileSize/2.2, 0, Math.PI * 2);
        ctx.fill();
        // Ojos básicos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(tx-5, ty-5, 3, 0, Math.PI*2);
        ctx.arc(tx+5, ty-5, 3, 0, Math.PI*2);
        ctx.fill();
    }
}

// Iniciar fantasmas la primera vez
spawnGhostsForLevel();