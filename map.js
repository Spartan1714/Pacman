// --- map.js ---
export const TILE_SIZE = 30;
export let map = [];

// 1. DEFINICIÓN DE MAPAS ARCADE (Basados en bloques rectangulares y simetría)
// 1 = Muro (Cian), 2 = Punto (Fucsia), 0 = Vacío

const mapaArcade1 = [
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

const mapaArcade2 = [
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

const mapaArcade3 = [
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

const coleccionMapas = [mapaArcade1, mapaArcade2, mapaArcade3];

// Inicializar con el primer diseño
map = JSON.parse(JSON.stringify(mapaArcade1));

// 2. LÓGICA DE CEREZAS (Integrada con window.currentCherry)
export function spawnCherry(level) {
    // Primero limpiamos cualquier cereza previa (valor 3) y la volvemos punto (2)
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 3) map[y][x] = 2;
        });
    });

    // Buscamos todas las celdas que tengan puntos (camino libre)
    let emptyCells = [];
    map.forEach((row, y) => {
        row.forEach((tile, x) => {
            if (tile === 2) emptyCells.push({ x, y });
        });
    });

    if (emptyCells.length > 0) {
        // Elegimos una posición al azar
        const pos = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        
        // Marcamos el 3 en el mapa para que sea visible
        map[pos.y][pos.x] = 3; 
        
        // Sincronizamos con la variable global de game.js para la colisión
        window.currentCherry = { x: pos.x, y: pos.y };
        console.log("🍒 Cereza colocada en:", window.currentCherry);
    }
}

export function resetMap() {
    map.length = 0;
    mapaArcade1.forEach(row => map.push([...row]));
}

// 3. CAMBIO DE NIVEL (Selecciona un mapa arcade de la lista)
export function generarMapaRandom() {
    let mapaElegido;
    
    // Evitamos repetir el mismo mapa que ya tenemos
    do {
        mapaElegido = coleccionMapas[Math.floor(Math.random() * coleccionMapas.length)];
    } while (coleccionMapas.length > 1 && JSON.stringify(mapaElegido) === JSON.stringify(map));

    // Actualizamos la variable exportada sin romper la referencia
    map.length = 0;
    mapaElegido.forEach(row => map.push([...row]));
}