// --- map.js ---
export const TILE_SIZE = 30;
export let map = [];

// 1. DEFINICIÓN DE MAPAS CON ESTÉTICA ARCADE (SIMÉTRICOS Y CON BLOQUES)
// 1 = Muro, 2 = Punto, 0 = Pasillo vacío

const mapa1 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,1,1,2,1,1,2,2,2,2,1,1,2,1,1,2,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const mapa2 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,1,2,2,2,1],
    [1,1,2,1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,2,1],
    [1,1,2,2,2,1,1,2,2,2,2,1,2,2,1,1,2,2,2,1],
    [1,2,2,1,2,2,2,2,1,1,2,2,2,1,2,2,2,1,2,1],
    [1,2,1,1,1,1,2,1,1,1,1,2,1,1,1,1,1,1,2,1],
    [1,2,2,1,2,2,2,2,1,1,2,2,2,1,2,2,2,1,2,1],
    [1,1,2,2,2,1,1,2,2,2,2,1,2,2,1,1,2,2,2,1],
    [1,1,2,1,2,1,1,2,2,2,2,1,2,1,1,1,2,1,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const mapa3 = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,2,1,1,2,1,1,2,1,1,1,2,1],
    [1,2,1,1,1,2,1,1,2,2,2,2,1,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,1,1,1,1,1,1,1,1,2,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,1,1,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const coleccionMapas = [mapa1, mapa2, mapa3];

// Inicialización con el primer mapa
map = JSON.parse(JSON.stringify(mapa1));

// 2. LÓGICA DE CEREZAS (Se mantiene intacta)
export function spawnCherry(level) {
    // Limpiar 3 antiguos y convertirlos a puntos
    map.forEach((row, y) => row.forEach((c, x) => { 
        if (c === 3) map[y][x] = 2; 
    }));

    let emptyCells = [];
    map.forEach((row, y) => row.forEach((c, x) => { 
        if (c === 2) emptyCells.push({ x, y }); 
    }));

    if (emptyCells.length > 0) {
        let pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        map[pos.y][pos.x] = 3; // Marcamos la cereza en el mapa
        window.currentCherry = { x: pos.x, y: pos.y }; // Referencia para colisión en game.js
    }
}

export function resetMap() {
    map.length = 0;
    mapa1.forEach(row => map.push([...row]));
}

// 3. SELECCIÓN DE MAPA ARCADE (Cambia la forma del laberinto)
export function generarMapaRandom() {
    // Elegimos un mapa de la colección al azar que no sea igual al actual
    let mapaElegido;
    do {
        mapaElegido = coleccionMapas[Math.floor(Math.random() * coleccionMapas.length)];
    } while (coleccionMapas.length > 1 && JSON.stringify(mapaElegido) === JSON.stringify(map));

    // Actualizamos la referencia global 'map' sin romperla
    map.length = 0;
    mapaElegido.forEach(row => map.push([...row]));
}