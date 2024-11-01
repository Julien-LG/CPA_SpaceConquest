import { OurModel, Point, Circle, selectTrianglesInArea} from './model';
import { findPath } from './pathFinding';
import * as conf from './../config';


/*******************************************************************
     * Fonctions auxiliaires pour les événements
*******************************************************************/
const pointInCircle = (point : Point, circle : Circle) : boolean => {
    return (point.x - circle.center.x) ** 2 + (point.y - circle.center.y) ** 2 < circle.radius ** 2;
}
const findTarget = (model : OurModel, destination : Point) : Circle => {
    // Trouve la planète la plus proche de la destination
    const circles = model.circles;
    let target = { 
        center: { x: destination.x, y: destination.y },
        radius: 0,
        color: 'black',
        hp: 0
    } as Circle; //Cercle fictif pour stocker la destination et evité de transmettre plusieur valeur a findpath
    circles.forEach(circle => {
        if (pointInCircle(destination, circle)) target = circle;
    });
 
    return target;
}

/*******************************************************************
     * Fonctions pour les événements
*******************************************************************/
const setPathSelected = (model : OurModel, destination : Point) : OurModel => {
    // Définit la destination et initie le mouvement pour les triangles sélectionnés
    const newtriangles = model.triangles.map(triangle => {
        if (triangle.selected) {
            const grid = model.grid;
            const target = findTarget(model, destination);
            const newPath = findPath(grid, { x: triangle.center.x, y: triangle.center.y }, target, true);
            
            return {
                ...triangle,
                path: newPath.length > 0  ? newPath : triangle.path,
                destination : newPath.length > 0  ? null : triangle.destination
            };
        }
        return triangle;
    });
    
    return {
        ...model,
        triangles: newtriangles
    };
}

const onleftclick = (model : OurModel, destination : Point) : OurModel => {
    return setPathSelected(model, destination);
}

// Double click gauche pour selectionner tous les triangles de la couleur du joueur
const ondoubleclick = (model : OurModel) : OurModel => {
    const newtriangles = model.triangles.map(triangle => {

        return triangle.color === conf.PLAYERCOLOR ? {
            ...triangle,
            selected : true
        } : triangle;
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
        grid: model.grid
    };
}

const onrightclick = (model : OurModel) : OurModel => {
    const newtriangles = model.triangles.map(triangle => {
        return triangle.selected ? {
            ...triangle,
            selected : false
        } : triangle;
    });
    return { 
        triangles: newtriangles, 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events,
        grid: model.grid
    };
}

const onmousedown = (model : OurModel, start : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: start, 
        endSelec: null, 
        events: model.events,
        grid: model.grid
    };
}

const onmousemove = (model : OurModel, end : Point) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: end, 
        events: model.events,
        grid: model.grid
    };
}

const onmouseup = (model : OurModel) : OurModel => {
    return selectTrianglesInArea(model);
}

export const executeEvents = (model : OurModel) : OurModel => {
    const newmodel = model.events.reduce((acc, event) => {
        switch (event.type) {
            case 'click':
                if(event.detail === 2){
                    //console.log("double left click")
                    return ondoubleclick(acc);
                }else {
                    //console.log("left click");
                    return onleftclick(acc, { x: event.offsetX, y: event.offsetY });
                }
            case 'contextmenu':
                //console.log("right click");
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
        rectangles: newmodel.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: newmodel.startSelec, 
        endSelec: newmodel.endSelec, 
        events: [],
        grid: newmodel.grid
    };
}

export const addEvent = (model : OurModel, event : MouseEvent) : OurModel => {
    return { 
        triangles: model.triangles, 
        circles: model.circles, 
        rectangles: model.rectangles,
        canvasheight : model.canvasheight,
        canvaswidth : model.canvaswidth,
        startSelec: model.startSelec, 
        endSelec: model.endSelec, 
        events: model.events.concat(event),
        grid : model.grid
    };
}