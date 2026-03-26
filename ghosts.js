import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

// Función para inicializar fantasmas (se llama al inicio y en cada nivel)
export function spawnGhostsForLevel() {
    ghosts = [];
    const colors = ["red", "pink", "cyan", "orange"];
    
    // Generamos entre 1 y 4 fantasmas
    const num = 1 + Math.floor(Math.random() * 4); 

    for (let i = 0; i < num; i++) {
        ghosts.push({
            x: 10, y: 10,      // Posición lógica (casa de fantasmas)
            vX: 10, vY: 10,    // Posición visual suave
            dx: 0, dy: 0,
            color: colors[i],
            type: (i === 0) ? "berserker" : "random",
            speed: 0.1,        // Un poco más lentos que Pacman (0.15)
            animTime: 0        // Para el movimiento de las patas
        });
    }
}

export function updateGhosts(lives) {
    for (let g of ghosts) {
        g.animTime += 0.15;

        // 1. Lógica de Rejilla (Snap) - Buscar nueva dirección al llegar al centro
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x;
            g.vY = g.y;

            // Obtener direcciones posibles (que no sean muros)
            let dirs = [
                {x: 1, y: 0}, {x: -1, y: 0}, 
                {x: 0, y: 1}, {x: 0, y: -1}
            ].filter(d => map[g.y + d.y] && map[g.y + d.y][g.x + d.x] !== 1);

            if (dirs.length > 0) {
                if (g.type === "berserker" && !pacman.isSuper) {
                    // IA BERSERKER: Elegir la dirección que más reduzca la distancia a Pacman
                    dirs.sort((a, b) => {
                        let distA = Math.hypot((g.x + a.x) - pacman.x, (g.y + a.y) - pacman.y);
                        let distB = Math.hypot((g.x + b.x) - pacman.x, (g.y + b.y) - pacman.y);
                        return distA - distB;
                    });
                    g.dx = dirs[0].x;
                    g.dy = dirs[0].y;
                } else {
                    // IA RANDOM: Elegir dirección al azar (evitando volver atrás si es posible)
                    if (dirs.length > 1) {
                        dirs = dirs.filter(d => d.x !== -g.dx || d.y !== -g.dy);
                    }
                    let chosen = dirs[Math.floor(Math.random() * dirs.length)];
                    g.dx = chosen.x;
                    g.dy = chosen.y;
                }
                g.x += g.dx;
                g.y += g.dy;
            }
        }

        // 2. Movimiento Visual Suave (Interpolación)
        if (g.vX !== g.x) {
            let diff = g.x - g.vX;
            g.vX += Math.sign(diff) * Math.min(g.speed, Math.abs(diff));
        }
        if (g.vY !== g.y) {
            let diff = g.y - g.vY;
            g.vY += Math.sign(diff) * Math.min(g.speed, Math.abs(diff));
        }

        // 3. COLISIÓN CRÍTICA (Usa posiciones visuales vX, vY)
        let distance = Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY);
        
        if (distance < 0.7) { // Umbral de colisión (0.7 de una celda)
            if (pacman.isSuper) {
                // Pacman come al fantasma
                g.x = 10; g.y = 10;
                g.vX = 10; g.vY = 10;
            } else {
                // Fantasma mata a Pacman
                lives.value--;
                resetPlayer();
                // Resetear todos los fantasmas a la casa
                ghosts.forEach(gh => {
                    gh.x = 10; gh.y = 10;
                    gh.vX = 10; gh.vY = 10;
                    gh.dx = 0; gh.dy = 0;
                });
                break; // Salir del bucle para evitar múltiples muertes en un frame
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let tx = offsetX + g.vX * tileSize;
        let ty = offsetY + g.vY * tileSize;
        let r = tileSize / 2;

        ctx.save();
        ctx.fillStyle = pacman.isSuper ? "#0000FF" : g.color; // Azul si Pacman tiene poder

        // Cuerpo: Cabeza y laterales
        ctx.beginPath();
        ctx.arc(tx + r, ty + r, r * 0.9, Math.PI, 0); // Mitad superior redonda
        ctx.lineTo(tx + tileSize * 0.9, ty + tileSize * 0.9);
        
        // Efecto de "patas" animado
        for (let i = 0; i <= 3; i++) {
            let step = (tileSize * 0.8) / 3;
            let wobble = Math.sin(g.animTime + (i * Math.PI / 2)) * 3;
            ctx.lineTo(tx + tileSize * 0.9 - (i * step), ty + tileSize * 0.9 + wobble);
        }
        
        ctx.lineTo(tx + tileSize * 0.1, ty + r);
        ctx.closePath();
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(tx + r - 5, ty + r - 3, 4, 0, Math.PI * 2);
        ctx.arc(tx + r + 5, ty + r - 3, 4, 0, Math.PI * 2);
        ctx.fill();

        // Pupilas (mirando hacia donde se mueven)
        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(tx + r - 5 + (g.dx * 2), ty + r - 3 + (g.dy * 2), 2, 0, Math.PI * 2);
        ctx.arc(tx + r + 5 + (g.dx * 2), ty + r - 3 + (g.dy * 2), 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Inicialización automática al cargar el módulo
spawnGhostsForLevel();