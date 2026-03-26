import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];
export let berserker = { active: false, timer: 0 };

export function spawnGhosts(level) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    
    // Buscamos celdas libres lejos de la zona de inicio de Pacman (x1, y1)
    let safeSpawnPoints = [];
    map.forEach((row, y) => row.forEach((v, x) => {
        // Al menos a 5 celdas de distancia
        if (v !== 1 && (x > 5 || y > 5)) { 
            safeSpawnPoints.push({x, y});
        }
    }));

    // Cantidad dinámica según nivel (max 4)
    for (let i = 0; i < Math.min(2 + level, 4); i++) {
        let pos = safeSpawnPoints[Math.floor(Math.random() * safeSpawnPoints.length)];
        ghosts.push({
            x: pos.x, y: pos.y, 
            vX: pos.x, vY: pos.y, // Posición visual (interpolación)
            color: colors[i % colors.length],
            speed: 0.08, // Velocidad base
            dirX: 0, dirY: 0,
            dead: false
        });
    }
}

export function updateGhosts(lives, level, score) {
    // Temporizador Berserker
    if (berserker.active) {
        berserker.timer--;
        if (berserker.timer <= 0) berserker.active = false;
    }

    for (let g of ghosts) {
        if (g.dead) continue;

        // IA de movimiento centrada en celdas (Tu lógica original)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y; // Snap al centro
            
            let possibleMoves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                let ny = Math.round(g.y + m.dy);
                let nx = Math.round(g.x + m.dx);
                return map[ny] && map[ny][nx] !== 1; // Solo pasillos
            });

            // Evitar darse la vuelta 180° si hay más opciones
            if (possibleMoves.length > 1) {
                possibleMoves = possibleMoves.filter(m => m.dx !== -g.dirX || m.dy !== -g.dirY);
            }
            
            // Elegir dirección aleatoria
            let choice = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            
            if(choice) {
                g.dirX = choice.dx;
                g.dirY = choice.dy;
                g.x += g.dirX;
                g.y += g.dy;
            }
        }

        // Interpolación visual suave (Tu lógica original)
        g.vX += (g.x - g.vX) * 0.1;
        g.vY += (g.y - g.vY) * 0.1;

        // COLISIÓN JUSTA (Muerte por proximidad visual)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.6) {
            if (berserker.active) {
                // Modo Berserker: Fantasma comido
                g.dead = true;
                score.value += 200;
                // Respawn tras 3 segundos en el centro
                setTimeout(() => { g.dead = false; g.x = 7; g.y = 7; g.vX = 7; g.vY = 7; }, 3000);
            } else {
                // Modo Normal: Pacman muere
                lives.value--;
                resetPlayer();
                // Resetear fantasmas a nuevas posiciones aleatorias
                spawnGhosts(level); 
                return; // Salimos para evitar múltiples muertes en el mismo frame
            }
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        if (g.dead) continue;
        let x = offsetX + g.vX * tileSize;
        let y = offsetY + g.vY * tileSize;
        let s = tileSize; // Simplificamos tileSize a 's'

        // Color Berserker (Azul parpadeante al final)
        if (berserker.active) {
            ctx.fillStyle = (berserker.timer < 100 && berserker.timer % 20 < 10) ? "white" : "#2121ff";
        } else {
            ctx.fillStyle = g.color;
        }
        
        // --- CUERPO FANTASMA (DISEÑO FIEL 3 PUNTAS) ---
        ctx.beginPath();
        // Cabeza (arco superior perfecto)
        ctx.arc(x + s/2, y + s/2.5, s * 0.45, Math.PI, 0); 
        // Costado derecho
        ctx.lineTo(x + s * 0.95, y + s * 0.9); 
        // Base geométrica (3 Puntas rectas simétricas)
        ctx.lineTo(x + s * 0.80, y + s * 0.75); // Punta 1 (derecha)
        ctx.lineTo(x + s * 0.65, y + s * 0.9);
        ctx.lineTo(x + s * 0.50, y + s * 0.75); // Punta 2 (centro)
        ctx.lineTo(x + s * 0.35, y + s * 0.9);
        ctx.lineTo(x + s * 0.20, y + s * 0.75); // Punta 3 (izquierda)
        ctx.lineTo(x + s * 0.05, y + s * 0.9);
        // Costado izquierdo
        ctx.lineTo(x + s * 0.05, y + s/2.5); 
        ctx.fill();

        // --- OJOS (PUPILAS AZULES FIJAS ARRIBA) ---
        ctx.fillStyle = "white";
        // Globos oculares elípticos fijos
        ctx.beginPath(); 
        ctx.arc(x + s*0.35, y + s*0.4, s*0.15, 0, 7); // Izquierdo
        ctx.arc(x + s*0.65, y + s*0.4, s*0.15, 0, 7); // Derecho
        ctx.fill();
        
        // Pupilas (azules fijos arriba como en tu imagen)
        ctx.fillStyle = "blue";
        let lookUpOffset = s * 0.08; // Desplazamiento hacia arriba
        ctx.beginPath(); 
        ctx.arc(x + s*0.35, y + s*0.4 - lookUpOffset, s*0.07, 0, 7); // Izquierda
        ctx.arc(x + s*0.65, y + s*0.4 - lookUpOffset, s*0.07, 0, 7); // Derecha
        ctx.fill();
    }
}