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

// Inicializar mapa
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
    // limpiar cerezas viejas
    map.forEach((row, y) => 
        row.forEach((c, x) => { 
            if (c === 3) map[y][x] = 2; 
        })
    );

    let emptyCells = [];

    map.forEach((row, y) => 
        row.forEach((c, x) => { 
            if (c === 2) emptyCells.push({x, y}); 
        })
    );
    
    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3;
    }
}

export function resetMap() {
    map = JSON.parse(JSON.stringify(baseMap));
}

// 🔥 GENERADOR DE MAPAS RANDOM
export function generarMapaRandom() {
    const width = 20;
    const height = 10;

    let nuevoMapa = Array.from({ length: height }, () =>
        Array.from({ length: width }, () => 1)
    );

    function carve(x, y) {
        const dirs = [
            [1,0], [-1,0], [0,1], [0,-1]
        ].sort(() => Math.random() - 0.5);

        for (let [dx, dy] of dirs) {
            let nx = x + dx * 2;
            let ny = y + dy * 2;

            if (
                ny > 0 && ny < height - 1 &&
                nx > 0 && nx < width - 1 &&
                nuevoMapa[ny][nx] === 1
            ) {
                nuevoMapa[y + dy][x + dx] = 2;
                nuevoMapa[ny][nx] = 2;
                carve(nx, ny);
            }
        }
    }

    // punto inicial (spawn seguro)
    nuevoMapa[1][1] = 2;
    carve(1, 1);

    // bordes cerrados
    for (let x = 0; x < width; x++) {
        nuevoMapa[0][x] = 1;
        nuevoMapa[height - 1][x] = 1;
    }

    for (let y = 0; y < height; y++) {
        nuevoMapa[y][0] = 1;
        nuevoMapa[y][width - 1] = 1;
    }

    // asegurar spawn libre
    nuevoMapa[1][1] = 2;

    map = nuevoMapa;
}