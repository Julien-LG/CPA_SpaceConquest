class Model {
    constructor() {
        this.triangles = []; // Liste de tous les triangles
        this.circle = { x: 300, y: 200, radius: 50, hp: 100 }; // Le cercle avec des points de vie
        setInterval(() => this.addTriangle(50, 50, 'red'), 2000); // Ajoute un triangle rouge toutes les 2 secondes
        this.destination = null; // Destination pour le mouvement des triangles
    }

    addTriangle(x, y, color) {
        const size = 20;
        // Création d'un triangle avec le sommet supérieur pointant vers le haut
        const triangle = {
            points: [
                { x: x, y: y - size * 1.5 }, // Sommet supérieur
                { x: x - size, y: y + size },
                { x: x + size, y: y + size }
            ],
            color: color,
            selected: false,
            id: Math.random().toString(36).substr(2, 9),
            moving: false, // Indicateur de mouvement
        };
        this.triangles.push(triangle);
    }

    selectTrianglesInArea(start, end) {
        // Sélectionne les triangles dans la zone spécifiée par l'utilisateur
        const selectionRect = {
            x1: Math.min(start.x, end.x),
            y1: Math.min(start.y, end.y),
            x2: Math.max(start.x, end.x),
            y2: Math.max(start.y, end.y)
        };

        this.triangles.forEach(triangle => {
            const centerX = (triangle.points[0].x + triangle.points[2].x) / 2;
            const centerY = (triangle.points[0].y + triangle.points[1].y) / 2;
            triangle.selected = centerX >= selectionRect.x1 && centerX <= selectionRect.x2 &&
                                centerY >= selectionRect.y1 && centerY <= selectionRect.y2;
        });
    }

    setDestination(destination) {
        // Définit la destination et initie le mouvement pour les triangles sélectionnés
        this.destination = destination;
        this.triangles.forEach(triangle => {
            if (triangle.selected) {
                triangle.moving = true; // Active le mouvement
            }
        });
        this.moveAndOrientSelectedTriangles(); // Commence le mouvement
    }

    moveAndOrientSelectedTriangles() {
        if (!this.destination) return; // Arrête si aucune destination n'est définie

        this.triangles = this.triangles.filter(triangle => {
            if (!triangle.selected || !triangle.moving) return true; // Ignore les triangles non sélectionnés ou immobiles

            // Calcul de la direction et de la distance vers la destination
            const center = this.getTriangleCenter(triangle);
            const dx = this.destination.x - center.x;
            const dy = this.destination.y - center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            if (distance < 1) {
                triangle.moving = false; // Arrête le triangle s'il est proche de la destination
                this.destination = 0; // Réinitialise la destination
                return true; // Le triangle reste présent
            }

            // Déplace et réoriente le triangle vers la destination
            const speed = 0.1; // Vitesse de déplacement
            triangle.points.forEach(point => {
                point.x += Math.cos(angle) * speed;
                point.y += Math.sin(angle) * speed;
            });
            this.reorientTriangle(triangle, angle);

            // Vérifie la collision avec le cercle
            if (this.checkCollisionWithCircle(triangle)) {
                this.circle.hp -= 1; // Réduit les points de vie du cercle
                if (this.circle.hp <= 0) {
                    this.circle.color = triangle.color; // Change la couleur du cercle
                    this.circle.hp = 100; // Réinitialise les points de vie
                }
                return false; // Supprime le triangle en cas de collision
            }

            return true; // Garde le triangle s'il n'y a pas de collision
        });
    }

    reorientTriangle(triangle, angle) {
        // Cette fonction réoriente le triangle pour que le sommet supérieur 
        //pointe dans la direction du mouvement. La réorientation est calculée 
        //par rapport à l'angle de déplacement vers la destination.
        const center = this.getTriangleCenter(triangle);
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const topVertex = triangle.points[0];
        
        // Calcul de la nouvelle position du sommet pour qu'il pointe vers la direction
        topVertex.x = center.x + dx * 20; // La distance du centre au sommet supérieur est ajustée selon la taille du triangle
        topVertex.y = center.y + dy * 20;

        // Ajustement des autres points pour maintenir la forme du triangle
        triangle.points[1].x = center.x - dy * 20; // Perpendiculaire à la direction pour le côté gauche
        triangle.points[1].y = center.y + dx * 20;
        triangle.points[2].x = center.x + dy * 20; // Perpendiculaire à la direction pour le côté droit
        triangle.points[2].y = center.y - dx * 20;
    }

    getTriangleCenter(triangle) {
        // Calcule le centre géométrique du triangle pour faciliter les calculs de mouvement et de rotation
        const sum = triangle.points.reduce((acc, curr) => {
            return { x: acc.x + curr.x, y: acc.y + curr.y };
        }, { x: 0, y: 0 });
        return { x: sum.x / triangle.points.length, y: sum.y / triangle.points.length };
    }


    checkCollisionWithCircle(triangle) {
        // Vérifie la collision entre chaque sommet du triangle et le cercle
        for (let point of triangle.points) {
            const dx = point.x - this.circle.x;
            const dy = point.y - this.circle.y;
            if (Math.sqrt(dx * dx + dy * dy) < this.circle.radius) {
                return true; // Collision détectée avec un sommet
            }
        }
    
        // Vérifie la collision entre les segments du triangle et le cercle
        for (let i = 0; i < triangle.points.length; i++) {
            const start = triangle.points[i];
            const end = triangle.points[(i + 1) % triangle.points.length];
            if (this.segmentIntersectsCircle(start, end, this.circle)) {
                return true; // Collision détectée avec un segment
            }
        }
    
        return false; // Aucune collision détectée
    }
    
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
}
