import { OurModel, Circle, Point, setDestinationEnemy } from './model';
import { pathfinding } from './pathFinding';
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


/**************************************************
 * Fonctions pour les IA (Pas très complexe)
 *************************************************/
// Attaque la planète la plus proche 
export const directTrianglesToNearestPlanet = (model: OurModel, enemyColor: string): OurModel => {
    const enemyPlanets = model.circles.filter(circle => circle.color === enemyColor);

    if (enemyPlanets.length === 0) {
        return model; // No enemy planets to calculate centroid
    }

    const centroid = calculateCentroid(enemyPlanets);

    const nearestPlanet = model.circles
        .filter(circle => circle.color !== enemyColor)
        .reduce((closest, current) => {
            const closestDistance = calculateDistance(centroid.x, centroid.y, closest.center.x, closest.center.y);
            const currentDistance = calculateDistance(centroid.x, centroid.y, current.center.x, current.center.y);
            return currentDistance < closestDistance ? current : closest;
    });
    const destination = { x: nearestPlanet.center.x, y: nearestPlanet.center.y };
    let newModel = pathfinding(model, destination, conf.PLAYERCOLOR);
    newModel = setDestinationEnemy(newModel, enemyColor);
    
    return newModel;
};

// Attaque la planète ennemie la plus faible et la plus proche
export const directTrianglesToWeakestClosestEnemy = (model: OurModel, enemyColor: string): OurModel => {
    const enemyPlanets = model.circles.filter(circle => circle.color === enemyColor);

    if (enemyPlanets.length === 0) {
        return model; // No enemy planets to calculate centroid
    }

    const centroid = calculateCentroid(enemyPlanets);

    const nearestAndWeakestHabitedPlanet = model.circles.filter(circle => circle.color !== enemyColor && circle.color !== conf.UNHABITEDPLANETCOLOR)
        .reduce((closest, current) => {
            const closestDistance = calculateDistance(centroid.x, centroid.y, closest.center.x, closest.center.y);
            const currentDistance = calculateDistance(centroid.x, centroid.y, current.center.x, current.center.y);
            if (currentDistance < closestDistance) {
                return current;
            } else if (currentDistance === closestDistance) {
                return closest.hp < current.hp ? closest : current;
            }
            return closest;
        });
    const destination = { x: nearestAndWeakestHabitedPlanet.center.x, y: nearestAndWeakestHabitedPlanet.center.y };
    let newModel = pathfinding(model, destination, conf.PLAYERCOLOR);
    newModel = setDestinationEnemy(newModel, enemyColor);
    
    return newModel;
};
