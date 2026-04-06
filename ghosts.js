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
    // IMPORTANTE: Asegurar que x e y sean ENTEROS al nacer
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "red", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "pink", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "cyan", mode: "random", dead: false, speed: speed }
    ];
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

        // 1. PREDICCIÓN DE MOVIMIENTO (Igual que el Player)
        let nextX = g.x + g.dirX * actualSpeed * dt;
        let nextY = g.y + g.dirY * actualSpeed * dt;

        // 2. CHEQUEO DE MURO FRONTAL
        // Usamos Math.round para saber en qué baldosa caería el "frente" del fantasma
        let stepX = Math.round(nextX + g.dirX * 0.3);
        let stepY = Math.round(nextY + g.dirY * 0.3);

        if (map[stepY]?.[stepX] !== 1) {
            // CAMINO LIBRE: Se mueve fluido
            g.x = nextX;
            g.y = nextY;
        } else {
            // COLISIÓN: Se pega al centro de la baldosa y cambia de rumbo
            g.x = Math.round(g.x);
            g.y = Math.round(g.y);
            buscarNuevaRuta(g);
        }

        // 3. IA DE GIRO EN INTERSECCIONES
        // Para que no solo vayan en línea recta, si pasan por un centro, deciden si girar
        if (Math.abs(g.x - Math.round(g.x)) < 0.1 && Math.abs(g.y - Math.round(g.y)) < 0.1) {
            // Pequeña probabilidad de evaluar un giro aunque no haya muro enfrente
            if (Math.random() < 0.05) { 
                buscarNuevaRuta(g);
            }
        }

        // 4. COLISIÓN CON PAC-MAN
        if (Math.hypot(g.x - pacman.x, g.y - pacman.y) < 0.7) {
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

function buscarNuevaRuta(g) {
    let options = [
        {dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy:-1}
    ].filter(opt => {
        let tx = Math.round(g.x) + opt.dx;
        let ty = Math.round(g.y) + opt.dy;
        return map[ty]?.[tx] !== 1 && (opt.dx !== -g.dirX || opt.dy !== -g.dirY);
    });

    if (options.length === 0) {
        // Si es callejón sin salida, media vuelta obligatoria
        g.dirX *= -1;
        g.dirY *= -1;
    } else {
        let choice;
        if (g.mode === "berserker" && !powerMode) {
            // Lógica objetiva: el que esté más cerca de Pacman
            choice = options.sort((a, b) => 
                Math.hypot((g.x + a.dx) - pacman.x, (g.y + a.dy) - pacman.y) - 
                Math.hypot((g.x + b.dx) - pacman.x, (g.y + b.dy) - pacman.y)
            )[0];
        } else {
            choice = options[Math.floor(Math.random() * options.length)];
        }
        g.dirX = choice.dx;
        g.dirY = choice.dy;
    }
}

export function drawGhosts(ctx, ox, oy) {
    ghosts.forEach(g => {
        if (g.dead) return;
        let x = ox + g.x * TILE_SIZE, y = oy + g.y * TILE_SIZE, s = TILE_SIZE;
        ctx.save();
        ctx.fillStyle = powerMode ? "#2121ff" : g.color;
        ctx.shadowBlur = 15; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.5, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();
        ctx.restore();
    });
}