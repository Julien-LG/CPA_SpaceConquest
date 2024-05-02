import { OurModel, Circle, Point } from './model';
import { findPath } from './pathFinding';
import * as conf from '../config';

// Calcul la distance entre deux points, on ne prend pas la racine carrée pour éviter de faire une opération coûteuse (les comparaison de distance restent valides)
export const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2);
};
const calculateCentroid = (planets: Circle[]): Point => {
    const total = planets.reduce((acc, planet) => {
        acc.x += planet.center.x;
        acc.y += planet.center.y;
        return acc;
    }, { x: 0, y: 0 });

    return {
        x: total.x / planets.length,
        y: total.y / planets.length
    };
};

// Déploie les forces vers une destination spécifiée, en utilisant la moitié ou toutes les troupes.
const deployForces = (model: OurModel, color: string, destination: Point, destination2?: Point) => {
    const triangles = model.triangles.filter(triangle => triangle.color === color && !triangle.destination);
    const circlesOfSameColor = model.circles.filter(circle => circle.color === color);
    
    if (destination2) {
        const troopCount = Math.ceil(triangles.length / 2);
        // console.log('troopCount:', troopCount);
        // console.log('length:', triangles.length);
        //console.log('destination:', destination);
        //console.log('destination2:', destination2);
        const selectedTriangles = triangles.slice(0, troopCount);
        selectedTriangles.forEach(triangle => {
            let grid = model.grid;
            console.log('destination:', destination);
            const path = findPath(grid, { x: triangle.center.x, y: triangle.center.y }, destination, circlesOfSameColor);
            triangle.path = path;
        });
        const selectedTriangles2 = triangles.slice(troopCount);
        selectedTriangles2.forEach(triangle => {
            let grid = model.grid;
            console.log('destination2:', destination2);
            const path = findPath(grid, { x: triangle.center.x, y: triangle.center.y }, destination2, circlesOfSameColor);
            triangle.path = path;
        });
    }
    else {
        triangles.forEach(triangle => {
            let grid = model.grid;
            const path = findPath(grid, { x: triangle.center.x, y: triangle.center.y }, destination, circlesOfSameColor);
            triangle.path = path;
        });
    }
    return { ...model};
};

/**************************************************
 * Fonctions pour les IA (Pas très complexe)
 *************************************************/
// // Attaque la planète la plus proche 
// export const directTrianglesToNearestPlanet = (model: OurModel, color: string): OurModel => {
//     const conttrolledPlanets = model.circles.filter(circle => circle.color === color);

//     if (conttrolledPlanets.length === 0) {
//         return model; // No enemy planets to calculate centroid
//     }

//     const centroid = calculateCentroid(conttrolledPlanets);

//     const nearestPlanet = model.circles
//         .filter(circle => circle.color !== color)
//         .reduce((closest, current) => {
//             const closestDistance = calculateDistance(centroid.x, centroid.y, closest.center.x, closest.center.y);
//             const currentDistance = calculateDistance(centroid.x, centroid.y, current.center.x, current.center.y);
//             return currentDistance < closestDistance ? current : closest;
//     });
//     const destination = { x: nearestPlanet.center.x, y: nearestPlanet.center.y };
//     let newModel = pathfinding(model, destination, color);

//     return newModel;
// };


// // Attaque la planète ennemie la plus proche ayant le moins de points de santé
// export const directTrianglesToWeakestAndClosest = (model: OurModel, color: string): OurModel => {
//     const conttrolledPlanets = model.circles.filter(circle => circle.color === color);

//     if (conttrolledPlanets.length === 0) {
//         return model; // No enemy planets to calculate centroid
//     }

//     const centroid = calculateCentroid(conttrolledPlanets);

//     // Trouve la planète ennemie la plus proche et ayant le moins de points de santé
//     const weakestClosestPlanet = model.circles
//     .filter(circle => circle.color !== color).reduce((weakest, current) => {
//         const weakestDistance = calculateDistance(centroid.x, centroid.y, weakest.center.x, weakest.center.y);
//         const currentDistance = calculateDistance(centroid.x, centroid.y, current.center.x, current.center.y);
//         const weakestScore = weakest.hp + weakestDistance;
//         const currentScore = current.hp + currentDistance;

//         return currentScore < weakestScore ? current : weakest;
//     });

//     const destination = { x: weakestClosestPlanet.center.x, y: weakestClosestPlanet.center.y };
//     let newModel = pathfinding(model, destination, color);
    
//     return newModel;
// };

// // Attaque la planète ennemie la plus faible et la plus proche
// export const directTrianglesToWeakestClosestEnemy = (model: OurModel, color: string): OurModel => {
//     const enemyPlanets = model.circles.filter(circle => circle.color === color);

//     if (enemyPlanets.length === 0) {
//         return model; // No enemy planets to calculate centroid
//     }

//     const centroid = calculateCentroid(enemyPlanets);

//     const nearestAndWeakestHabitedPlanet = model.circles.filter(circle => circle.color !== color && circle.color !== conf.UNHABITEDPLANETCOLOR)
//         .reduce((closest, current) => {
//             const closestDistance = calculateDistance(centroid.x, centroid.y, closest.center.x, closest.center.y);
//             const currentDistance = calculateDistance(centroid.x, centroid.y, current.center.x, current.center.y);
//             if (currentDistance < closestDistance) {
//                 return current;
//             } else if (currentDistance === closestDistance) {
//                 return closest.hp < current.hp ? closest : current;
//             }
//             return closest;
//         });
//     const destination = { x: nearestAndWeakestHabitedPlanet.center.x, y: nearestAndWeakestHabitedPlanet.center.y };
//     let newModel = pathfinding(model, destination, color);
    
//     return newModel;
// };



/**************************************************
 * Fonctions pour les IA (Un peu plus complexe)
 *************************************************/
// Identifie les actions stratégiques basées sur le nombre de planètes contrôlées et les cibles disponibles.
export const directTrianglesToStrategicTarget = (model: OurModel, color: string): OurModel => {
    const nbcontrolledPlanets = model.circles.filter(circle => circle.color === color).length;
    const unhabitedPlanets = model.circles.filter(circle => circle.color === conf.UNHABITEDPLANETCOLOR);
    const enemyPlanets = model.circles.filter(circle => circle.color !== color && circle.color !== conf.UNHABITEDPLANETCOLOR);


    if (nbcontrolledPlanets < 4 && unhabitedPlanets.length > 0) {
        // Cible la planète inhabitée la plus proche pour expansion si contrôle <= 4 planètes.
        const dest =  targetClosestPlanet(model, color, unhabitedPlanets);
        return deployForces(model, color, dest);
    } else {
        const targetPlanet = unhabitedPlanets.length > 0 ? unhabitedPlanets : enemyPlanets;
        // Divise les forces si plus de 4 planètes sont contrôlées.
        const dest1 = targetClosestPlanet(model, color, targetPlanet);
        const dest2 = targetClosestANdWeakestEnemyPlanet(model, color, enemyPlanets);
        console.log('dest1:', dest1);
        console.log('dest2:', dest2);
        return deployForces(model, color, dest1, dest2); 
    }
};

// Cible la planète inhabitée la plus proche, optionnellement en utilisant toutes les troupes.
const targetClosestPlanet = (model: OurModel, color: string, unhabitedPlanets: Circle[]): Point => {
    const centroid = calculateCentroid(model.circles.filter(c => c.color === color));
    const closestUnhabited = unhabitedPlanets.reduce((closest, planet) => {
        const distance = calculateDistance(centroid.x, centroid.y, planet.center.x, planet.center.y);
        return (distance < closest.distance) ? { planet, distance } : closest;
    }, { planet: unhabitedPlanets[0], distance: Infinity }).planet;

    return { x: closestUnhabited.center.x, y: closestUnhabited.center.y };
};
// Cible la planète inhabitée la plus proche, optionnellement en utilisant toutes les troupes.
const targetClosestANdWeakestEnemyPlanet = (model: OurModel, color: string, enemyPlanets: Circle[]): Point => {
    const centroid = calculateCentroid(model.circles.filter(c => c.color === color));
    // Réduction pour trouver la planète ennemie la plus faible et la plus proche en utilisant un score qui balance la distance et la santé.
    const closestAndWeakestEnemy = enemyPlanets.reduce((closest, planet) => {
        const distance = calculateDistance(centroid.x, centroid.y, planet.center.x, planet.center.y);
        // Création d'un score qui intègre à la fois la distance et la santé (moins de santé et plus proche = score plus bas).
        const score = distance + planet.hp; // Modifier le coefficient pour la santé si nécessaire pour ajuster l'importance relative.
        return (score < closest.score) ? { planet, score } : closest;
    }, { planet: enemyPlanets[0], score: Infinity }).planet;

    return { x: closestAndWeakestEnemy.center.x, y: closestAndWeakestEnemy.center.y };
};









