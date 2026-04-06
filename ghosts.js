import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function spawnGhosts(level = 1) {
    // Posiciones iniciales fijas en el mapa
    ghosts = [
        { x: 18, y: 1, vX: 18, vY: 1, color: "red", mode: "berserker", dead: false, lastDx: 0, lastDy: 0 },
        { x: 1, y: 8, vX: 1, vY: 8, color: "pink", mode: "random", dead: false, lastDx: 0, lastDy: 0 },
        { x: 18, y: 8, vX: 18, vY: 8, color: "cyan", mode: "random", dead: false, lastDx: 0, lastDy: 0 }
    ];
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    // Velocidad de movimiento visual (Lerp)
    const lerpSpeed = powerMode ? 4 : 7; 

    ghosts.forEach(g => {
        if (g.dead) return;

        // Si el fantasma visual ya llegó a su destino lógico, elige el siguiente
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x;
            g.vY = g.y;

            // Buscar caminos posibles (no muros)
            let moves = [{dx:1,dy:0}, {dx:-1,dy:0}, {dx:0,dy:1}, {dx:0,dy:-1}].filter(m => 
                map[Math.round(g.y + m.dy)]?.[Math.round(g.x + m.dx)] !== 1
            );

            // Evitar que den la vuelta 180 si hay más opciones
            if (moves.length > 1) {
                moves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            }

            let choice;
            if (g.mode === "berserker" && !powerMode) {
                // Persecución: ordenar movimientos por cercanía a Pac-Man
                choice = moves.sort((a, b) => 
                    Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y) - 
                    Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y)
                )[0];
            } else {
                // Movimiento aleatorio
                choice = moves[Math.floor(Math.random() * moves.length)];
            }
            
            if (choice) {
                g.x += choice.dx;
                g.y += choice.dy;
                g.lastDx = choice.dx;
                g.lastDy = choice.dy;
            }
        }
        
        // Movimiento suave de la posición visual hacia la posición lógica
        g.vX += (g.x - g.vX) * lerpSpeed * dt;
        g.vY += (g.y - g.vY) * lerpSpeed * dt;

        // Colisión revisada (usamos vX y vY para que coincida con lo que ves)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.7) {
            if (powerMode) {
                g.dead = true;
                score.value += 500;
            } else {
                lives.value--;
                // Llamamos a resetPlayer que se importa de player.js
                import("./player.js").then(m => m.resetPlayer());
            }
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.vX * TILE_SIZE, y = oy + g.vY * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.85, y + s*0.9);
        ctx.lineTo(x + s*0.65, y + s*0.75);
        ctx.lineTo(x + s*0.5, y + s*0.9);
        ctx.lineTo(x + s*0.35, y + s*0.75);
        ctx.lineTo(x + s*0.15, y + s*0.9);
        ctx.fill();
        ctx.fillStyle = "white"; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(x + s*0.35, y + s*0.4, s*0.1, 0, 7); 
        ctx.arc(x + s*0.65, y + s*0.4, s*0.1, 0, 7); ctx.fill();
        ctx.restore();
    });
}