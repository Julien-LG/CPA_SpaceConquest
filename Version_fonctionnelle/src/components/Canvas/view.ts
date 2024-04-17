import {Triangle, Circle, OurModel} from './Model/model';

export type ViewRender = {
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
};

export const initView = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        throw new Error('Impossible de récupérer le contexte 2D du canvas');
    }
    canvas.style.backgroundColor = 'black';
    const view: ViewRender = { canvas, ctx };
    return view;
};

const drawTriangle = (ctx: CanvasRenderingContext2D, triangle: Triangle) => {
    // Dessine un triangle sur le canvas
    ctx.beginPath();
    ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
    triangle.points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    ctx.fillStyle = triangle.color;
    ctx.fill();

    // Si le triangle est slectionné, dessine un contour orange
    if (triangle.selected) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 3; 
        ctx.stroke(); // Dessine le contour
    }
    else {
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1; 
        ctx.stroke(); // Dessine le contour
    }
}

const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    // Dessine un cercle sur le canvas
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
    ctx.fillStyle = circle.color;
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`HP: ${circle.hp}`, circle.center.x - 20, circle.center.y + 5);

    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 1.5; 
    ctx.stroke(); // Dessine le contour
}

const drawSelectionArea = (ctx: CanvasRenderingContext2D, model: OurModel) => {
    const { startSelec, endSelec } = model;
    if (startSelec && endSelec) {
        ctx.beginPath();
        ctx.rect(startSelec.x, startSelec.y, endSelec.x - startSelec.x, endSelec.y - startSelec.y);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 3; 
        ctx.stroke();
        ctx.closePath();
    }
}

export const drawAll = (view: ViewRender, model: OurModel) => {
    const { ctx } = view;
    ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
    model.triangles.forEach(triangle => drawTriangle(ctx, triangle));
    model.circles.forEach(circle => drawCircle(ctx, circle));
    drawSelectionArea(ctx, model);
}
