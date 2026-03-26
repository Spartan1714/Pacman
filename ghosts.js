import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [
    { x: 18, y: 8, color: "red", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0 },
    { x: 1, y: 8, color: "pink", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0 },
    { x: 18, y: 1, color: "cyan", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0 }
];

// VELOCIDAD: Pacman tiene 5.0, los fantasmas 2.8 (Disfrutable)
const GHOST_SPEED = 2.8; 

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    ghosts.forEach(g => {
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        // Inteligencia de giro en el centro de la celda
        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                return map[cy + m.dy]?.[cx + m.dx] !== 1 && (m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            });

            if (moves.length === 0) moves = [{dx: -g.lastDx, dy: -g.lastDy}];

            // Persecución para el rojo, azar para los demás
            let choice = (g.color === "red") ? 
                moves.sort((a,b) => Math.hypot((cx+a.dx)-pacman.x, (cy+a.dy)-pacman.y) - Math.hypot((cx+b.dx)-pacman.x, (cy+b.dy)-pacman.y))[0] :
                moves[Math.floor(Math.random() * moves.length)];

            if (choice) {
                g.dirX = choice.dx; g.dirY = choice.dy;
                g.lastDx = choice.dx; g.lastDy = choice.dy;
            }
        }

        // Movimiento real
        g.x += g.dirX * GHOST_SPEED * dt;
        g.y += g.dirY * GHOST_SPEED * dt;

        // Colisión con Pacman
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.6) {
            lives.value--;
            pacman.x = 1; pacman.y = 1; // Reset posición
            pacman.dirX = 0; pacman.dirY = 0;
        }
    }); // Aquí cerramos el forEach
} // Aquí cerramos la función updateGhosts

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        let gx = ox + g.x * TILE_SIZE + TILE_SIZE / 2;
        let gy = oy + g.y * TILE_SIZE + TILE_SIZE / 2;
        let r = TILE_SIZE * 0.4;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(gx, gy, r, Math.PI, 0);
        ctx.lineTo(gx + r, gy + r);
        ctx.lineTo(gx - r, gy + r);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(gx - 4, gy - 4, 3, 0, Math.PI * 2);
        ctx.arc(gx + 4, gy - 4, 3, 0, Math.PI * 2);
        ctx.fill();
    });
}