import { Triangle, Circle, Rectangle, Point } from './model';
type Line = { x1: number, y1: number, x2: number, y2: number };
/*******************************************************************
     * Fonctions de collision
*******************************************************************/
const segmentIntersectsCircle = (start : Point, end : Point , circle : Circle) => {
    const d = { x: end.x - start.x, y: end.y - start.y };
    const f = { x: start.x - circle.center.x, y: start.y - circle.center.y };

    const a = d.x * d.x + d.y * d.y;
    const b = 2 * (f.x * d.x + f.y * d.y);
    const c = (f.x * f.x + f.y * f.y) - circle.radius * circle.radius;

    const discriminant = b * b - 4 * a * c;
    if (discriminant < 0) {
        // Pas de collision
        return false;
    } else {
        // Vérifie si au moins un point d'intersection est sur le segment de ligne
        const t1 = (-b - Math.sqrt(discriminant)) / (2 * a);
        const t2 = (-b + Math.sqrt(discriminant)) / (2 * a);
        if ((t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1)) {
            return true; // Collision détectée
        }
        return false;
    }
}

// Fonctions auxiliaire de collision entre triangles 
const isPointInsideTriangle = (point : Point, triangle : Triangle) : boolean => {
    const {x: px, y: py} = point;
    const [v1, v2, v3] = triangle.points;

    const areaOrig = Math.abs((v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x));
    const area1 = Math.abs((v1.x - px) * (v2.y - py) - (v1.y - py) * (v2.x - px));
    const area2 = Math.abs((v2.x - px) * (v3.y - py) - (v2.y - py) * (v3.x - px));
    const area3 = Math.abs((v3.x - px) * (v1.y - py) - (v3.y - py) * (v1.x - px));

    return area1 + area2 + area3 === areaOrig;
}


/*******************************************************************
     * Fonctions de réaction lors d'une collision
*******************************************************************/
// Vérifie la collision entre un triangle et un cercle
export const checkCollisionWithCircle = (triangle : Triangle,circle : Circle) => {
    // Vérifie la collision entre chaque sommet du triangle et le cercle
    for (let point of triangle.points) {
        const dx = point.x - circle.center.x;
        const dy = point.y - circle.center.y;
        if ((dx * dx + dy * dy) < circle.radius**2) {
            return true; // Collision détectée avec un sommet
        }
    }

    // Vérifie la collision entre les segments du triangle et le cercle
    for (let i = 0; i < triangle.points.length; i++) {
        const start = triangle.points[i];
        const end = triangle.points[(i + 1) % triangle.points.length];
        if (segmentIntersectsCircle(start, end, circle)) {
            return true; // Collision détectée avec un segment
        }
    }

    return false; // Aucune collision détectée
}
// Vérifie la collision entre un triangle et un autre triangle
export const checkCollisionWithTriangle = (triangle1 : Triangle, triangle2 : Triangle) => {
    // Vérifie la collision entre chaque sommet du triangle 1 et le triangle 2
    for (let point of triangle1.points) {
        if (isPointInsideTriangle(point, triangle2)) {
            return true; // Collision détectée avec un sommet
        }
    }

    // Vérifie la collision entre chaque sommet du triangle 2 et le triangle 1
    for (let point of triangle2.points) {
        if (isPointInsideTriangle(point, triangle1)) {
            return true; // Collision détectée avec un sommet
        }
    }

    return false; // Aucune collision détectée
}


// Fonction pour vérifier si deux segments de ligne se croisent
const lineIntersects = (line1 : Line, line2 : Line) => {
    const det = (line1.x2 - line1.x1) * (line2.y2 - line2.y1) - (line2.x2 - line2.x1) * (line1.y2 - line1.y1);
    if (det === 0) {
        return false; // Les lignes sont parallèles
    } else {
        const lambda = ((line2.y2 - line2.y1) * (line2.x2 - line1.x1) + (line2.x1 - line2.x2) * (line2.y2 - line1.y1)) / det;
        const gamma = ((line1.y1 - line1.y2) * (line2.x2 - line1.x1) + (line1.x2 - line1.x1) * (line2.y2 - line1.y1)) / det;
        return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
}

// Vérifie la collision entre un triangle et un rectangle(mur)
export const checkCollisionWithRectangle = (triangle: Triangle, rectangle: Rectangle) => {
    // Ajuste les limites du rectangle pour la détection de collision
    const rect = {
        x: rectangle.x + 1,
        y: rectangle.y + 1,
        x2: rectangle.x + 1 + rectangle.width,
        y2: rectangle.y + 1 + rectangle.height
    };

    // Vérifie si chaque point du triangle se trouve à l'intérieur du rectangle
    for (let point of triangle.points) {
        if (point.x >= rect.x && point.x <= rect.x2 && point.y >= rect.y && point.y <= rect.y2) {
            return true; // Le point est à l'intérieur du rectangle
        }
    }


    // Vérifie les intersections des arêtes avec les limites du rectangle
    const edges = [
        { x1: triangle.points[0].x, y1: triangle.points[0].y, x2: triangle.points[1].x, y2: triangle.points[1].y },
        { x1: triangle.points[1].x, y1: triangle.points[1].y, x2: triangle.points[2].x, y2: triangle.points[2].y },
        { x1: triangle.points[2].x, y1: triangle.points[2].y, x2: triangle.points[0].x, y2: triangle.points[0].y }
    ];

    const rectangleEdges = [
        { x1: rect.x, y1: rect.y, x2: rect.x2, y2: rect.y }, // Haut
        { x1: rect.x2, y1: rect.y, x2: rect.x2, y2: rect.y2 }, // Droite
        { x1: rect.x2, y1: rect.y2, x2: rect.x, y2: rect.y2 }, // Bas
        { x1: rect.x, y1: rect.y2, x2: rect.x, y2: rect.y } // Gauche
    ];

    // Vérifie chaque arête du triangle contre chaque arête du rectangle
    for (let edge of edges) {
        for (let rectEdge of rectangleEdges) {
            if (lineIntersects(edge, rectEdge)) {
                return true; // Intersection d'arête détectée
            }
        }
    }

    return false; // Aucune collision détectée
}


// Vérifie la collision entre un triangle et les bords du canvas
export const checkCollisionWithBorders = (triangle : Triangle, canvasWidth : number, canvasHeight : number) => {
    for (let point of triangle.points) {
        if (point.x <= 0 || point.x >= canvasWidth || point.y <= 0 || point.y >= canvasHeight) {
            return true; // Collision détectée avec un bord
        }
    }
    return false; // Aucune collision détectée
}



/*
const calculateRectangleNormal = (rectangle: Rectangle, triangle: Triangle): Point => {
    const rectangleCenter: Point = {
        x: rectangle.x + rectangle.width / 2,
        y: rectangle.y + rectangle.height / 2
    };

    const triangleCenter: Point = triangle.center;

    const edgeVectors: Point[] = [
        { x: rectangle.x + rectangle.width, y: rectangle.y }, // Droite du rectangle
        { x: rectangle.x, y: rectangle.y + rectangle.height }, // Bas du rectangle
        { x: rectangle.x + rectangle.width, y: rectangle.y + rectangle.height } // Diagonale droite-bas du rectangle
    ].map(vertex => ({
        x: vertex.x - rectangleCenter.x,
        y: vertex.y - rectangleCenter.y
    }));

    const axes: Point[] = [
        { x: edgeVectors[0].y, y: -edgeVectors[0].x },
        { x: edgeVectors[1].y, y: -edgeVectors[1].x },
        { x: edgeVectors[2].y, y: -edgeVectors[2].x }
    ];

    let minOverlap = Infinity;
    let minOverlapAxis: Point | null = null;

    for (const axis of axes) {
        const triangleProjections = triangle.points.map(vertex => axis.x * (vertex.x - triangleCenter.x) + axis.y * (vertex.y - triangleCenter.y));
        const rectangleProjections = [
            -rectangle.width / 2 * Math.abs(axis.x) + rectangle.height / 2 * Math.abs(axis.y),
            rectangle.width / 2 * Math.abs(axis.x) + rectangle.height / 2 * Math.abs(axis.y)
        ];

        const triangleMinProjection = Math.min(...triangleProjections);
        const triangleMaxProjection = Math.max(...triangleProjections);
        const rectangleMinProjection = Math.min(...rectangleProjections);
        const rectangleMaxProjection = Math.max(...rectangleProjections);
        const overlap = Math.max(0, Math.min(triangleMaxProjection, rectangleMaxProjection) - Math.max(triangleMinProjection, rectangleMinProjection));

        if (overlap <= 0) {
            return axis;
        }

        if (overlap < minOverlap) {
            minOverlap = overlap;
            minOverlapAxis = axis;
        }
    }

    const isHorizontalCollision = Math.abs(edgeVectors[1].x) > Math.abs(edgeVectors[1].y);
    const isVerticalCollision = Math.abs(edgeVectors[0].x) > Math.abs(edgeVectors[0].y);

    if (isHorizontalCollision) {
        return { x: 0, y: minOverlapAxis ? Math.sign(minOverlapAxis.y) : 0 };
    } else if (isVerticalCollision) {
        return { x: minOverlapAxis ? Math.sign(minOverlapAxis.x) : 0, y: 0 };
    } else {
        return minOverlapAxis || { x: 0, y: 0 };
    }
};
*/
