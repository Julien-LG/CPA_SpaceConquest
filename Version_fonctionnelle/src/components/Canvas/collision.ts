import { Triangle, Circle, Point } from './model';
type Line = { start: Point, end: Point };
/*******************************************************************
     * Fonctions de collision
*******************************************************************/
const friction = 0.99;
const velocity = { x: 0, y: 0 };

export const segmentIntersectsCircle = (start : Point, end : Point , circle : Circle) => {
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


// Fonctions de collision entre triangles 
const isPointInsideTriangle = (point : Point, triangle : Triangle) : boolean => {
    const {x: px, y: py} = point;
    const [v1, v2, v3] = triangle.points;

    const areaOrig = Math.abs((v2.x - v1.x) * (v3.y - v1.y) - (v2.y - v1.y) * (v3.x - v1.x));
    const area1 = Math.abs((v1.x - px) * (v2.y - py) - (v1.y - py) * (v2.x - px));
    const area2 = Math.abs((v2.x - px) * (v3.y - py) - (v2.y - py) * (v3.x - px));
    const area3 = Math.abs((v3.x - px) * (v1.y - py) - (v3.y - py) * (v1.x - px));

    return area1 + area2 + area3 == areaOrig;
}

const segmentIntersectsTriangle = (start : Point, end : Point, triangle : Triangle) : boolean => {
    // Check if endpoints are inside the triangle
    if (isPointInsideTriangle(start, triangle) || isPointInsideTriangle(end, triangle)) {
        return true;
    }

    // Check if segment intersects any triangle side
    for (let i = 0; i < triangle.points.length; i++) {
        const tStart = triangle.points[i];
        const tEnd = triangle.points[(i + 1) % triangle.points.length];
        if (segmentsIntersect(start, end, tStart, tEnd)) {
            return true;
        }
    }
    return false;
}

const segmentsIntersect = (p1 : Point , p2 : Point, q1 : Point , q2 : Point) => {
    // Calculate parts of the segment intersection formula
    const det = (q2.y - q1.y) * (p2.x - p1.x) - (q2.x - q1.x) * (p2.y - p1.y);
    if (det === 0) return false; // lines are parallel

    const lambda = ((q2.x - q1.x) * (q1.y - p1.y) - (q2.y - q1.y) * (q1.x - p1.x)) / det;
    const gamma = ((p1.x - p2.x) * (q1.y - p1.y) - (p1.y - p2.y) * (q1.x - p1.x)) / det;

    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
}


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

    // Vérifie la collision entre les segments des triangles
    for (let i = 0; i < triangle1.points.length; i++) {
        const start = triangle1.points[i];
        const end = triangle1.points[(i + 1) % triangle1.points.length];
        if (segmentIntersectsTriangle(start, end, triangle2)) {
            return true; // Collision détectée avec un segment
        }
    }
    return false; // Aucune collision détectée
}

// Applique la vélocité aux triangles rouges et gère les collisions avec les bords du canvas
// export const applyVelocityAndCheckBorders = (triangles) => {
//     velocity.x *= friction;
//     velocity.y *= friction;
//     triangles.forEach(triangle => {
//         triangle.points.forEach(point => {
//             point.x += velocity.x;
//             point.y += velocity.y;
//             // Inversion de la vélocité en cas de collision avec un bord pour simuler un rebond
//             if (point.x < 0 || point.x > canvas.width) velocity.x = -velocity.x;
//             if (point.y < 0 || point.y > canvas.height) velocity.y = -velocity.y;
//         });
//     });
// }
