import * as coll from "./collision";
import * as conf from "../config";
import { executeEvents } from "./eventFunctions";
import { GridCell, createGrid} from './pathFinding'; // Import the pathfinding function


export type Point = { x: number, y: number };
export type Triangle = { //troupe
    points : Point[],
    size : number, 
    center : Point ,
    color: string, 
    selected: boolean, 
    destination: Point | null,
    path : Point[],
    isTurning : boolean,
    angle : number
};
export type Circle = { //planete
    center: Point,
    radius: number, 
    color: string, 
    sprite: HTMLImageElement,
    hp : number,
    maxHP : number
};
export type Rectangle = { //Mur (astéroïde)
    x: number,
    y: number,
    width: number,
    height: number,
    color: string
};

export type OurModel = { 
    triangles: Triangle[], 
    circles: Circle[]
    rectangles: Rectangle[],
    startSelec: Point | null,
    endSelec: Point | null,
    canvasheight : number,
    canvaswidth : number,
    events : MouseEvent[],
    grid : GridCell[][]
};


export const initModel = (height : number, width : number): OurModel => {
    return { triangles: [], circles: [], rectangles: [], canvasheight : height, canvaswidth: width, startSelec: null, endSelec: null, events: [], grid: [] };
}

// Fonctions pour creer et ajouter des triangles et cercles dans le modele
const addTriangle = (model: OurModel, triangle: Triangle): OurModel => {
    return {
        triangles: model.triangles.concat(triangle), 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth, 
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events,
        grid : model.grid
    };
}

const addCircle = (model: OurModel, circle: Circle): OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles.concat(circle), 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events,
        grid : model.grid
    };
}

const addRectangle = (model: OurModel, rectangle: Rectangle): OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        rectangles: model.rectangles.concat(rectangle),
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec,
        events: model.events,
        grid : model.grid
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
        const newTriangle = { ...triangle, selected: selected };
        return newTriangle;
    });

    return { 
        triangles: newtriangles, 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: null, 
        endSelec: null, 
        events: model.events,
        grid : model.grid
    };
}

// Réoriente le triangle pour qu'il pointe petit à petit vers sa destination
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
    if (rotationAngle > Math.PI) rotationAngle -= 2 * Math.PI;
    if (rotationAngle < -Math.PI) rotationAngle += 2 * Math.PI;

    /*
    // Normalisez l'angle de rotation dans l'intervalle [-π, π] (on cherche l'angle le plus petit ppour tourner le plus vite)
    const rotationAngle2 = (rotationAngle + Math.PI) % (2 * Math.PI) - Math.PI;
    rotationAngle = rotationAngle < rotationAngle2 ? rotationAngle : rotationAngle2;
    // Appliquez uniquement une petite étape de rotation si la rotation requise est plus grande que l'étape maximale autorisée
    */
    if (Math.abs(rotationAngle) > conf.MAXROTATIONSTEP) {
        rotationAngle = conf.MAXROTATIONSTEP * Math.sign(rotationAngle);
    } else {
        triangle.isTurning = false; // Plus besoin de tourner
    }
    // On stocke le nouvel angle de rotation du sprite
    triangle.angle = angleCurrentTop+rotationAngle+Math.PI/2;

    // Appliquez la rotation à chaque point du triangle
    const newpoints = triangle.points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;

        return {
            x: center.x + dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle),
            y: center.y + dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle)
        };
    });

    return {
        ...triangle,
        points: newpoints,
        // isTurning: Math.abs(rotationAngle) > conf.MAXROTATIONSTEP // Vérifiez si la rotation est toujours nécessaire
        isTurning: triangle.isTurning
    };
}

const moveOrTurnTriangles = (model: OurModel): OurModel => {
    const trianglesToRemove = new Set<Triangle>();  //Set contennant les triangles à supprimer
    const canvasHeight = model.canvasheight;
    const canvasWidth = model.canvaswidth;
    const bounceDistance = conf.TRIANGLESIZE + conf.CELLSIZE; // Distance de rebond pour les triangles

    let newTriangles = model.triangles.map((triangle) => {
        let hasCollided = false; // marqueur de collision

        if (triangle.destination) {  // Ignore les triangles sans destination(immobiles)
            // Calcule le vecteur de vitesse pour le triangle, en direction de sa destination
            const dx = triangle.destination.x - triangle.center.x;
            const dy = triangle.destination.y - triangle.center.y;
            
            const angle = Math.atan2(dy, dx);
            const velocity = {
                x: triangle.destination.x - triangle.center.x,
                y: triangle.destination.y - triangle.center.y
            };
            const velocityMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
            // Normalise le vecteur de vitesse pour obtenir la direction
            const velocityNormalized = {
                x: velocity.x / velocityMagnitude,
                y: velocity.y / velocityMagnitude
            };

            if (triangle.isTurning) {
                triangle = reorientTriangle(triangle);
            }
            else {
                const distance = Math.sqrt(dx * dx + dy * dy);
                //Mise à jour de la position du triangle
                if (distance < 1) {
                    triangle.destination = null;  // Reset destination quand arriver
                } else {
                    const speed = Math.min(conf.TRIANGLEMAXSPEED, distance);
                    const newPoints = triangle.points.map(point => {
                        return { 
                            x: point.x + Math.cos(angle) * speed, 
                            y: point.y + Math.sin(angle) * speed 
                        }
                    });
                    const newCenter = { 
                        x: triangle.center.x + Math.cos(angle) * speed, 
                        y: triangle.center.y + Math.sin(angle) * speed 
                    };
                    triangle.points = newPoints;
                    triangle.center = newCenter;
                }
            }

            const triangleColor = triangle.color;

            model.circles.forEach(circle => {
                if (!hasCollided && coll.checkCollisionWithCircle(triangle, circle)) {
                    if (triangleColor !== circle.color) {
                        circle.hp -= 1; 
                        if (circle.hp <= 0) {
                            circle.color = triangleColor;        
                            const sprite = new Image();                    
                            switch (triangle.color) {
                                case conf.PLAYERCOLOR:
                                    sprite.src = conf.PLAYERPLANETSPRITE;
                                    break;
                                case conf.ENEMYCOLOR1:
                                    sprite.src = conf.ENEMYPLANETSPRITE1;
                                    break;
                                case conf.ENEMYCOLOR2:
                                    sprite.src = conf.ENEMYPLANETSPRITE2;
                                    break;
                                case conf.ENEMYCOLOR3:
                                    sprite.src = conf.ENEMYPLANETSPRITE3;
                                    break;
                                default:
                                    break;
                            }
                            circle.sprite = sprite;
                            circle.hp = circle.maxHP;  // Reset hp
                        }
                        trianglesToRemove.add(triangle);  // Marquage du triangle pour suppression
                    }
                    else { //Si le cercle est de la même couleur que le triangle, il rebondis dessus
                        triangle.destination = {
                            x: triangle.center.x - velocityNormalized.x * bounceDistance,
                            y: triangle.center.y - velocityNormalized.y * bounceDistance
                        };
                        triangle.path = [];  // Reset le path (arrête le mouvement du triangle)
                        triangle.isTurning = false;  // Stop la rotation du triangle en cas de collision

                    }
                    hasCollided = true;  // Set  marqueur de collision à true
                }
            });

            // Vérifie collisions entre triangles si pas encore de collision
            if (!hasCollided) {
                for (let j = 0; j < model.triangles.length; j++) {
                    const triangle2 = model.triangles[j];
                    if (triangle !== triangle2 && triangleColor !== triangle2.color && coll.checkCollisionWithTriangle(triangle, triangle2)) {
                        trianglesToRemove.add(triangle);  // Mark this triangle for removal
                        trianglesToRemove.add(triangle2);  // Mark the other triangle for removal
                        hasCollided = true;  // Set the collision flag
                        break;  // Stop checking once a collision is found
                    }
                }
            }
            // Vérifie les collisions avec les murs
            if (!hasCollided) {
                model.rectangles.forEach(rectangle => {
                    if (coll.checkCollisionWithRectangle(triangle, rectangle)) {
                        // Calculez une nouvelle destination qui est garantie d'être hors du rectangle.
                        // Réinitialise la destination du triangle en le faisant reculer de 30 pixels dans la direction opposée
                        triangle.destination = {
                            x: triangle.center.x - velocityNormalized.x * bounceDistance,
                            y: triangle.center.y - velocityNormalized.y * bounceDistance
                        };
                        triangle.path = [];  // Reset le path (arrête le mouvement du triangle)
                        triangle.isTurning = false;  // Stop la rotation du triangle en cas de collision
                        hasCollided = true;  // Marque la collision
                    }
                });
            }
            // Vérifie les collisions avec les bords si aucune collision n'a encore eu lieu
            if (!hasCollided && coll.checkCollisionWithBorders(triangle, canvasWidth, canvasHeight)) {
                
                // Réinitialise la destination du triangle en le faisant reculer de 30 pixels dans la direction opposée
                triangle.destination = {
                    x: triangle.center.x - velocityNormalized.x * bounceDistance,
                    y: triangle.center.y - velocityNormalized.y * bounceDistance
                };
                triangle.path = [];  // Reset le path (arrête le mouvement du triangle)
                triangle.isTurning = false;  // Stop la rotation du triangle en cas de collision
                hasCollided = true;  // Marque la collision
            }

        }
        return triangle;
    });

    // Filter out triangles marked for removal
    newTriangles = newTriangles.filter(triangle => !trianglesToRemove.has(triangle));

    return {
        ...model,
        triangles: newTriangles,
    };
};

export const setDestinationOfTriangles = (model : OurModel) : OurModel => {
    // Définit la destination et initie le mouvement pour les triangles sélectionnés
    const newtriangles = model.triangles.map(triangle => {
        if (!triangle.destination) {
            const newDest = triangle.path.length > 0 ? triangle.path[0] : null;
            const newpath = triangle.path.length > 0 ? triangle.path.slice(1) : [];
            return{ 
                ...triangle,
                destination: newDest, 
                path: newpath, 
                isTurning: true
            };
        }
        return triangle;
    });
    
    return {
        ...model,
        triangles: newtriangles
    };
}

export const winGame = (model : OurModel) : boolean => {
    const colors = model.circles.map(circle => circle.color);
    return colors.every(color => color === conf.PLAYERCOLOR || color === conf.UNHABITEDPLANETCOLOR);
}

export const loseGame = (model : OurModel) : boolean => {
    const colors = model.circles.map(circle => circle.color);
    return colors.every(color => color !== conf.PLAYERCOLOR);
}


/*******************************************************************
     *  Fonction de génération de triangles(troupes) autour des cercles
*******************************************************************/
const generateTriangleNearCircle = (model: OurModel, circle: Circle): OurModel => {
    const distToCircle = circle.radius+ 40; // Distance from the circle where the triangle will be generated
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
        destination : null,
        path : [],
        isTurning : false,
        angle : 0
    };

    return addTriangle(model, triangle);
}

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
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events,
        grid : model.grid
    };
}

/*******************************************************************
     * Fonction pour la gestion du modèle
*******************************************************************/
export const updateModel = (model : OurModel) : OurModel => {
    let newModel = executeEvents(model);
    newModel = setDestinationOfTriangles(newModel);
    //newModel = turnTriangles(newModel);
    return moveOrTurnTriangles(newModel);
}

/*******************************************************************
     * Fonctions pour creer des planètes
*******************************************************************/
const addSmallPlanet = (model : OurModel, point : Point, color : string, sprite : HTMLImageElement) : OurModel => {
    const radius = conf.SMALLPLANETRADIUS;
    const center = point;
    const colorP = color;
    const spriteP = sprite;
    const hp = conf.SMALLPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, sprite: spriteP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}

const addMediumPlanet = (model : OurModel, point : Point, color : string, sprite : HTMLImageElement) : OurModel => {
    const radius = conf.MEDIUMPLANETRADIUS;
    const center = point;
    const colorP = color;
    const spriteP = sprite;
    const hp = conf.MEDIUMPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, sprite: spriteP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}

const addBigPlanet = (model : OurModel, point : Point, color : string, sprite : HTMLImageElement) : OurModel => {
    const radius = conf.BIGPLANETRADIUS;
    const center = point;
    const colorP = color;
    const spriteP = sprite;
    const hp = conf.BIGPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: colorP, sprite: spriteP, hp: hp, maxHP: hp};
    return addCircle(model, circle);
}


/*******************************************************************
     *  Fonction de tests, génération de triangles et cercles
*******************************************************************/
const generateTriangles = (model : OurModel, height : number, width : number, number : number) : OurModel => {
    for (let i = 0; i < number; i++) {
        const x = 20 + Math.random() * (width-50);
        const y = 20 + Math.random() * (height-50);
        const size = conf.TRIANGLESIZE;
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
            destination : null,
            path : [],
            isTurning : false,
            angle : 0
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
    const sprite = new Image();
    sprite.src = conf.ENEMYPLANETSPRITE1;
    const hp = conf.BIGPLANETLIFE;
    const circle : Circle = { center: center, radius: radius, color: color, sprite: sprite, hp: hp, maxHP: hp};
    model = addCircle(model, circle);
    
    const x2 = 300;
    const y2 = 300;
    const radius2 = conf.BIGPLANETRADIUS;
    const center2 = { x: x2, y: y2 };
    const color2 = conf.PLAYERCOLOR;
    const sprite2 = new Image();
    sprite.src = conf.PLAYERPLANETSPRITE;
    const hp2 = conf.BIGPLANETLIFE;
    const circle2 : Circle = { center: center2, radius: radius2, color: color2, sprite: sprite2, hp: hp2, maxHP: hp2};
    model = addCircle(model, circle2);

    return model;
}

export const createGameTest = (height : number, width : number) => {
    let model = initModel(height, width);
    //model = generateTriangles(model, height, width, 1);
    const sprite1 = new Image();
    const sprite2 = new Image();
    const sprite3 = new Image();
    const sprite4 = new Image();
    const sprite5 = new Image();
    sprite1.src = conf.PLAYERPLANETSPRITE;
    sprite2.src = conf.ENEMYPLANETSPRITE1;
    sprite3.src = conf.ENEMYPLANETSPRITE2;
    sprite4.src = conf.ENEMYPLANETSPRITE3;
    sprite5.src = conf.UNHABITEDPLANETSPRITE;

    model = addBigPlanet(model, { x: width-120 , y: 120 }, conf.PLAYERCOLOR, sprite1);
    model = addBigPlanet(model, { x: width-120, y: height-120 }, conf.ENEMYCOLOR1, sprite2);
    model = addBigPlanet(model, { x: 120, y: 120 }, conf.ENEMYCOLOR2, sprite3);
    model = addBigPlanet(model, { x: 120, y: height-120 }, conf.ENEMYCOLOR3, sprite4);

    model = addMediumPlanet(model, { x: width-250 , y: 250 }, conf.PLAYERCOLOR, sprite1);
    model = addMediumPlanet(model, { x: width-250, y: height-250 }, conf.ENEMYCOLOR1, sprite2);
    model = addMediumPlanet(model, { x: 250, y: 250 }, conf.ENEMYCOLOR2, sprite3);
    model = addMediumPlanet(model, { x: 250, y: height-250 }, conf.ENEMYCOLOR3, sprite4);

    model = addMediumPlanet(model, { x: width-120 , y: 300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: width-120, y: height-300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: 120, y: 300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: 120, y: height-300 }, conf.UNHABITEDPLANETCOLOR, sprite5);

    model = addMediumPlanet(model, { x: width-300 , y: 100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: width-300, y: height-100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: 300, y: 100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addMediumPlanet(model, { x: 300, y: height-100 }, conf.UNHABITEDPLANETCOLOR, sprite5);

    model = addSmallPlanet(model, { x: width-500 , y: 100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: width-500, y: height-100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: 500, y: 100 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: 500, y: height-100 }, conf.UNHABITEDPLANETCOLOR, sprite5);

    model = addSmallPlanet(model, { x: width-425 , y: 300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: width-425, y: height-300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: 425, y: 300 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: 425, y: height-300 }, conf.UNHABITEDPLANETCOLOR, sprite5);


    const midx = width/2;
    const midy = height/2;
    model = addSmallPlanet(model, { x: midx-120, y: 550 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: midx+120, y: 550 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: midx+120, y: height-550 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    model = addSmallPlanet(model, { x: midx-120, y: height-550 }, conf.UNHABITEDPLANETCOLOR, sprite5);
    

    model = addBigPlanet(model, { x: midx, y: midy }, conf.UNHABITEDPLANETCOLOR, sprite5);

    model = addRectangle(model, { x: midx-50, y: 0, width: 100, height: midy-150, color: 'lightgrey' });
    model = addRectangle(model, { x: midx-50, y: midy+150, width:100, height: midy-150, color: 'lightgrey' });
    model = addRectangle(model, { x: 0, y: midy-25, width: midx-500, height: 50, color: 'lightgrey' });
    model = addRectangle(model, { x: midx+500, y: midy-25, width: midx-500, height: 50, color: 'lightgrey' });

    model = addRectangle(model, { x: 525, y: midy-100, width: 50, height: 200, color: 'lightgrey' });
    model = addRectangle(model, { x: width-575, y: midy-100, width: 50, height: 200, color: 'lightgrey' });
    
    model.grid = createGrid(model); // Create the grid for pathfinding
    
    return model;
}


