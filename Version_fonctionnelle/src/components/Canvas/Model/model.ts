import * as coll from "./collision";
import * as conf from "../config";



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
    hp : number,
    maxHP : number
};
export type OurModel = { 
    triangles: Triangle[], 
    circles: Circle[]
    startSelec: Point | null,
    endSelec: Point | null,
    canvasheight : number,
    canvaswidth : number,
    events : MouseEvent[]
};


export const initModel = (height : number, width : number): OurModel => {
    return { triangles: [], circles: [], canvasheight : height, canvaswidth: width, startSelec: null, endSelec: null, events: [] };
}

// Fonctions pour creer et ajouter des triangles et cercles dans le modele
const addTriangle = (model: OurModel, triangle: Triangle): OurModel => {
    return {
        triangles: model.triangles.concat(triangle), 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events
    };
}

const addCircle = (model: OurModel, circle: Circle): OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles.concat(circle), 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events
    };
}



/*******************************************************************
     * Fonctions de séléction et déplacement des triangles
*******************************************************************/
export const selectTrianglesInArea = (model : OurModel) => {
    // Sélectionne les triangles dans la zone spécifiée par l'utilisateur
    if (!model.startSelec || !model.endSelec) return model;
    const start = model.startSelec;
    const end = model.endSelec;
    const selectionRect = {
        x1: Math.min(start.x, end.x),
        y1: Math.min(start.y, end.y),
        x2: Math.max(start.x, end.x),
        y2: Math.max(start.y, end.y)
    };

    const newtriangles = model.triangles.map(triangle => {
        if (triangle.color !== conf.PLAYERCOLOR) return triangle; // Ignore les triangles ennemis
        const centerX = triangle.center.x;
        const centerY = triangle.center.y;
        const selected = centerX >= selectionRect.x1 && centerX <= selectionRect.x2 &&
                            centerY >= selectionRect.y1 && centerY <= selectionRect.y2;
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
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: null, 
        endSelec: null, 
        events: model.events
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


// const collisionsGestion = (triangle : Triangle, circle : Circle) : boolean => {
//     if (coll.checkCollisionWithCircle(triangle, circle)) {
//         if (triangle.color === circle.color) {
//             circle.hp += 1; // Augmente les points de vie du cercle
//             console.log("test");
//         }
//         else {
//             circle.hp -= 1; // Réduit les points de vie du cercle
//             if (circle.hp <= 0) {
//                 circle.color = triangle.color; // Change la couleur du cercle à celle du triangle
//                 circle.hp = 10; // Réinitialise les points de vie
//             }
//             console.log("test2");
//         }
//         //console.log(this.checkCollisionWithCircle(triangle, circle));
//         return false; // Supprime le triangle en cas de collision
//     }
//     else return true; // Garde le triangle s'il n'y a pas de collision
// }

const moveTriangles = (model: OurModel): OurModel => {
    const trianglesToRemove = new Set<Triangle>();  //Se contennat les triangles a supprimer
    const canvasHeight = model.canvasheight;
    const canvasWidth = model.canvaswidth;

    model.triangles.forEach((triangle) => {
        let hasCollided = false; // marqueur de collision

        if (triangle.destination) {  // Ignore les triangles sans destination(immobiles)
            const dx = triangle.destination.x - triangle.center.x;
            const dy = triangle.destination.y - triangle.center.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx);

            if (distance < 1) {
                triangle.destination = null;  // Reset destination quand arriver
            } else {
                const speed = 1;
                triangle.points.forEach(point => {
                    point.x += Math.cos(angle) * speed;
                    point.y += Math.sin(angle) * speed;
                });
                triangle.center.x += Math.cos(angle) * speed;
                triangle.center.y += Math.sin(angle) * speed;
            }

            // Check collisions avec les cercles
            model.circles.forEach(circle => {
                if (!hasCollided && coll.checkCollisionWithCircle(triangle, circle) && triangle.color !== circle.color) {
                    circle.hp -= 1; 
                    if (circle.hp <= 0) {
                        circle.color = triangle.color;  
                        circle.hp = circle.maxHP;  // Reset hp
                    }
                    trianglesToRemove.add(triangle);  // Marquage du triangle pour suppression
                    hasCollided = true;  // Set  marqueur de collision à true
                }
            });

            // Check collisions entre triangles si pas encore de collision
            if (!hasCollided) {
                for (let j = 0; j < model.triangles.length; j++) {
                    const triangle2 = model.triangles[j];
                    if (triangle !== triangle2 && triangle.color !== triangle2.color && coll.checkCollisionWithTriangle(triangle, triangle2)) {
                        trianglesToRemove.add(triangle);  // Mark this triangle for removal
                        trianglesToRemove.add(triangle2);  // Mark the other triangle for removal
                        hasCollided = true;  // Set the collision flag
                        break;  // Stop checking once a collision is found
                    }
                }
            }
            // check collisions avec les bords si pas encore de collision
            if (!hasCollided) {
                if (coll.checkCollisionWithBorders(triangle, canvasWidth, canvasHeight)) {
                    model.triangles.forEach(triangle => {
                        triangle.destination = null;  // Mark all triangles for removal
                        console.log("collision bord");
                    });
                }
            }
        }
    });

    // Filter out triangles marked for removal
    const newTriangles = model.triangles.filter(triangle => !trianglesToRemove.has(triangle));

    return {
        triangles: newTriangles,
        circles: model.circles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec,
        endSelec: model.endSelec,
        events: model.events
    };
};

export const setDestinationEnemy = (model : OurModel, destination : Point, color : string) : OurModel => {
    // Définit la destination et initie le mouvement pour les triangles sélectionnés
    const newtriangles = model.triangles.map(triangle => {
        if (triangle.color === color) {
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
    
    return {
        triangles: newtriangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
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
export const setDestinationSelected = (model : OurModel, destination : Point) : OurModel => {
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
    
    return {
        triangles: newtriangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events
    };
}

const onleftclick = (model : OurModel, destination : Point) : OurModel => {
    return setDestinationSelected(model, destination);
}

// Double click gauche pour selectionner tous les triangles de la couleur du joueur
const ondoubleclick = (model : OurModel) : OurModel => {
    const newtriangles = model.triangles.map(triangle => {

        return triangle.color === conf.PLAYERCOLOR ? {
            points : triangle.points, 
            size : triangle.size,
            center : triangle.center,
            color : triangle.color,
            selected : true,
            destination : triangle.destination
        } : triangle;
    });
    return { 
        triangles: newtriangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: null, 
        endSelec: null, 
        events: model.events
    };
}


const onrightclick = (model : OurModel) : OurModel => {
    const newtriangles = model.triangles.map(triangle => {
        return triangle.selected ? {
            points : triangle.points, 
            size : triangle.size,
            center : triangle.center,
            color : triangle.color,
            selected : false,
            destination : triangle.destination
        } : triangle;
    });
    return { 
        triangles: newtriangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events
    };
}
const onmousedown = (model : OurModel, start : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: start, 
        endSelec: null, 
        events: model.events
    };
}

const onmousemove = (model : OurModel, end : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: end, 
        events: model.events
    };
}

const onmouseup = (model : OurModel) : OurModel => {
    return selectTrianglesInArea(model);
}

const executeEvents = (model : OurModel) : OurModel => {
    const newmodel = model.events.reduce((acc, event) => {
        switch (event.type) {
            case 'click':
                if(event.detail === 2){
                    console.log("double left click")
                    return ondoubleclick(acc);
                }else {
                    console.log("left click");
                    return onleftclick(acc, { x: event.offsetX, y: event.offsetY });
                }
            case 'contextmenu':
                console.log("right click");
                return onrightclick(acc);
            case 'mousedown':
                return onmousedown(acc, { x: event.offsetX, y: event.offsetY });
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
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: newmodel.startSelec, 
        endSelec: newmodel.endSelec, 
        events: []
    };
}

export const addEvent = (model : OurModel, event : MouseEvent) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events.concat(event)
    };
}

/*******************************************************************
     *  Fonction de génération de triangles(troupes) autour des cercles
*******************************************************************/
const generateTriangleNearCircle = (model: OurModel, circle: Circle): OurModel => {
    const distToCircle = circle.radius+ 20; // Distance from the circle where the triangle will be generated
    const angle = Math.random() * Math.PI * 2; // Random angle for triangle placement

    const x = circle.center.x + Math.cos(angle) * distToCircle;
    const y = circle.center.y + Math.sin(angle) * distToCircle;
    const size = conf.TRIANGLESIZE;
    const points = [
        { x: x, y: y - size },
        { x: x - size, y: y + size },
        { x: x + size, y: y + size }
    ];
    const center = { x: x, y: y };
    const color = circle.color;
    const triangle : Triangle = {
        points : points, 
        size : size, 
        center : center, 
        color : color, 
        selected : false, 
        destination : null
    };

    return addTriangle(model, triangle);
};

export const generateTrianglesAroundPlanetofSetSize = (model: OurModel, size : number): OurModel => {
    model.circles.forEach(circle => {
        if (circle.color !== conf.UNHABITEDPLANETCOLOR && circle.radius === size) {; // Ignore planètes non habitées
            model = generateTriangleNearCircle(model, circle);
        }
    });
    return model;
}

/*******************************************************************
     * Fonctions pour la régenération des pv des planètes
*******************************************************************/
export const regenerateHP = (model : OurModel) : OurModel => {
    const newCircles = model.circles.map(circle => {
        if (circle.color !== conf.UNHABITEDPLANETCOLOR) {
            switch (circle.radius) {
                case conf.SMALLPLANETRADIUS:
                    circle.hp += 0.5;
                    break;
                case conf.MEDIUMPLANETRADIUS:
                    circle.hp += 1;
                    break;
                case conf.BIGPLANETRADIUS:
                    circle.hp += 2;
                    break;
                default:
                    break;
            }
            if (circle.hp > circle.maxHP) {
                circle.hp = circle.maxHP;
            }
        }
        return circle;
    });
    return { 
        triangles: model.triangles, 
        circles: newCircles, 
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events
    };
}

/*******************************************************************
     * Fonction pour la gestion du modèle
*******************************************************************/
export const updateModel = (model : OurModel) : OurModel => {
    const newModel = executeEvents(model);
    return moveTriangles(newModel);
}

/*******************************************************************
     * Fonctions pour creer des planètes
*******************************************************************/
const addSmallPlanet = (model : OurModel, point : Point, color : string) : OurModel => {
    const radius = conf.SMALLPLANETRADIUS;
    const center = point;
    const colorP = color;
    const hp = conf.SMALLPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}


const addMediumPlanet = (model : OurModel, point : Point, color : string) : OurModel => {
    const radius = conf.MEDIUMPLANETRADIUS;
    const center = point;
    const colorP = color;
    const hp = conf.MEDIUMPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}

const addBigPlanet = (model : OurModel, point : Point, color : string) : OurModel => {
    const radius = conf.BIGPLANETRADIUS;
    const center = point;
    const colorP = color;
    const hp = conf.BIGPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}

/*******************************************************************
     *  Fonction de tests, génération de triangles et cercles
*******************************************************************/
const generateTriangles = (model : OurModel, height : number, width : number, number : number) : OurModel => {
    for (let i = 0; i < number; i++) {
        const x = 20 + Math.random() * (width-50);
        const y = 20 + Math.random() * (height-50);
        const size = 20;
        const points = [
            { x: x, y: y - size },
            { x: x - size, y: y + size },
            { x: x + size, y: y + size }
        ];
        const center = { x: x, y: y };
        const color = conf.PLAYERCOLOR;
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
    const circle : Circle = { center: center, radius: radius, color: color, hp: hp, maxHP: hp};
    model = addCircle(model, circle);
    
    const x2 = 300;
    const y2 = 300;
    const radius2 = conf.BIGPLANETRADIUS;
    const center2 = { x: x2, y: y2 };
    const color2 = conf.PLAYERCOLOR;
    const hp2 = conf.BIGPLANETLIFE;
    const circle2 : Circle = { center: center2, radius: radius2, color: color2, hp: hp2, maxHP: hp2};
    model = addCircle(model, circle2);

    return model;
}

export const createGameTest = (height : number, width : number) => {
    let model = initModel(height, width);
    //model = generateTriangles(model, height, width, 1000);

    model = addBigPlanet(model, { x: width-100 , y: 100 }, conf.PLAYERCOLOR);
    model = addBigPlanet(model, { x: width-100, y: height-100 }, conf.ENEMYCOLOR1);
    model = addBigPlanet(model, { x: 100, y: 100 }, conf.ENEMYCOLOR2);
    model = addBigPlanet(model, { x: 100, y: height-100 }, conf.ENEMYCOLOR3);

    model = addMediumPlanet(model, { x: width-250 , y: 250 }, conf.PLAYERCOLOR);
    model = addMediumPlanet(model, { x: width-250, y: height-250 }, conf.ENEMYCOLOR1);
    model = addMediumPlanet(model, { x: 250, y: 250 }, conf.ENEMYCOLOR2);
    model = addMediumPlanet(model, { x: 250, y: height-250 }, conf.ENEMYCOLOR3);

    model = addMediumPlanet(model, { x: width-100 , y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: width-100, y: height-300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 100, y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 100, y: height-300 }, conf.UNHABITEDPLANETCOLOR);

    model = addMediumPlanet(model, { x: width-300 , y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: width-300, y: height-100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 300, y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 300, y: height-100 }, conf.UNHABITEDPLANETCOLOR);

    model = addSmallPlanet(model, { x: width-500 , y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: width-500, y: height-100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: height-100 }, conf.UNHABITEDPLANETCOLOR);

    model = addSmallPlanet(model, { x: width-500 , y: 500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: width-500, y: height-500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: 500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: height-500 }, conf.UNHABITEDPLANETCOLOR);


    const midx = width/2;
    const midy = height/2;
    model = addSmallPlanet(model, { x: midx-100, y: 500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx+100, y: 500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx+100, y: height-500 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx-100, y: height-500 }, conf.UNHABITEDPLANETCOLOR);
    

    model = addBigPlanet(model, { x: midx, y: midy }, conf.UNHABITEDPLANETCOLOR);
    
    return model;
}


