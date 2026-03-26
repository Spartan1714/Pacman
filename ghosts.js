import { map, TILE_SIZE } from "./map.js";
import { pacman } from "./player.js";

export let ghosts = [
    { x: 18, y: 8, color: "red", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, targetX: 18, targetY: 8 },
    { x: 1, y: 8, color: "pink", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, targetX: 1, targetY: 8 },
    { x: 18, y: 1, color: "cyan", dirX: 0, dirY: 0, lastDx: 0, lastDy: 0, targetX: 18, targetY: 1 }
];

// --- EL PARÁMETRO CLAVE ---
// Pacman tiene 5.0. Si ponemos 2.8 a los fantasmas, irán a casi la mitad de velocidad.
// Si aún los sientes rápidos, baja este número a 2.0.
const GHOST_SPEED = 2.8; 

export function updateGhosts(lives, score, dt) {
    if (!dt) return;

    ghosts.forEach(g => {
        // 1. Lógica de decisión en intersecciones
        let cx = Math.round(g.x);
        let cy = Math.round(g.y);

        // Solo deciden dirección cuando están muy cerca del centro de la baldosa
        if (Math.abs(g.x - cx) < 0.1 && Math.abs(g.y - cy) < 0.1) {
            
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => {
                let nextX = cx + m.dx;
                let nextY = cy + m.dy;
                // No chocar con muros y no volver exactamente por donde vinieron
                return map[nextY]?.[nextX] !== 1 && (m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            });

            // Si se quedan encerrados (callejón sin salida), permiten volver atrás
            if (moves.length === 0) {
                moves = [{dx:-g.lastDx, dy:-g.lastDy}];
            }

            // Persecución inteligente (Berserker) o Aleatoria
            let choice;
            if (g.color === "red") {
                // El rojo siempre busca el camino más corto a Pacman
                choice = moves.sort((a,b) => 
                    Math.hypot((cx+a.dx) - pacman.x, (cy+a.dy) - pacman.y) - 
                    Math.hypot((cx+b.dx) - pacman.x, (cy+b.dy) - pacman.y)
                )