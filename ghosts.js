import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

// Definición de los fantasmas con sus propiedades visuales y lógicas
export let ghosts = [
    { x: 18, y: 8, color: "red", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 0 },
    { x: 1, y: 8, color: "pink", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 1 },
    { x: 18, y: 1, color: "cyan", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 2 }
];

// --- AJUSTE DE DIFICULTAD ---
const GHOST_SPEED = 2.8; 

export function updateGhosts(lives, score, dt) {
    if (!dt) return; 

    ghosts.forEach(g => {
        // 1. LÓGICA DE MOVIMIENTO (Decisión en intersecciones)
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            // Buscamos direcciones posibles (que no sean muros)
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                return map[cy + m.dy]?.[cx + m.dx] !== 1;
            });

            // Filtramos para NO volver atrás (evita el rebote infinito en pasillos)
            let filteredMoves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            
            // Si hay camino hacia adelante, lo tomamos. Si es un callejón sin salida, permitimos volver.
            let finalChoices = filteredMoves.length > 0 ? filteredMoves : moves;

            let choice;
            if (g.color === "red") {
                // Inteligencia Berserker (Tu lógica original)
                choice = finalChoices.sort((a,b) => 
                    Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y) - 
                    Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y)
                )[0];
            } else {
                // --- MEJORA DE PATRULLAJE ---
                // Si pueden seguir recto, lo hacen el 80% de las veces. Si no, eligen azar.
                let sigueRecto = finalChoices.find(m => m.dx === g.lastDx && m.dy === g.lastDy);
                
                if (sigueRecto && Math.random() < 0.8) {
                    choice = sigueRecto;
                } else {
                    choice = finalChoices[Math.floor(Math.random() * finalChoices.length)];
                }
            }

            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }

        // 2. APLICAR MOVIMIENTO FÍSICO (Delta Time)
        g.x += g.dirX * GHOST_SPEED * dt;
        g.y += g.dirY * GHOST_SPEED * dt;

        // 3. LÓGICA DE MUERTE (Colisión con Pacman)
        let distancia = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        
        if (distancia < 0.7) {
            lives.value -= 1; 
            
            pacman.x = 1; pacman.y = 1;
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.nextDX = 0; pacman.nextDY = 0;

            ghosts[0].x = 18; ghosts[0].y = 8;
            ghosts[1].x = 1;  ghosts[1].y = 8;
            ghosts[2].x = 18; ghosts[2].y = 1;
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        let r = TILE_SIZE * 0.4; 

        ctx.save();
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx, gy, r, Math.PI, 0);
        
        let picos = 3;
        let anchoPico = (r * 2) / picos;
        let yBase = gy + r;
        
        ctx.lineTo(gx + r, yBase); 
        for (let i = 0; i < picos; i++) {
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico/2, yBase - r/3);
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico, yBase);
        }
        ctx.fill();

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "blue";
        let ex = g.dirX * (r/6); 
        let ey = g.dirY * (r/6);
        ctx.beginPath();
        ctx.arc(gx - r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}