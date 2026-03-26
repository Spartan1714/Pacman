export const TILE_SIZE = 30; // Tamaño fijo para que se vea bien
export let map = [];

export function generateLevel() {
    const rows = 11;
    const cols = 20;
    // Crear borde sólido (tu diseño)
    let newMap = Array.from({ length: rows }, (_, y) => 
        Array.from({ length: cols }, (_, x) => 
            (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) ? 1 : 2
        )
    );

    // Añadir bloques aleatorios internos (muros tipo caja azul)
    for (let i = 0; i < 25; i++) {
        let rx = Math.floor(Math.random() * (cols - 2)) + 1;
        let ry = Math.floor(Math.random() * (rows - 2)) + 1;
        if ((rx !== 1 || ry !== 1) && (rx !== cols - 2 || ry !== rows - 2)) {
            newMap[ry][rx] = 1;
        }
    }
    
    // Punto de poder (Berserker Item) en posición random
    newMap[rows - 2][cols - 2] = 3; 

    map.length = 0;
    newMap.forEach(r => map.push(r));
}