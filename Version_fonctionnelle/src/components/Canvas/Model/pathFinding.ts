import * as conf from './../config';
import { Point, OurModel, Circle } from './model';

const cellSize = conf.CELLSIZE;

export type GridCell = {
    x: number;
    y: number;
    center : Point; // Centre de la cellule utile pour les calculs de distance
    walkable: boolean; //permet de savoir si la cellule contient un fragment de l'obstacle
    cost: number; // Coût pour atteindre cette cellule
    distToEnd : number;
    f : number; //cost + distToEnd
    parent?: GridCell; // Cellule parent dans le chemin
}


/*******************************************
 * Fonctions pour la création de la grille
*******************************************/

// Fonctions de débuggage pour afficher la grille
const printGrid = (grid: GridCell[][]) => {
    const gridRepresentation = grid.map(row =>
        row.map(cell => 
            (cell.x === 0 && cell.y === 0) ? '1 ' :
            (cell.x === grid[0].length - 1 && cell.y === grid.length - 1) ? '2 ' :
            (cell.x === 0 && cell.y === grid.length - 1) ? '3 ' :
            (cell.x === grid[0].length - 1 && cell.y === 0) ? '4 ' :
            cell.walkable ? '_ ' : 'X '
        ).join('')
    ).join('\n');
    console.log(gridRepresentation);
}
// Crée une grille basée sur les dimensions du canvas et la taille des obstacles
export const createGrid = (model: OurModel): GridCell[][] => {
    const grid: GridCell[][] = [];
    for (let y = 0; y < model.canvasheight; y += cellSize) {
        const row: GridCell[] = [];
        for (let x = 0; x < model.canvaswidth; x += cellSize) {
            row.push({
                x: Math.floor(x / cellSize),
                y: Math.floor(y / cellSize),
                center: { x: x + cellSize / 2, y: y + cellSize / 2 },
                walkable: true,  // Default is walkable unless specified by obstacles
                cost : Infinity,
                distToEnd : Infinity,
                f : Infinity,
            });
            //console.log('Création de la cellule à', x, y, 'avec x et y', Math.floor(x / cellSize), Math.floor(y / cellSize));
        }
        grid.push(row);
    }

    
    // Appliquer les obstacles rectangulaires à la grille
    model.rectangles.forEach(rect => {
        const triangleSize = conf.TRIANGLESIZE;
        
        //On prend en compte la taille des triangles pour les obstacles pour évité les collisions avec les angles des triangles
        const startX = (rect.x- triangleSize) <= 0 ? Math.floor(rect.x / cellSize): Math.floor((rect.x- triangleSize)  / cellSize);
        const endX =  (rect.x + rect.width + triangleSize) >= model.canvaswidth ? Math.ceil((rect.x + rect.width) / cellSize): Math.ceil((rect.x + rect.width + triangleSize) / cellSize);
        const startY = (rect.y - triangleSize) <= 0 ? Math.floor(rect.y / cellSize) : Math.floor((rect.y - triangleSize) / cellSize);
        const endY = (rect.y + rect.height + triangleSize) >= model.canvasheight ?  Math.ceil((rect.y + rect.height) / cellSize) : Math.ceil((rect.y + rect.height + triangleSize) / cellSize);

        for (let y = startY; y < endY; y++) {
            for (let x = startX; x < endX; x++) {
                if (y < grid.length && y < grid[y].length) {
                    grid[y][x].walkable = false;
                }
            }
        }
    });

    //console.log(grid.map(row => row.map(cell => cell.walkable ? ' ' : 'X').join('')).join('\n'));
    printGrid(grid);
    return grid;
}

const cloneGrid = (originalGrid: GridCell[][]): GridCell[][] => {
    return originalGrid.map(row => row.map(cell => ({
        ...cell,
        cost: Infinity,
        distToEnd: Infinity,
        f: Infinity,
        parent: undefined,
        isDiagonal: false
    })));
};

/*************************************************
 * Fonctions pour l'algorithme A* de pathfinding
*************************************************/
// Fonction pour convertir un point en coordonnées de cellule de grille
const getCellFromPoint = (point: Point, grid: GridCell[][]): GridCell | null => {
    const xIndex = Math.floor(point.x / cellSize);
    const yIndex = Math.floor(point.y / cellSize);
    if (xIndex >= 0 && xIndex < grid[0].length && yIndex >= 0 && yIndex < grid.length) {
        return grid[yIndex][xIndex];
    }
    return null; // Retourne null si le point est hors des limites de la grille
}
// Fonction pour obtenir le point correspondant à une cellule de grille
const getPointFromCell = (cell: GridCell): Point => {
    // Calculer le centre de la cellule en ajoutant la moitié de la taille de la cellule aux coordonnées multipliées par la taille de la cellule
    return { 
        x: cell.x * cellSize , 
        y: cell.y * cellSize  
    };
}
// Reconstruire le chemin à partir de la cellule de fin jusqu'à la cellule de départ
const reconstructPath = (endCell: GridCell, end: Point): Point[] => {
    let current = endCell;
    const path: Point[] = [];  
    //const path: Point[] = [end];  // Commence avec la position finale réelle
    const visited = new Set();
    let lastDirection = null;

    // Ajouter une fonction pour obtenir la direction entre deux cellules
    const getDirection = (current : GridCell, parent : GridCell) => {
        if (current.x === parent.x) return 'vertical';
        if (current.y === parent.y) return 'horizontal';
    }

    while (current.parent) {
        if (visited.has(current)) {
            console.log('Boucle détectée dans la reconstruction du chemin');
            break;
        }
        visited.add(current);

        const direction = getDirection(current, current.parent);

        // Ajouter la cellule au chemin seulement si la direction change
        if (direction !== lastDirection) {
            const dest = current.center;
            path.unshift(dest);  // Ajouter la position courante au début du chemin
        }

        lastDirection = direction;  // Mise à jour de la dernière direction
        current = current.parent;  // Remonter vers la cellule parent
    }

    // S'assurer d'ajouter la position de départ
    if (path[0] !== current.center) {
        path.unshift(current.center);
    }

    return path;
}


const getNeighbors = (current: GridCell, grid: GridCell[][]): GridCell[] => {
    const neighbors: GridCell[] = [];
    const directions = [
        { dx: 1, dy: 0 },  // right
        { dx: -1, dy: 0 }, // left
        { dx: 0, dy: 1 },  // down
        { dx: 0, dy: -1 },  // up
        { dx: 1, dy: 1 },  // down-right
        { dx: -1, dy: 1 }, // down-left
        { dx: 1, dy: -1 }, // up-right
        { dx: -1, dy: -1 } // up-left
    ];

    directions.forEach(dir => {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if ((nx !== current.x || ny !== current.y) && nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length) {
            neighbors.push(grid[ny][nx]);
        }
    });

    //console.log(`Neighbors for (${current.x}, ${current.y}): ${neighbors.map(n => `(${n.x}, ${n.y})`).join(', ')}`);
    return neighbors;
}


// Implémentation de l'algorithme de recherche de chemin (A*)
export const findPath = (originalGrid : GridCell[][], start: Point, end: Point, circlesOfSameColor : Circle[]): Point[] => {
    // Vérifier si les coordonnées de départ ou de fin sont en dehors des limites de la grille
    let grid = cloneGrid(originalGrid);

    // Appliquer les planètes de la même couleur que les triangles comme obstacle à la grille
    circlesOfSameColor.forEach(circle => { 
        const startX = Math.floor((circle.center.x - circle.radius) / cellSize);
        const endX = Math.ceil((circle.center.x + circle.radius) / cellSize);
        const startY = Math.floor((circle.center.y - circle.radius) / cellSize);
        const endY = Math.ceil((circle.center.y + circle.radius) / cellSize);

        for (let y = startY; y <= endY; y++) {
            for (let x = startX; x <= endX; x++) {
                if (y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) {
                    const cellCenterX = x * cellSize + cellSize / 2;
                    const cellCenterY = y * cellSize + cellSize / 2;
                    const distance = Math.sqrt((cellCenterX - circle.center.x) ** 2 + (cellCenterY - circle.center.y) ** 2);
                    if (distance < circle.radius + (Math.sqrt(2) * cellSize / 2)) {  // Vérifier si la cellule touche le cercle
                        grid[y][x].walkable = false;
                    }
                }
            }
        }
    });
    //printGrid(grid);
    const startCell = getCellFromPoint(start, grid);
    const endCell = getCellFromPoint(end, grid);

    //console.log('Start Cell:', startCell);
    //console.log('End Cell:', endCell);

    if (!startCell || !endCell || !startCell.walkable || !endCell.walkable) {
        console.log('Les points de départ ou d\'arrivée ne sont pas valides ou ne sont pas traversables.');
        return [];
    }

    let openSet = [startCell];
    let closedSet = new Set<GridCell>();

    //startCell.walkable = true; // Marquer la cellule de départ comme traversable
    startCell.cost = 0; // Définir le coût initial de la cellule de départ à 0

    while (openSet.length > 0) {
        let current = openSet.reduce((lowest, cell) => (lowest.cost < cell.cost ? lowest : cell), openSet[0]);
        openSet = openSet.filter(cell => cell !== current);
        closedSet.add(current);

        if (current === endCell) {
            return reconstructPath(endCell, end);
        }

        let neighbors = getNeighbors(current, grid);
        neighbors.forEach(neighbor => {
            if (!neighbor.walkable || closedSet.has(neighbor)) return;
            const isDiagPossible = (grid[neighbor.y ][current.x].walkable && grid[current.y][neighbor.x].walkable);
            let tempCost = ((neighbor.x !== current.x && neighbor.y !== current.y) && (isDiagPossible)) ? current.cost +1.414 : current.cost +1;
            if (tempCost < neighbor.cost) {
                neighbor.cost = tempCost;
                neighbor.parent = current;
                if (!openSet.includes(neighbor)) openSet.push(neighbor);
            }
        });
    }

    console.log('No path found after loop.');
    return []; // Aucun chemin trouvé si la boucle se termine sans retourner de chemin
}