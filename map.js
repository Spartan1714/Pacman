export const TILE_SIZE = 20;
export let map = [];

export function generarMapaAleatorio() {
    const rows = 10;
    const cols = 20;
    map = [];
    
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            // Bordes siempre son muros (1)
            if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
                row.push(1);
            } else {
                // Generación aleatoria de muros (30% probabilidad)
                row.push(Math.random() < 0.3 ? 1 : 2); // 1: Muro, 2: Punto
            }
        }
        map.push(row);
    }
    // Asegurar que Pac-Man y los Fantasmas tengan espacio
    map[1][1] = 0; // Inicio Pac-Man
    map[4][9] = 0; // Casa Fantasmas
}   