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

// inicializar mapa
map = JSON.parse(JSON.stringify(baseMap));

export function spawnCherry(level) {
    // limpiar cerezas anteriores
    map.forEach((row, y) =>
        row.forEach((c, x) => {
            if (c === 3) map[y][x] = 2;
        })
    );

    let emptyCells = [];

    map.forEach((row, y) =>
        row.forEach((c, x) => {
            if (c === 2) emptyCells.push({ x, y });
        })
    );

    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3;
    }
}

export function resetMap() {
    map.length = 0;
    baseMap.forEach(row => map.push([...row]));
}

// 🔥 GENERADOR DE MAPAS RANDOM (CORREGIDO)
export function generarMapaRandom() {
    const width = 20;
    const height = 10;

    let nuevoMapa = [];

    for (let y = 0; y < height; y++) {
        let row = [];

        for (let x = 0; x < width; x++) {

            // bordes siempre muro
            if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
                row.push(1);
            } 
            else {
                // 🔥 random real (30% muros)
                let wall = Math.random() < 0.3 ? 1 : 2;
                row.push(wall);
            }
        }

        nuevoMapa.push(row);
    }

    // 🔥 asegurar spawn libre
    nuevoMapa[1][1] = 2;

    // 🔥 limpiar alrededor del spawn
    nuevoMapa[1][2] = 2;
    nuevoMapa[2][1] = 2;

    // 🔥 aplicar al mapa real (IMPORTANTE)
    map.length = 0;
    nuevoMapa.forEach(row => map.push([...row]));
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

    // 🔥 CLAVE: NO reemplazar, sino actualizar el array existente
    map.length = 0;
nuevoMapa.forEach(row => map.push([...row]));}