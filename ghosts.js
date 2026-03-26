import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["red", "pink", "cyan", "orange"];
    for (let i = 0; i < 4; i++) {
        ghosts.push({
            x: 10, y: 10, vX: 10, vY: 10,
            dx: 0, dy: 0,
            color: colors[i],
            type: (i === 0) ? "berserker" : "random",
            speed: 0.08,
            anim: 0
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.anim += 0.15;
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}].filter(d => map[g.y+d.y][g.x+d.x] !== 1);
            
            if (g.type === "berserker" && !pacman.isSuper) {
                dirs.sort((a,b) => (Math.abs(g.x+a.x-pacman.x)+Math.abs(g.y+a.y-pacman.y)) - (Math.abs(g.x+b.x-pacman.x)+Math.abs(g.y+b.y-pacman.y)));
                g.dx = dirs[0].x; g.dy = dirs[0].y;
            } else {
                let rd = dirs[Math.floor(Math.random()*dirs.length)];
                g.dx = rd.x; g.dy = rd.y;
            }
            g.x += g.dx; g.y += g.dy;
        }

        let dX = g.x - g.vX;
        g.vX += Math.sign(dX) * Math.min(g.speed, Math.abs(dX));
        let dY = g.y - g.vY;
        g.vY += Math.sign(dY) * Math.min(g.speed, Math.abs(dY));

        // Colisión por distancia visual
        let dist = Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY);
        if (dist < 0.7) {
            if (pacman.isSuper) {
                g.x = 10; g.y = 10; g.vX = 10; g.vY = 10;
            } else {
                lives.value--;
                resetPlayer();
                ghosts.forEach(gh => { gh.x=10; gh.y=10; gh.vX=10; gh.vY=10; });
                break;
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let tx = offsetX + g.vX * tileSize;
        let ty = offsetY + g.vY * tileSize;
        let r = tileSize / 2;
        ctx.fillStyle = pacman.isSuper ? "blue" : g.color;
        ctx.beginPath();
        ctx.arc(tx + r, ty + r, r * 0.9, Math.PI, 0);
        ctx.lineTo(tx + tileSize * 0.9, ty + tileSize * 0.9);
        for (let i = 0; i <= 2; i++) {
            let wobble = Math.sin(g.anim + i) * 3;
            ctx.lineTo(tx + tileSize * 0.9 - (i * tileSize/2.5), ty + tileSize * 0.9 + wobble);
        }
        ctx.lineTo(tx + tileSize * 0.1, ty + r);
        ctx.fill();
    }
}