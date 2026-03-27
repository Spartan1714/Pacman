export const TILE_SIZE = 25;
export let map = [];

export function generarMapaAleatorio() {
    const rows = 15;
    const cols = 20;
    map = [];
    for (let y = 0; y < rows; y++) {
        let row = [];
        for (let x = 0; x < cols; x++) {
            // Bordes siempre muros
            if (y === 0 || y === rows - 1 || x === 0 || x === cols - 1) {
                row.push(1);
            } else {
                // 25% de muros, el resto puntos
                row.push(Math.random() < 0.25 ? 1 : 2);
            }
        }
        map.push(row);
    }
    // Espacio libre para inicio
    map[1][1] = 0; 
    map[7][9] = 0; // Centro
    map[7][10] = 0;
}