import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function spawnGhosts(level = 1) {
    const speed = 2.5 + (level * 0.2);
    // Posiciones iniciales exactas
    ghosts = [
        { x: 18, y: 1, vX: 18, vY: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, vX: 1, vY: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, vX: 18, vY: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, speed: speed }
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

    ghosts.forEach(g => {
        if (g.dead) return;

        let actualSpeed = powerMode ? g.speed * 0.5 : g.speed;
        
        // 1. INTENTAR MOVER
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 2. ¿HAY UN MURO EN LA DIRECCIÓN ACTUAL?
        // Revisamos un poco más allá de la posición actual (0.4 de margen)
        let checkX = nextX + g.dirX * 0.4;
        let checkY = nextY + g.dirY * 0.4;

        if (map[Math.round(checkY)]?.[Math.round(checkX)] === 1) {
            // Si hay muro, nos detenemos justo en el centro de la baldosa actual
            g.x = Math.round(g.x);
            g.y = Math.round(g.y);
            
            // Y forzamos a buscar una nueva dirección
            let options = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ].filter(opt => map[g.y + opt.dy]?.[g.x + opt.dx] !== 1);

            if (options.length > 0) {
                let choice = options[Math.floor(Math.random() * options.length)];
                g.dirX = choice.dx;
                g.dirY = choice.dy;
            }
        } else {
            // Si no hay muro, seguimos avanzando
            g.x = nextX;
            g.y = nextY;
        }

        // 3. LÓGICA DE INTERSECCIÓN (Girar aunque no haya muro enfrente)
        // Si estamos muy cerca del centro, hay una pequeña probabilidad de girar en cruces
        if (Math.abs(g.x - Math.round(g.x)) < 0.1 && Math.abs(g.y - Math.round(g.y)) < 0.1) {
            if (Math.random() < 0.2) { // 20% de probabilidad de evaluar giro en cada cruce
                let gridX = Math.round(g.x);
                let gridY = Math.round(g.y);
                let options = [
                    {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}
                ].filter(opt => map[gridY + opt.dy]?.[gridX + opt.dx] !== 1 && (opt.dx !== -g.dirX || opt.dy !== -g.dirY));
                
                if (options.length > 0) {
                    let choice = options[Math.floor(Math.random() * options.length)];
                    g.x = gridX; g.y = gridY; // Snap al centro
                    g.dirX = choice.dx; g.dirY = choice.dy;
                }
            }
        }

        // Sincronizar visual
        g.vX = g.x; g.vY = g.y;

        // Colisión
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
            if (powerMode) { g.dead = true; score.value += 500; }
            else { lives.value--; resetPlayer(); }
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