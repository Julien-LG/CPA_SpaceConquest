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
    isTurning : boolean
};
export type Circle = { //planete
    center: Point,
    radius: number, 
    color: string, 
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
        ...model,
        triangles: model.triangles.concat(triangle), 
    };
}

const addCircle = (model: OurModel, circle: Circle): OurModel => {
    return { 
        ...model,
        circles: model.circles.concat(circle), 
    };
}

const addRectangle = (model: OurModel, rectangle: Rectangle): OurModel => {
    return { 
        ...model, 
        rectangles: model.rectangles.concat(rectangle),
    };
}

/*******************************************************************
     * Fonctions de séléction et déplacement des triangles
*******************************************************************/
const calculateSeparationForce = (triangle: Triangle, neighbors: Triangle[], separationDistance: number) => {
    let force = { x: 0, y: 0 };
    let count = 0;

    // Parcourez chaque voisin pour calculer la force de séparation
    neighbors.forEach(neighbor => {
        const dx = triangle.center.x - neighbor.center.x;
        const dy = triangle.center.y - neighbor.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Appliquez la force uniquement si le voisin est suffisamment proche mais non superposé
        if (distance > 0 && distance < separationDistance) {
            // Normalise la direction de la force pour s'éloigner du voisin
            const length = Math.sqrt(dx * dx + dy * dy);
            const awayX = dx / length;
            const awayY = dy / length;

            // Plus le voisin est proche, plus la force est grande
            force.x += awayX / distance;
            force.y += awayY / distance;
            count++;
        }
    });

    // Si des voisins proches ont été trouvés, normalisez la force résultante
    if (count > 0) {
        force.x /= count;
        force.y /= count;

        // Normaliser la force pour qu'elle ait une magnitude fixe
        const magnitude = Math.sqrt(force.x * force.x + force.y * force.y);
        if (magnitude > 0) {
            force.x = (force.x / magnitude) * conf.SEPARATION_FORCE;
            force.y = (force.y / magnitude) * conf.SEPARATION_FORCE;
        }
    }

    return force;
};


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

// Réoriente le triangle pour qu'il pointe progressivement vers sa destination
const reorientTriangle = (triangle : Triangle) : Triangle => {
    const center = triangle.center; // Utilise le centre précalculé pour la rotation
    const destination = triangle.destination;

    // Si aucune destination n'est définie, retourne le triangle sans modification
    if (!destination) return triangle; //n'est pas sensé arriver dans cete fonctions

    // Calcule l'angle de direction vers la destination
    const angleToDestination = Math.atan2(destination.y - center.y, destination.x - center.x);

    // Calcule l'angle actuel du sommet supérieur par rapport au centre
    const currentTop = triangle.points[0]; // Le sommet supérieur est toujours le premier point
    const angleCurrentTop = Math.atan2(currentTop.y - center.y, currentTop.x - center.x);

    // Calcule l'angle de rotation nécessaire
    let rotationAngle = angleToDestination - angleCurrentTop;
    if (rotationAngle > Math.PI) rotationAngle -= 2 * Math.PI;
    if (rotationAngle < -Math.PI) rotationAngle += 2 * Math.PI;

    // Normalise l'angle de rotation dans l'intervalle [-π, π]
    // rotationAngle = (rotationAngle + Math.PI) % (2 * Math.PI) - Math.PI;

    // Applique uniquement une petite étape de rotation si la rotation requise est plus grande que l'étape maximale autorisée
    if (Math.abs(rotationAngle) > conf.MAXROTATIONSTEP) {
        rotationAngle = conf.MAXROTATIONSTEP * Math.sign(rotationAngle);
        // triangle.isTurning = true; // Continue de tourner
    } else {
        triangle.isTurning = false; // Plus besoin de tourner
    }

    // Applique la rotation à chaque point du triangle
    const newPoints = triangle.points.map(point => {
        const dx = point.x - center.x;
        const dy = point.y - center.y;

        return {
            x: center.x + dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle),
            y: center.y + dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle)
        };
    });

    return {
        ...triangle,
        points: newPoints,
        isTurning: triangle.isTurning
    }
}

// Fonction pour faire correctement rebondir le triangle
const reboundTriangle = (triangle : Triangle, velocityNormalized : Point, bounceDistance : number) => {
    // Calculer la direction du rebond
    triangle.destination = {
        x: triangle.center.x - velocityNormalized.x * bounceDistance,
        y: triangle.center.y - velocityNormalized.y * bounceDistance
    };
    triangle.path = []; // Réinitialiser le chemin du triangle
    triangle.isTurning = true; // Assurer que le triangle continue de s'orienter correctement après le rebond

    // Réorienter immédiatement vers la nouvelle direction
    reorientTriangle(triangle);
}

// Fonctions pour le mouvement des triangles (décision + action)
const moveOrTurnTriangles = (model: OurModel): OurModel => {
    const trianglesToRemove = new Set<Triangle>(); // Ensemble contenant les triangles à supprimer
    const canvasHeight = model.canvasheight;
    const canvasWidth = model.canvaswidth;
    const bounceDistance = conf.TRIANGLESIZE + conf.CELLSIZE; // Distance de rebond pour les triangles
    const separationDistance = conf.SEPARATION_DISTANCE;

    let newTriangles = model.triangles.map(triangle => {
        let hasCollided = false; // Indicateur de collision
        let neighbors = model.triangles.filter(t => 
            t !== triangle); //On considère tous les autres triangles comme voisins

        if (triangle.destination) {
            const separationForce = calculateSeparationForce(triangle, neighbors, separationDistance);

            let dx = triangle.destination.x - triangle.center.x + separationForce.x;
            let dy = triangle.destination.y - triangle.center.y + separationForce.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const velocityNormalized = {
                x: dx / distance,
                y: dy / distance
            };

            // Le triangle tourne vers sa destination
            if (triangle.isTurning) {
                triangle = reorientTriangle(triangle); // Réoriente progressivement le triangle
            }

            // Si la distance est infime, arrête le mouvement vers la destination
            if (distance < 1) {
                triangle.destination = null; // Arrête le triangle s'il est assez proche de la destination
                triangle.isTurning = false; // Arrête la rotation du triangle
            } else {
                // Déplace le triangle vers sa destination s'il n'est pas trop proche
                const speed = Math.min(conf.TRIANGLEMAXSPEED, distance);
                triangle.points = triangle.points.map(point => ({
                    x: point.x + velocityNormalized.x * speed,
                    y: point.y + velocityNormalized.y * speed
                }));
                triangle.center = {
                    x: triangle.center.x + velocityNormalized.x * speed,
                    y: triangle.center.y + velocityNormalized.y * speed
                };
            }

            // Gestion des collisions
            model.circles.forEach(circle => {
                if (!hasCollided && coll.checkCollisionWithCircle(triangle, circle)) {
                    console.log("Collision avec un cercle");
                    if (triangle.color !== circle.color) {
                        circle.hp -= 1;
                        if (circle.hp <= 0) {
                            circle.color = triangle.color; // Change la couleur du cercle
                            circle.hp = circle.maxHP; // Réinitialise la santé du cercle
                        }
                        trianglesToRemove.add(triangle);
                    } else {
                        reboundTriangle(triangle, velocityNormalized, bounceDistance);
                    }
                    hasCollided = true; // Marque la collision
                }
            });

            // Vérifie collisions entre triangles si pas encore de collision
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
            model.rectangles.forEach(rectangle => {
                if (!hasCollided && coll.checkCollisionWithRectangle(triangle, rectangle)) {
                    console.log("Collision avec un mur");
                    reboundTriangle(triangle, velocityNormalized, bounceDistance); // Fait rebondir le triangle
                    hasCollided = true; // Marque la collision
                }
            });

            if (!hasCollided && coll.checkCollisionWithBorders(triangle, canvasWidth, canvasHeight)) {
                console.log("Collision avec les bords");
                reboundTriangle(triangle, velocityNormalized, bounceDistance); // Fait rebondir le triangle
                hasCollided = true; // Marque la collision
            }
        }
        return triangle;
    });

    // Filtre les triangles marqués pour être supprimés
    newTriangles = newTriangles.filter(triangle => !trianglesToRemove.has(triangle));

    return {
        ...model,
        triangles: newTriangles,
    };
};

// Fonction permettant l'avancement des étapes de déplacement des triangles
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

/*******************************************************************
     *  Fonctions de gestion du jeu
*******************************************************************/

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
        isTurning : false
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
        ...model,
        circles: newCircles, 
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
            isTurning : false
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
    //model = generateTriangles(model, height, width, 1);

    model = addBigPlanet(model, { x: width-120 , y: 120 }, conf.PLAYERCOLOR);
    model = addBigPlanet(model, { x: width-120, y: height-120 }, conf.ENEMYCOLOR1);
    model = addBigPlanet(model, { x: 120, y: 120 }, conf.ENEMYCOLOR2);
    model = addBigPlanet(model, { x: 120, y: height-120 }, conf.ENEMYCOLOR3);

    model = addMediumPlanet(model, { x: width-250 , y: 250 }, conf.PLAYERCOLOR);
    model = addMediumPlanet(model, { x: width-250, y: height-250 }, conf.ENEMYCOLOR1);
    model = addMediumPlanet(model, { x: 250, y: 250 }, conf.ENEMYCOLOR2);
    model = addMediumPlanet(model, { x: 250, y: height-250 }, conf.ENEMYCOLOR3);

    model = addMediumPlanet(model, { x: width-120 , y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: width-120, y: height-300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 120, y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 120, y: height-300 }, conf.UNHABITEDPLANETCOLOR);

    model = addMediumPlanet(model, { x: width-300 , y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: width-300, y: height-100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 300, y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addMediumPlanet(model, { x: 300, y: height-100 }, conf.UNHABITEDPLANETCOLOR);

    model = addSmallPlanet(model, { x: width-500 , y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: width-500, y: height-100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: 100 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 500, y: height-100 }, conf.UNHABITEDPLANETCOLOR);

    model = addSmallPlanet(model, { x: width-425 , y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: width-425, y: height-300 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 425, y: 300 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: 425, y: height-300 }, conf.UNHABITEDPLANETCOLOR);


    const midx = width/2;
    const midy = height/2;
    model = addSmallPlanet(model, { x: midx-120, y: 550 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx+120, y: 550 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx+120, y: height-550 }, conf.UNHABITEDPLANETCOLOR);
    model = addSmallPlanet(model, { x: midx-120, y: height-550 }, conf.UNHABITEDPLANETCOLOR);
    

    model = addBigPlanet(model, { x: midx, y: midy }, conf.UNHABITEDPLANETCOLOR);

    model = addRectangle(model, { x: midx-50, y: 0, width: 100, height: midy-150, color: 'lightgrey' });
    model = addRectangle(model, { x: midx-50, y: midy+150, width:100, height: midy-150, color: 'lightgrey' });
    model = addRectangle(model, { x: 0, y: midy-25, width: midx-500, height: 50, color: 'lightgrey' });
    model = addRectangle(model, { x: midx+500, y: midy-25, width: midx-500, height: 50, color: 'lightgrey' });

    model = addRectangle(model, { x: 525, y: midy-100, width: 50, height: 200, color: 'lightgrey' });
    model = addRectangle(model, { x: width-575, y: midy-100, width: 50, height: 200, color: 'lightgrey' });
    
    model.grid = createGrid(model); // Create the grid for pathfinding
    
    return model;
}


