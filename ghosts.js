// ... (imports y demas igual)

export function updateGhosts(lives, score) {
    if (powerMode) {
        powerTimer--;
        if (powerTimer <= 0) powerMode = false;
    }

    ghosts.forEach(g => {
        if (g.dead) return;

        // Movimiento de fantasmas (mantenemos tu logica fluida)
        if (Math.abs(g.x - g.vX) < 0.1 && Math.abs(g.y - g.vY) < 0.1) {
            g.vX = g.x; g.vY = g.y;
            let moves = [{dx:1,dy:0},{dx:-1,dy:0},{dx:0,dy:1},{dx:0,dy:-1}].filter(m => 
                map[Math.round(g.y + m.dy)]?.[Math.round(g.x + m.dx)] !== 1
            );
            if (moves.length > 1) moves = moves.filter(m => m.dx !== -g.lastDx || m.dy !== -g.lastDy);
            let choice = (g.mode === "berserker" && !powerMode) ? 
                moves.sort((a,b) => Math.hypot(g.x+a.dx-pacman.x, g.y+a.dy-pacman.y) - Math.hypot(g.x+b.dx-pacman.x, g.y+b.dy-pacman.y))[0] :
                moves[Math.floor(Math.random() * moves.length)];
            
            if (choice) { g.x += choice.dx; g.y += choice.dy; g.lastDx = choice.dx; g.lastDy = choice.dy; }
        }
        
        g.vX += (g.x - g.vX) * (g.mode === "berserker" ? 0.1 : 0.08);
        g.vY += (g.y - g.vY) * (g.mode === "berserker" ? 0.1 : 0.08);

        // COLISIÓN: Distancia de 0.5 para que sea mas justo
        if (Math.hypot(g.vX - pacman.vX, g.vY - pacman.vY) < 0.5) {
            if (powerMode) {
                g.dead = true;
                score.value += 200;
            } else {
                lives.value--; // Resta UNA vida
                resetPlayer(); // Te manda al inicio del mapa para que no te maten otra vez ahí mismo
            }
        }
    });
}
// ... (drawGhosts y demas igual)