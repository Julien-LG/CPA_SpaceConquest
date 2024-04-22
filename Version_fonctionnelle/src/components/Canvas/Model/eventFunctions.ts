import { OurModel, Point, reorientTriangle, selectTrianglesInArea} from './model';
import * as conf from './../config';


/*******************************************************************
     * Fonctions pour les événements
*******************************************************************/
const setDestinationSelected = (model : OurModel, destination : Point) : OurModel => {
    // Définit la destination et initie le mouvement pour les triangles sélectionnés
    const newtriangles = model.triangles.map(triangle => {
        if (triangle.selected) {
            return reorientTriangle(
                {points : triangle.points, 
                    size : triangle.size, 
                    center : triangle.center, 
                    color : triangle.color, 
                    selected : triangle.selected, 
                    destination : destination,
                    path : triangle.path
                });
        }
        return triangle;
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
            destination : triangle.destination,
            path : triangle.path
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
            points : triangle.points, 
            size : triangle.size,
            center : triangle.center,
            color : triangle.color,
            selected : false,
            destination : triangle.destination,
            path : triangle.path
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