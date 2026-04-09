export const TILE_SIZE = 30;
export let map = [];

const baseMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,2,2,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,2,1,1,1,2,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,1,2,2,1,2,2,1,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// Inicialización inicial
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
    // Limpiar 3 antiguos
    map.forEach((row, y) => row.forEach((c, x) => { if (c === 3) map[y][x] = 2; }));

    let emptyCells = [];
    map.forEach((row, y) => row.forEach((c, x) => { if (c === 2) emptyCells.push({ x, y }); }));

    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3;
        window.currentCherry = { x: pos.x, y: pos.y };
    }
}

export function resetMap() {
    map.length = 0;
    baseMap.forEach(row => map.push([...row]));
}

export function generarMapaRandom() {
    const width = 20;
    const height = 10;

    // 1. Llenar todo de muros (1)
    let nuevoMapa = Array.from({ length: height }, () => Array.from({ length: width }, () => 1));

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5); }

    function carve(x, y) {
        const dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);
        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            // Mantenerse dentro de los bordes (índices 1 a width-2)
            if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1) {
                if (nuevoMapa[ny][nx] === 1) {
                    nuevoMapa[y + dy][x + dx] = 2; // Camino
                    nuevoMapa[ny][nx] = 2;         // Camino
                    carve(nx, ny);
                }
            }
        }
    }

    // 2. Empezar laberinto
    carve(1, 1);

    // 3. 🔥 SOLUCIÓN AL BUG: Abrir caminos extra SIN tocar los bordes
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            // Si es un muro interno, probabilidad de convertirlo en camino
            if (nuevoMapa[y][x] === 1 && Math.random() < 0.2) {
                nuevoMapa[y][x] = 2;
            }
        }
    }

    // 4. Asegurar bordes exteriores (Muros indestructibles)
    for (let i = 0; i < width; i++) {
        nuevoMapa[0][i] = 1;
        nuevoMapa[height - 1][i] = 1;
    }
    for (let i = 0; i < height; i++) {
        nuevoMapa[i][0] = 1;
        nuevoMapa[i][width - 1] = 1;
    }

    // 5. Spawn seguro para Pacman
    nuevoMapa[1][1] = 2;
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // 6. Actualizar la referencia global
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
}