import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

// Definición de los fantasmas con sus propiedades visuales y lógicas
export let ghosts = [
    { x: 18, y: 8, color: "red", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 0 },
    { x: 1, y: 8, color: "pink", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 1 },
    { x: 18, y: 1, color: "cyan", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, id: 2 }
];

// --- AJUSTE DE DIFICULTAD ---
// Pacman tiene 5.0. Los fantasmas a 2.8 es una velocidad justa y disfrutable.
const GHOST_SPEED = 2.8; 

export function updateGhosts(lives, score, dt) {
    if (!dt) return; // Seguridad para el primer frame

    ghosts.forEach(g => {
        // 1. LÓGICA DE MOVIMIENTO (Decisión en intersecciones)
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        // Solo deciden dirección cuando están centrados en la baldosa
        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                // No chocar con muros y no volver atrás
                return map[cy + m.dy]?.[cx + m.dx] !== 1 && (m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            });

            // Si se quedan atrapados, permiten volver atrás
            if (moves.length === 0) moves = [{dx: -g.lastDx, dy: -g.lastDy}];

            // Inteligencia: El rojo persigue, los demás son aleatorios
            let choice;
            if (g.color === "red") {
                choice = moves.sort((a,b) => 
                    Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y) - 
                    Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y)
                )[0];
            } else {
                choice = moves[Math.floor(Math.random() * moves.length)];
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
        // Usamos una distancia de 0.7 para que sea justo visualmente
        let distancia = Math.hypot(g.x - pacman.x, g.y - pacman.y);
        
        if (distancia < 0.7) {
            lives.value -= 1; // Restamos una vida real
            
            // Reset de posiciones inmediato
            pacman.x = 1; pacman.y = 1;
            pacman.dirX = 0; pacman.dirY = 0;
            pacman.nextDX = 0; pacman.nextDY = 0;

            // Mandar fantasmas a sus esquinas originales
            ghosts[0].x = 18; ghosts[0].y = 8;
            ghosts[1].x = 1;  ghosts[1].y = 8;
            ghosts[2].x = 18; ghosts[2].y = 1;
        }
    });
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        // Posición real en píxeles centrado en la baldosa
        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        let r = TILE_SIZE * 0.4; // Radio del cuerpo

        ctx.save();
        
        // --- DIBUJAR CUERPO (Estilo Retro con Picos) ---
        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza semicircular
        ctx.arc(gx, gy, r, Math.PI, 0);
        
        // Base con picos (para que se vea clásico)
        let picos = 3;
        let anchoPico = (r * 2) / picos;
        let yBase = gy + r;
        
        ctx.lineTo(gx + r, yBase); // Esquina inferior derecha
        
        // Dibujamos los picos hacia atrás (izquierda)
        for (let i = 0; i < picos; i++) {
            // Pico abajo
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico/2, yBase - r/3);
            // Pico arriba
            ctx.lineTo(gx + r - (i * anchoPico) - anchoPico, yBase);
        }
        
        ctx.fill();

        // --- DIBUJAR OJOS (Blancos) ---
        ctx.fillStyle = "white";
        ctx.beginPath();
        // Ojo izquierdo y derecho
        ctx.arc(gx - r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5, gy - r/3, r/3, 0, Math.PI * 2);
        ctx.fill();

        // --- DIBUJAR PUPILAS (Azules, mirando en la dirección del movimiento) ---
        ctx.fillStyle = "blue";
        // Desplazamiento de la pupila según la dirección (dirX/Y son 1, -1 o 0)
        let ex = g.dirX * (r/6); // Multiplicamos por un factor pequeño para que no se salgan del ojo
        let ey = g.dirY * (r/6);
        
        ctx.beginPath();
        // Pupila izquierda y derecha
        ctx.arc(gx - r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.arc(gx + r/2.5 + ex, gy - r/3 + ey, r/6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
}