class Collision {
    constructor() {
    }
    /*******************************************************************
         * Fonctions de collision
    *******************************************************************/


    segmentIntersectsCircle(start, end, circle) {
        const d = { x: end.x - start.x, y: end.y - start.y };
        const f = { x: start.x - circle.x, y: start.y - circle.y };

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
    checkCollisionWithCircle(triangle,circle) {
        // Vérifie la collision entre chaque sommet du triangle et le cercle
        for (let point of triangle.points) {
            const dx = point.x - circle.x;
            const dy = point.y - circle.y;
            if ((dx * dx + dy * dy) < circle.radius**2) {
                return true; // Collision détectée avec un sommet
            }
        }

        // Vérifie la collision entre les segments du triangle et le cercle
        for (let i = 0; i < triangle.points.length; i++) {
            const start = triangle.points[i];
            const end = triangle.points[(i + 1) % triangle.points.length];
            if (this.segmentIntersectsCircle(start, end, circle)) {
                return true; // Collision détectée avec un segment
            }
        }

        return false; // Aucune collision détectée
    }

    checkCollisionWithTriangle(triangle1, triangle2) {
        // Vérifie la collision entre chaque sommet du triangle 1 et le triangle 2
        for (let point of triangle1.points) {
            if (this.isPointInsideTriangle(point, triangle2)) {
                return true; // Collision détectée avec un sommet
            }
        }

        // Vérifie la collision entre chaque sommet du triangle 2 et le triangle 1
        for (let point of triangle2.points) {
            if (this.isPointInsideTriangle(point, triangle1)) {
                return true; // Collision détectée avec un sommet
            }
        }

        // Vérifie la collision entre les segments des triangles
        for (let i = 0; i < triangle1.points.length; i++) {
            const start = triangle1.points[i];
            const end = triangle1.points[(i + 1) % triangle1.points.length];
            if (this.segmentIntersectsTriangle(start, end, triangle2)) {
                return true; // Collision détectée avec un segment
            }
        }
        return false; // Aucune collision détectée
    }

    // Applique la vélocité aux triangles rouges et gère les collisions avec les bords du canvas
    applyVelocityAndCheckBorders() {
        velocity.x *= friction;
        velocity.y *= friction;
        triangles.forEach(triangle => {
            triangle.points.forEach(point => {
                point.x += velocity.x;
                point.y += velocity.y;
                // Inversion de la vélocité en cas de collision avec un bord pour simuler un rebond
                if (point.x < 0 || point.x > canvas.width) velocity.x = -velocity.x;
                if (point.y < 0 || point.y > canvas.height) velocity.y = -velocity.y;
            });
        });
    }

    

}