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
    events : MouseEvent[]
};


export const initModel = (): OurModel => {
    return { triangles: [], circles: [], startSelec: null, endSelec: null, events: [] };
}

// Fonctions pour creer et ajouter des triangles et cercles dans le modele
const addTriangle = (model: OurModel, triangle: Triangle): OurModel => {
    return {
        triangles: model.triangles.concat(triangle), 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events
    };
}

const addCircle = (model: OurModel, circle: Circle): OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles.concat(circle), 
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events
    };
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
    return { 
        triangles: newtriangles, 
        circles: modele.circles, 
        startSelec: null, 
        endSelec: null, 
        events: modele.events
    };
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
                    }
                    else {
                        circle.hp -= 1; // Réduit les points de vie du cercle
                        if (circle.hp <= 0) {
                            circle.color = triangle.color; // Change la couleur du cercle à celle du triangle
                            circle.hp = 10; // Réinitialise les points de vie
                        }
                    }
                    keepTriangle = false; // Supprime le triangle en cas de collision
                }
                //keepTriangle = this.collisionsGestion(triangle, circle);
                console.log(keepTriangle);
            });
        }
        return keepTriangle; // Garde le triangle s'il n'y a pas de collision
    });
    return { 
        triangles: newtriangles, 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events 
    };
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
    const newtriangles = model.triangles.map(triangle => {
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
    
    //return moveTriangles(model); // Commence le mouvement
    return {
        triangles: newtriangles, 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events
    };
}

const onleftclick = (model : OurModel, destination : Point) : OurModel => {
    return setDestination(model, destination);
}

const onrightclick = (model : OurModel, start : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        startSelec: start, 
        endSelec: null, 
        events: model.events
    };
}

const onmousemove = (model : OurModel, end : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: end, 
        events: model.events
    };
}

const onmouseup = (model : OurModel) : OurModel => {
    if (!model.startSelec || !model.endSelec) return model; // Aucune sélection en cours // Impossible normalement
    return selectTrianglesInArea(model.startSelec, model.endSelec, model);
}

const executeEvents = (model : OurModel) : OurModel => {
    const newmodel = model.events.reduce((acc, event) => {
        switch (event.type) {
            case 'click':
                return onleftclick(acc, { x: event.offsetX, y: event.offsetY });
            case 'mousedown':
                return onrightclick(acc, { x: event.offsetX, y: event.offsetY });
            case 'mousemove':
                return onmousemove(acc, { x: event.offsetX, y: event.offsetY });
            case 'mouseup':
                return onmouseup(acc);
            default:
                return acc;
        }
    }, model);
    return { 
        triangles: newmodel.triangles, 
        circles: newmodel.circles, 
        startSelec: newmodel.startSelec, 
        endSelec: newmodel.endSelec, 
        events: []
    };
}

export const addEvent = (model : OurModel, event : MouseEvent) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events.concat(event)
    };
}

export const updateModel = (model : OurModel) : OurModel => {
    const newModel = executeEvents(model);
    return moveTriangles(newModel);
}

// Fonction de tests, génération de triangles et cercles
const generateTriangles = (model : OurModel, number : number) : OurModel => {
    for (let i = 0; i < number; i++) {
        const x = Math.random() * 800+200;
        const y = Math.random() * 200;
        const size = 20;
        const points = [
            { x: x, y: y - size },
            { x: x - size, y: y + size },
            { x: x + size, y: y + size }
        ];
        const center = { x: x, y: y };
        const color = conf.ENEMYCOLOR1;
        const triangle : Triangle = {
            points : points, 
            size : size, 
            center : center, 
            color : color, 
            selected : false, 
            destination : null
        };
        model = addTriangle(model, triangle);
    }
    return model;
}
const generateCircles = (model : OurModel) : OurModel => {
    const x = 100;
    const y = 100;
    const radius = conf.MEDIUMPLANETRADIUS;
    const center = { x: x, y: y };
    const color = conf.ENEMYCOLOR1;
    const hp = conf.BIGPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: color, hp: hp };
    model = addCircle(model, circle);
    
    const x2 = 300;
    const y2 = 300;
    const radius2 = conf.BIGPLANETRADIUS;
    const center2 = { x: x2, y: y2 };
    const color2 = conf.PLAYERCOLOR;
    const hp2 = conf.BIGPLANETLIFE;
    const circle2 : Circle = { center: center2, radius: radius2, color: color2, hp: hp2 };
    model = addCircle(model, circle2);

    return model;
}

export const createGameTest = () => {
    let model = initModel();
    model = generateTriangles(model, 10000);
    model = generateCircles(model);
    return model;
}


