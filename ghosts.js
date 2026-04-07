import { map, TILE_SIZE } from "./map.js";
import { pacman, resetPlayer } from "./player.js"; 

export let ghosts = [];
export let powerMode = false;
let powerTimer = 0;

export function activatePower() {
    powerMode = true;
    powerTimer = 450; 
}

export function allGhostsDead() {
    return ghosts.length > 0 && ghosts.every(g => g.dead);
}

export function spawnGhosts(level = 1) {
    const speed = 2.0 + (level * 0.2);
    // Posiciones iniciales exactas en el centro de las baldosas del mapa
    ghosts = [
        { x: 18, y: 1, dirX: -1, dirY: 0, color: "#FF0000", mode: "berserker", dead: false, speed: speed },
        { x: 1, y: 8, dirX: 1, dirY: 0, color: "#FFB8FF", mode: "random", dead: false, speed: speed },
        { x: 18, y: 8, dirX: -1, dirY: 0, color: "#00FFFF", mode: "random", dead: false, speed: speed }
    ];
}

export function updateGhosts(lives, score, dt) {
    if (!dt || ghosts.length === 0) return;

    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        let speed = powerMode ? g.speed * 0.5 : g.speed;

        // 1. ELIMINAR DERIVA: Forzar al fantasma al carril
        if (g.dirX !== 0) g.y = Math.round(g.y);
        if (g.dirY !== 0) g.x = Math.round(g.x);

        // 2. CALCULAR SIGUIENTE POSICIÓN
        let nextX = g.x + g.dirX * speed * dt;
        let nextY = g.y + g.dirY * speed * dt;

        // 3. DETECTAR CENTRO DE BALDOSA (Punto de decisión)
        let gx = Math.round(g.x);
        let gy = Math.round(g.y);
        
        // Si estamos llegando al centro de la baldosa, decidimos qué hacer
        if (Math.hypot(g.x - gx, g.y - gy) < 0.1) {
            // ¿Hay un muro justo enfrente?
            let wallAhead = map[Math.round(gy + g.dirY)]?.[Math.round(gx + g.dirX)] === 1;

            if (wallAhead || esInterseccion(gx, gy)) {
                // Hacemos un "Snap" al centro para que el giro sea perfecto
                g.x = gx;
                g.y = gy;
                buscarNuevaDireccion(g);
            }
        }

        // 4. APLICAR MOVIMIENTO FINAL
        g.x += g.dirX * speed * dt;
        g.y += g.dirY * speed * dt;

        // 5. COLISIÓN CON PACMAN (Ajustada para ser justa)
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

function esInterseccion(x, y) {
    let pasillos = 0;
    if (map[y]?.[x + 1] !== 1) pasillos++;
    if (map[y]?.[x - 1] !== 1) pasillos++;
    if (map[y + 1]?.[x] !== 1) pasillos++;
    if (map[y - 1]?.[x] !== 1) pasillos++;
    return pasillos > 2;
}

function buscarNuevaDireccion(g) {
    let gx = Math.round(g.x);
    let gy = Math.round(g.y);

    let opciones = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ].filter(o => {
        // No puede ser muro ni la dirección de la que viene (para que no vibre)
        return map[gy + o.dy]?.[gx + o.dx] !== 1 && (o.dx !== -g.dirX || o.dy !== -g.dirY);
    });

    if (opciones.length === 0) {
        // Si es un callejón, media vuelta obligatoria
        g.dirX *= -1;
        g.dirY *= -1;
    } else {
        if (g.mode === "berserker" && !powerMode) {
            // IA Rojo: Ordenar opciones por distancia a Pacman
            opciones.sort((a, b) => 
                Math.hypot((gx + a.dx) - pacman.x, (gy + a.dy) - pacman.y) - 
                Math.hypot((gx + b.dx) - pacman.x, (gy + b.dy) - pacman.y)
            );
            g.dirX = opciones[0].dx;
            g.dirY = opciones[0].dy;
        } else {
            // IA Resto: Elección aleatoria
            let sel = opciones[Math.floor(Math.random() * opciones.length)];
            g.dirX = sel.dx;
            g.dirY = sel.dy;
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

        // Cuerpo clásico neón
        ctx.beginPath();
        ctx.arc(x + s/2, y + s/2, s/2.2, Math.PI, 0);
        ctx.lineTo(x + s*0.8, y + s*0.9);
        ctx.lineTo(x + s*0.2, y + s*0.9);
        ctx.fill();

        // Ojos
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.45, s*0.12, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
    });
}