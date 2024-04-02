class Model {
    constructor(collision) {
        this.collision = collision;
        this.triangles = []; // Liste de tous les triangles
        this.circles = []; // Liste de tous les cercles
        this.addCircle(550, 250, 50, 10, 'green'); // Ajoute un cercle avec des points de vie
        this.addCircle(550, 50, 50, 20, 'red'); // Ajoute un autre cercle avec des points de vie
        setInterval(() => this.addTriangle(50, 50, 'red'), 2000); // Ajoute un triangle rouge toutes les 2 secondes
    }

    addCircle(x, y, radius, hp, color) {
        // Ajoute un cercle avec des points de vie à la position spécifiée
        const circle = { x: x, y: y, radius: radius, hp: hp, color: color };
        this.circles.push(circle);
    }
    addTriangle(x, y, color) {
        const size = 10;
        // Création d'un triangle avec le sommet supérieur pointant vers le haut
        const triangle = {
            points: [
                { x: x, y: y - size * 1.5 }, // Sommet supérieur
                { x: x - size, y: y + size },
                { x: x + size, y: y + size }
            ],
            color: color,
            selected: false,
            center: { x: x, y: y },
            //id: Math.random().toString(36).substr(2, 9),
            destination : null // Destination pour le mouvement
        };
        this.triangles.push(triangle);
    }


    /*******************************************************************
     * Fonctions de déplacement
    *******************************************************************/
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


    // Réoriente le triangle pour qu'il pointe vers la destination
    reorientTriangle(triangle) {
        const center = triangle.center; // Utilisez le centre précalculé pour la rotation
        const destination = triangle.destination;

        // Calculez l'angle de direction vers la destination
        const angleToDestination = Math.atan2(destination.y - center.y, destination.x - center.x);

        // Calculez l'angle actuel du sommet supérieur par rapport au centre
        const currentTop = triangle.points[0]; // Le sommet supérieur est toujours le premier point
        const angleCurrentTop = Math.atan2(currentTop.y - center.y, currentTop.x - center.x);

        // Calculez l'angle de rotation nécessaire
        let rotationAngle = angleToDestination - angleCurrentTop;

        // Appliquez la rotation à chaque point du triangle
        triangle.points = triangle.points.map(point => {
            const dx = point.x - center.x;
            const dy = point.y - center.y;

            return {
                x: center.x + dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle),
                y: center.y + dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle)
            };
        });
    }

    collisionsGestion(triangle, circle) {
        if (this.collision.checkCollisionWithCircle(triangle, circle)) {
            if (triangle.color === circle.color) {
                circle.hp += 1; // Augmente les points de vie du cercle
                console.log("test");
            }
            else {
                circle.hp -= 1; // Réduit les points de vie du cercle
                if (circle.hp <= 0) {
                    circle.color = triangle.color; // Change la couleur du cercle à celle du triangle
                    circle.hp = 10; // Réinitialise les points de vie
                }
                console.log("test2");
            }
            //console.log(this.checkCollisionWithCircle(triangle, circle));
            return false; // Supprime le triangle en cas de collision
        }
        else return true; // Garde le triangle s'il n'y a pas de collision
    }

    moveTriangles() {
        this.triangles = this.triangles.filter(triangle => {
            let keepTriangle = true;
            if (triangle.destination){ // Ignore les triangles non sélectionnés ou immobiles

                // Calcul de la direction et de la distance vers la destination
                const dx = triangle.destination.x - triangle.center.x;
                const dy = triangle.destination.y - triangle.center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                if (distance < 1) {
                    triangle.destination = null; // Réinitialise la destination
                    return keepTriangle; // Le triangle reste présent
                }

                const speed = 1; // Vitesse de déplacement
                triangle.points.forEach(point => {
                    point.x += Math.cos(angle) * speed;
                    point.y += Math.sin(angle) * speed;
                });
                triangle.center.x += Math.cos(angle) * speed;
                triangle.center.y += Math.sin(angle) * speed;
                

                // Vérifie la collision avec les cercles
                this.circles.forEach(circle => {
                    /*if (this.collision.checkCollisionWithCircle(triangle, circle)) {
                        circle.hp -= 1; // Réduit les points de vie du cercle
                        if (circle.hp <= 0) {
                            circle.color = triangle.color; // Change la couleur du cercle à celle du triangle
                            circle.hp = 10; // Réinitialise les points de vie
                        }
                        keepTriangle = false; // Supprime le triangle en cas de collision
                    }*/
                    keepTriangle = this.collisionsGestion(triangle, circle);
                    console.log(keepTriangle);
                });
            }
            return keepTriangle; // Garde le triangle s'il n'y a pas de collision
        });
    }

    setDestination(destination) {
        // Définit la destination et initie le mouvement pour les triangles sélectionnés
        this.triangles.forEach(triangle => {
            if (triangle.selected) {
                triangle.destination = destination; // Définit la destination du triangle
                this.reorientTriangle(triangle);
            }
        });
        
        this.moveTriangles(); // Commence le mouvement
    }

}
