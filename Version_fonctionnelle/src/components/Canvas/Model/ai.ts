import { OurModel, Circle, Triangle, setDestinationEnemy } from './model';
import * as conf from '../conf';

// Calcul la distance entre deux points, on ne prend pas la racine carrée pour éviter de faire une opération coûteuse (les comparaison de distance restent valides)
const calculateDistance = (x1: number, y1: number, x2: number, y2: number): number => {
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

// Attaque la planète la plus proche 
export const directTrianglesToNearestPlanet = (model: OurModel, enemyColor: string): OurModel => {
    model.circles.forEach(circle => {
        if (circle.color === enemyColor) {
            const target = model.circles
                .filter(c => c.color !== enemyColor)
                .reduce((prev, curr) => calculateDistance(circle.center.x, circle.center.y, prev.center.x, prev.center.y) < calculateDistance(circle.center.x, circle.center.y, curr.center.x, curr.center.y) ? prev : curr);

            const destination = { x: target.center.x, y: target.center.y };
            model = setDestinationEnemy(model, destination, enemyColor);
        }
    });
    return model;
};

// Attaque la planète ennemie la plus faible et la plus proche
export const directTrianglesToWeakestClosestEnemy = (model: OurModel, enemyColor: string): OurModel => {
    model.circles.forEach(circle => {
        if (circle.color === enemyColor) {
            const target = model.circles
                .filter(c => c.color !== enemyColor && c.color !== conf.UNHABITEDPLANETCOLOR)
                .sort((a, b) => {
                    const distA = calculateDistance(circle.center.x, circle.center.y, a.center.x, a.center.y);
                    const distB = calculateDistance(circle.center.x, circle.center.y, b.center.x, b.center.y);
                    return distA !== distB ? distA - distB : a.hp - b.hp;
                })[0];

           
            const destination = { x: target.center.x, y: target.center.y };
            model = setDestinationEnemy(model, destination, enemyColor);
        }
    });
    return model;
};
