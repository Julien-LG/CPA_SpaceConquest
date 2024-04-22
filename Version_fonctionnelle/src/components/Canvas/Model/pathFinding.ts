import * as conf from './../config';
import { Point, OurModel } from './model';
import { calculateDistance } from './ia'; // Assume this function is exported from ai.ts

export type GridCell = {
    x: number;
    y: number;
    walkable: boolean;
    cost?: number; // Coût pour atteindre cette cellule
    parent?: GridCell; // Cellule parent dans le chemin
    f?: number; // Score F de l'A*
    g?: number; // Coût depuis le début (G)
    h?: number; // Coût estimé jusqu'à l'arrivée (H)
}

// Crée une grille basée sur les dimensions du canvas et la taille des obstacles
export const createGrid = (model: OurModel, cellSize: number): GridCell[][] => {
    const grid : GridCell[][] = [];
    for (let x = 0; x < model.canvaswidth; x += cellSize) {
        const row : GridCell [] = [];
        for (let y = 0; y < model.canvasheight; y += cellSize) {
            row.push({ x, y, walkable: true });
        }
        grid.push(row);
    }

    // Marquer les cellules comme non traversables où il y a des obstacles
    // model.circles.forEach(circle => {
    //     if (circle.color !== conf.UNHABITEDPLANETCOLOR) {
    //         const centerX = circle.center.x;
    //         const centerY = circle.center.y;
    //         const radiusSquared = circle.radius ** 2; // Précalcul du carré du rayon pour la comparaison

    //         const startX = Math.max(0, Math.floor((centerX - circle.radius) / cellSize));
    //         const endX = Math.min(grid.length, Math.ceil((centerX + circle.radius) / cellSize));
    //         const startY = Math.max(0, Math.floor((centerY - circle.radius) / cellSize));
    //         const endY = Math.min(grid[0].length, Math.ceil((centerY + circle.radius) / cellSize));

    //         for (let x = startX; x < endX; x++) {
    //             for (let y = startY; y < endY; y++) {
    //                 const cellCenterX = x * cellSize + cellSize / 2;
    //                 const cellCenterY = y * cellSize + cellSize / 2;
    //                 if (calculateDistance(cellCenterX, cellCenterY, centerX, centerY) < radiusSquared) {
    //                     grid[x][y].walkable = false;
    //                 }
    //             }
    //         }
    //     }
    // });

    model.rectangles.forEach(rect => {
        const startX = Math.floor(rect.x / cellSize);
        const endX = Math.ceil((rect.x + rect.width) / cellSize);
        const startY = Math.floor(rect.y / cellSize);
        const endY = Math.ceil((rect.y + rect.height) / cellSize);

        for (let x = startX; x < endX; x++) {
            for (let y = startY; y < endY; y++) {
                grid[x][y].walkable = false;
            }
        }
    });

    return grid;
}

// Fonction heuristique estimant le coût d'un nœud à la fin (utilisant la distance euclidienne pour les mouvements diagonaux)
function calculateHeuristic(a: GridCell, b: GridCell): number {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    return dx + dy; // Utilisation de la distance de Manhattan
}

// Reconstruire le chemin à partir de la cellule de fin jusqu'à la cellule de départ
function reconstructPath(endCell: GridCell): Point[] {
    let current = endCell;
    const path: Point[] = [];
    while (current.parent) {
        path.unshift({ x: current.x, y: current.y }); // Ajoute la position courante au début du chemin
        current = current.parent; // Remonte vers la cellule parent
    }
    path.unshift({ x: current.x, y: current.y }); // Ajoute la position de départ
    return path;
}

// Fonction pour récupérer un voisin s'il est dans les limites de la grille
function getNeighbor(grid: GridCell[][], x: number, y: number): GridCell | null {
    if (x >= 0 && x < grid.length && y >= 0 && y < grid[0].length) {
        return grid[x][y];
    }
    return null; // Retourne null si hors des limites
}

function getNeighbors(cell: GridCell, grid: GridCell[][]): GridCell[] {
    const neighbors: GridCell[] = [];
    const dirs = [
        { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
        { x: 1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: 1 }, { x: -1, y: -1 }
    ];

    dirs.forEach(dir => {
        const neighbor = getNeighbor(grid, cell.x + dir.x, cell.y + dir.y);
        if (neighbor && neighbor.walkable) {
            if (dir.x !== 0 && dir.y !== 0) { // Diagonal
                const beside1 = getNeighbor(grid, cell.x + dir.x, cell.y);
                const beside2 = getNeighbor(grid, cell.x, cell.y + dir.y);
                if (beside1 && beside1.walkable && beside2 && beside2.walkable) {
                    neighbors.push(neighbor);
                }
            } else {
                neighbors.push(neighbor);
            }
        }
    });

    return neighbors;
}


// Implémentation de l'algorithme de pathfinding (A*)
function findPath(start: Point, end: Point, grid: GridCell[][]): Point[] {
    const startXIndex = Math.floor(start.x / 20);
    const startYIndex = Math.floor(start.y / 20);
    const endXIndex = Math.floor(end.x / 20);
    const endYIndex = Math.floor(end.y / 20);

    // Check if start or end indices are out of bounds
    if (startXIndex < 0 || startYIndex < 0 || endXIndex < 0 || endYIndex < 0 ||
        startXIndex >= grid.length || startYIndex >= grid[0].length ||
        endXIndex >= grid.length || endYIndex >= grid[0].length) {
        return []; // Return an empty path if out of bounds
    }

    const startCell = grid[startXIndex][startYIndex];
    const endCell = grid[endXIndex][endYIndex];

    if (!startCell.walkable || !endCell.walkable) {
        return []; // If start or end is not walkable, return empty path
    }

    const openSet: GridCell[] = [startCell];
    const closedSet: Set<GridCell> = new Set();

    startCell.g = 0;
    startCell.h = calculateHeuristic(startCell, endCell);
    startCell.f = startCell.g + startCell.h;

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f! - b.f!);
        let current = openSet.shift()!;

        if (current === endCell) {
            return reconstructPath(endCell);
        }

        closedSet.add(current);

        getNeighbors(current, grid).forEach(neighbor => {
            if (!closedSet.has(neighbor) && neighbor.walkable) {
                let tentativeGScore = current.g! + calculateHeuristic(current, neighbor);

                if (!openSet.includes(neighbor)) {
                    openSet.push(neighbor);
                } else if (tentativeGScore >= neighbor.g!) {
                    return; // Ce n'est pas un meilleur chemin
                }

                // on sauvegarde le chemin
                neighbor.parent = current;
                neighbor.g = tentativeGScore;
                neighbor.h = calculateHeuristic(neighbor, endCell);
                neighbor.f = neighbor.g + neighbor.h;
            }
        });
    }
    console.log('No path found');
    return []; // Pas de chemin trouvé
}

// Fonction principale pour rechercher un chemin pour chaque triangle de la couleur donnée en évitant les obstacles (murs et planètes)
export const pathfinding = (model: OurModel, destination : Point, color : string): OurModel => {
    const grid = model.grid;
    const newTriangles = model.triangles.map(triangle => {
        if (!triangle.destination && triangle.color === color) {
            const newPath = findPath(triangle.center, destination, grid);
            if (newPath.length === 0) {
                console.log('No new path found');
            }
            return {
                points: triangle.points,
                size: triangle.size,
                center: triangle.center,
                color: triangle.color,
                selected: triangle.selected,
                destination: triangle.destination,
                path : newPath
            }
        }
        return triangle;
    });
    return {
        triangles: newTriangles,
        circles: model.circles,
        rectangles: model.rectangles,
        canvasheight: model.canvasheight,
        canvaswidth: model.canvaswidth,
        startSelec: model.startSelec,
        endSelec: model.endSelec,
        events: model.events,
        grid: model.grid
    }
};
