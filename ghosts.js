import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

const COLORS = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    // Generamos de 2 a 4 fantasmas aleatoriamente como pediste
    const count = Math.floor(Math.random() * 3) + 2; 
    const speed = 2.0 + (level * 0.2);
    ghosts = [];
    
    const points = [{x:18,y:1}, {x:1,y:8}, {x:18,y:8}, {x:1,y:1}];

    for (let i = 0; i < count; i++) {
        ghosts.push({
            x: points[i % points.length].x,
            y: points[i % points.length].y,
            dirX: -1, dirY: 0,
            color: COLORS[i % COLORS.length],
            speed: speed,
            dead: false,
            mode: i === 0 ? "berserker" : "random"
        });
    }
}

export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let s = powerMode ? g.speed * 0.5 : g.speed;

        // --- SISTEMA DE RIEL (SNAP TO GRID) ---
        // Forzamos al fantasma a estar centrado en el eje donde no se mueve
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        let gx = Math.round(g.x);
        let gy = Math.round(g.y);

        // ¿Estamos en el centro de una baldosa? Decidimos giro.
        if (Math.abs(g.x - gx) < 0.1 && Math.abs(g.y - gy) < 0.1) {
            let hitWall = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;
            
            if (hitWall || isCruce(gx, gy)) {
                g.x = gx; g.y = gy; // Snap perfecto
                decidirRuta(g);
            }
        }

        g.x += g.dirX * s * dt;
        g.y += g.dirY * s * dt;

        // Colisión con Pac-Man
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.75) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                resetPlayer();
            }
        }
    });
}

function isCruce(x, y) {
    let p = 0;
    if (map[y]?.[x+1] !== 1) p++;
    if (map[y]?.[x-1] !== 1) p++;
    if (map[y+1]?.[x] !== 1) p++;
    if (map[y-1]?.[x] !== 1) p++;
    return p > 2;
}

function decidirRuta(g) {
    let gx = Math.round(g.x);
    let gy = Math.round(g.y);
    let moves = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
    ].filter(m => {
        return map[gy + m.dy]?.[gx + m.dx] !== 1 && (m.dx !== -g.dirX || m.dy !== -g.dirY);
    });

    if (moves.length === 0) {
        g.dirX *= -1; g.dirY *= -1;
    } else {
        if (g.mode === "berserker" && !powerMode) {
            moves.sort((a,b) => Math.hypot(gx+a.dx-pacman.x, gy+a.dy-pacman.y) - Math.hypot(gx+b.dx-pacman.x, gy+b.dy-pacman.y));
            g.dirX = moves[0].dx; g.dirY = moves[0].dy;
        } else {
            let move = moves[Math.floor(Math.random() * moves.length)];
            g.dirX = move.dx; g.dirY = move.dy;
        }
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();
        ctx.restore();
    });
}