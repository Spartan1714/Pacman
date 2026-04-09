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
    let nuevoMapa = Array.from({ length: height }, () => 
        Array.from({ length: width }, () => 1)
    );

    function shuffle(arr) {
        return arr.sort(() => Math.random() - 0.5);
    }

    // Algoritmo de excavación (Backtracking)
    function carve(x, y) {
        const dirs = shuffle([[1, 0], [-1, 0], [0, 1], [0, -1]]);

        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            // Mantenerse dentro de los bordes (dejando espacio para el muro exterior)
            if (ny > 0 && ny < height - 1 && nx > 0 && nx < width - 1) {
                if (nuevoMapa[ny][nx] === 1) {
                    // Quitamos el muro intermedio y el destino
                    nuevoMapa[y + dy][x + dx] = 2; 
                    nuevoMapa[ny][nx] = 2;
                    carve(nx, ny);
                }
            }
        }
    }

    // 2. Empezar a excavar desde una posición impar para mantener la rejilla
    carve(1, 1);

    // 3. 🔥 CONEXIONES EXTRA (Solo pasillos, no hoyos)
    // En lugar de romper muros al azar, solo rompemos algunos muros específicos
    // para crear "ciclos" (caminos alternativos) y que no sea un solo camino largo.
    for (let i = 0; i < 6; i++) { // Intentar 6 conexiones extra
        let rx = Math.floor(Math.random() * (width - 2)) + 1;
        let ry = Math.floor(Math.random() * (height - 2)) + 1;
        if (nuevoMapa[ry][rx] === 1) {
            nuevoMapa[ry][rx] = 2; // Convertimos un muro solitario en pasillo
        }
    }

    // 4. ASEGURAR BORDES (Marco del juego)
    for (let i = 0; i < width; i++) {
        nuevoMapa[0][i] = 1;
        nuevoMapa[height - 1][i] = 1;
    }
    for (let i = 0; i < height; i++) {
        nuevoMapa[i][0] = 1;
        nuevoMapa[i][width - 1] = 1;
    }

    // 5. ZONA DE SPAWN (Pacman necesita espacio al arrancar)
    nuevoMapa[1][1] = 2;
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // 6. Actualizar referencia global
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
}