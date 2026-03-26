import { map } from "./map.js";
import { pacman, resetPlayer } from "./player.js";

export let ghosts = [];

export function spawnGhostsForLevel(level = 1) {
    ghosts.length = 0;
    const colors = ["#FF0000", "#FFB8FF", "#00FFFF", "#FFB852"];
    const num = Math.min(2 + level, colors.length);
    
    for (let i = 0; i < num; i++) {
        // Los ponemos un poco lejos de Pacman (en la coordenada 1, 3)
        ghosts.push({
            x: 1, y: 3, vX: 1, vY: 3,
            color: colors[i],
            speed: 0.07,
            dirX: 0, dirY: 0
        });
    }
}

export function updateGhosts(lives, level) {
    for (let g of ghosts) {
        // IA de movimiento fluido
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let dirs = [{dx: 1, dy: 0}, {dx: -1, dy: 0}, {dx: 0, dy: 1}, {dx: 0, dy: -1}]
                .filter(d => map[Math.round(g.y + d.dy)] && map[Math.round(g.y + d.dy)][Math.round(g.x + d.dx)] !== 1);

            if (dirs.length > 1) dirs = dirs.filter(d => d.dx !== -g.dirX || d.dy !== -g.dirY);
            let m = dirs[Math.floor(Math.random() * dirs.length)];
            if(m) { g.dirX = m.dx; g.dirY = m.dy; g.x += g.dirX; g.y += g.dy; }
        }
        // Deslizamiento
        if (g.vX < g.x) g.vX += g.speed; if (g.vX > g.x) g.vX -= g.speed;
        if (g.vY < g.y) g.vY += g.speed; if (g.vY > g.y) g.vY -= g.speed;

        // Colisión (Solo si están cerca visualmente)
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.5) {
            lives.value--;
            resetPlayer();
            spawnGhostsForLevel(level);
            return;
        }
    }
}

export function drawGhosts(ctx, tileSize, offsetX, offsetY) {
    for (let g of ghosts) {
        let x = offsetX + g.vX * tileSize;
        let y = offsetY + g.vY * tileSize;
        let s = tileSize;

        ctx.fillStyle = g.color;
        ctx.beginPath();
        // Cabeza
        ctx.arc(x + s/2, y + s/2.5, s * 0.4, Math.PI, 0);
        // Cuerpo con 3 Puntas rectangulares (Como en la foto)
        ctx.lineTo(x + s * 0.9, y + s * 0.9);
        ctx.lineTo(x + s * 0.75, y + s * 0.75);
        ctx.lineTo(x + s * 0.6, y + s * 0.9);
        ctx.lineTo(x + s * 0.5, y + s * 0.75);
        ctx.lineTo(x + s * 0.4, y + s * 0.9);
        ctx.lineTo(x + s * 0.25, y + s * 0.75);
        ctx.lineTo(x + s * 0.1, y + s * 0.9);
        ctx.lineTo(x + s * 0.1, y + s/2.5);
        ctx.fill();

        // Ojos: Blancos con pupilas azules fijas arriba
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.ellipse(x + s*0.35, y + s*0.4, s*0.1, s*0.13, 0, 0, Math.PI*2);
        ctx.ellipse(x + s*0.65, y + s*0.4, s*0.1, s*0.13, 0, 0, Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "blue";
        ctx.beginPath();
        ctx.arc(x + s*0.35, y + s*0.3, s*0.05, 0, Math.PI*2);
        ctx.arc(x + s*0.65, y + s*0.3, s*0.05, 0, Math.PI*2);
        ctx.fill();
    }
}