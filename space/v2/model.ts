import * as coll from "./collision";
import * as conf from "./conf";



export type Point = { x: number, y: number };
export type Triangle = {
    points : Point[],
    size : number, 
    center : Point ,
    color: string, 
    selected: boolean, 
    destination: Point | null
};
export type Circle = { 
    center: Point,
    radius: number, 
    color: string, 
    hp : number
};
export type OurModel = { 
    triangles: Triangle[], 
    circles: Circle[]
    startSelec: Point | null,
    endSelec: Point | null,
};


// Fonctions pour creer et ajouter des triangles et cercles dans le modele
const addTriangle = (model: OurModel, triangle: Triangle): OurModel => {
    return {
        triangles: model.triangles.concat(triangle), 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec
    };
}

const addCircle = (model: OurModel, circle: Circle): OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles.concat(circle), 
        startSelec: model.startSelec, 
        endSelec: model.endSelec
    };
}

export const initModel = (): OurModel => {
    return { triangles: [], circles: [], startSelec: null, endSelec: null };
}



/*******************************************************************
     * Fonctions de déplacement
*******************************************************************/
export const selectTrianglesInArea = (start : Point, end : Point, modele : OurModel) => {
    // Sélectionne les triangles dans la zone spécifiée par l'utilisateur
    const selectionRect = {
        x1: Math.min(start.x, end.x),
        y1: Math.min(start.y, end.y),
        x2: Math.max(start.x, end.x),
        y2: Math.max(start.y, end.y)
    };

    const newtriangles = modele.triangles.map(triangle => {
        const centerX = triangle.center.x;
        const centerY = triangle.center.y;
        const selected = centerX >= selectionRect.x1 && centerX <= selectionRect.x2 &&
                            centerY >= selectionRect.y1 && centerY <= selectionRect.y2;
        //if (triangle.destination == null) return createTriangle(triangle.points, triangle.size, triangle.center, triangle.color, selected, null);
        const newTriangle :  Triangle = {
            points : triangle.points,
            size : triangle.size, 
            center : triangle.center, 
            color : triangle.color, 
            selected : selected, 
            destination :  triangle.destination
        };
        return newTriangle;
    });
    return { triangles: newtriangles, circles: modele.circles, startSelec: start, endSelec: end };
}

// Réoriente le triangle pour qu'il pointe vers la destination
const reorientTriangle = (triangle : Triangle) : Triangle=> {
    const center = triangle.center; // Utilisez le centre précalculé pour la rotation
    const destination = triangle.destination;

    // Si aucune destination n'est définie, retournez le triangle tel quel théoriquement impossible mais vérification obligatoire
    if (!destination) return triangle;
    // Calculez l'angle de direction vers la destination
    const angleToDestination = Math.atan2(destination.y - center.y, destination.x - center.x);

    // Calculez l'angle actuel du sommet supérieur par rapport au centre
    const currentTop = triangle.points[0]; // Le sommet supérieur est toujours le premier point
    const angleCurrentTop = Math.atan2(currentTop.y - center.y, currentTop.x - center.x);

    // Calculez l'angle de rotation nécessaire
    let rotationAngle = angleToDestination - angleCurrentTop;

    // Appliquez la rotation à chaque point du triangle
    const newpoints = triangle.points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;

        return {
            x: center.x + dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle),
            y: center.y + dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle)
        };
    });

    const newTriangle :  Triangle = {
        points : newpoints,
        size : triangle.size, 
        center : triangle.center, 
        color : triangle.color, 
        selected : triangle.selected, 
        destination :  triangle.destination
    };
    return newTriangle;
}

/*
const collisionsGestion = (triangle, circle) => {
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
*/

const moveTriangles = (model : OurModel ) : OurModel => {
    const newtriangles = model.triangles.filter(triangle => {
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
            model.circles.forEach(circle => {
                if (coll.checkCollisionWithCircle(triangle, circle)) {
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
                    keepTriangle = false; // Supprime le triangle en cas de collision
                }
                //keepTriangle = this.collisionsGestion(triangle, circle);
                console.log(keepTriangle);
            });
        }
        return keepTriangle; // Garde le triangle s'il n'y a pas de collision
    });
    return { triangles: newtriangles, circles: model.circles, startSelec: model.startSelec, endSelec: model.endSelec };
}

export const winGame = (model : OurModel) : boolean => {
    const colors = model.circles.map(circle => circle.color);
    return colors.every(color => color === conf.PLAYERCOLOR);
}
export const loseGame = (model : OurModel) : boolean => {
    const colors = model.circles.map(circle => circle.color);
    return colors.every(color => color !== conf.PLAYERCOLOR);
}

/*******************************************************************
     * Fonctions pour les événements
*******************************************************************/
export const setDestination = (model : OurModel, destination : Point) : OurModel => {
    // Définit la destination et initie le mouvement pour les triangles sélectionnés
    model.triangles = model.triangles.map(triangle => {
        if (triangle.selected) {
            return reorientTriangle(
                {points : triangle.points, 
                    size : triangle.size, 
                    center : triangle.center, 
                    color : triangle.color, 
                    selected : triangle.selected, 
                    destination : destination
                });
        }
        return triangle;
    });
    
    return moveTriangles(model); // Commence le mouvement
}