export let map = [];

export function generateMaze(cols = 15, rows = 15) {
    // 1. Crear rejilla llena de paredes
    let newMap = Array.from({ length: rows }, () => Array(cols).fill(1));

    function carve(x, y) {
        newMap[y][x] = 0;
        const dirs = [[0, 2], [0, -2], [2, 0], [-2, 0]].sort(() => Math.random() - 0.5);
        for (let [dx, dy] of dirs) {
            let nx = x + dx, ny = y + dy;
            if (ny > 0 && ny < rows - 1 && nx > 0 && nx < cols - 1 && newMap[ny][nx] === 1) {
                newMap[y + dy / 2][x + dx / 2] = 0;
                carve(nx, ny);
            }
        }
    }

    carve(1, 1);
    
    // Rellenar con puntos (2) y un Berserker (3)
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (newMap[y][x] === 0) newMap[y][x] = 2;
        }
    }
    
    newMap[1][1] = 0; // Inicio Pacman
    newMap[rows - 2][cols - 2] = 3; // Berserker en la otra esquina

    map.length = 0;
    newMap.forEach(row => map.push(row));
}

generateMaze(15, 15);