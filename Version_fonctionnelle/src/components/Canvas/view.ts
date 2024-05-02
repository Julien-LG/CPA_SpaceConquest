import {Triangle, Circle, Rectangle, OurModel} from './Model/model';

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

const drawRectangle = (ctx: CanvasRenderingContext2D, rectangle: Rectangle) => {
    // Dessine un rectangle sur le canvas
    ctx.beginPath();
    ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    ctx.fillStyle = rectangle.color;
    ctx.fill();
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

const drawGrid = (ctx: CanvasRenderingContext2D, model: OurModel) => {
    const { grid } = model;
    ctx.strokeStyle = 'grey';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= model.canvaswidth; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, model.canvasheight);
        ctx.stroke();
        ctx.closePath();
    }

    for (let j = 0; j <= model.canvasheight; j += 30) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(model.canvaswidth, j);
        ctx.stroke();
        ctx.closePath();
    }
}

export const drawAll = (view: ViewRender, model: OurModel) => {
    const { ctx } = view;
    ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
    drawGrid(ctx, model);
    model.triangles.forEach(triangle => drawTriangle(ctx, triangle));
    model.circles.forEach(circle => drawCircle(ctx, circle));
    model.rectangles.forEach(rectangle => drawRectangle(ctx, rectangle));
    drawSelectionArea(ctx, model);
}

export const clearAll = (view: ViewRender) => {
    view.ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
}

function addButton(view: ViewRender) {
    // Crée un bouton pour recharger la page après la victoire
    const reloadButton = document.createElement('button');
    reloadButton.textContent = 'Rejouer';
    reloadButton.style.position = 'absolute';
    reloadButton.style.top = `${view.canvas.height / 2 + 50}px`;
    reloadButton.style.left = `${view.canvas.width / 2 - 50}px`;
    reloadButton.addEventListener('click', () => {
        window.location.reload();
    });
    view.canvas.parentNode?.appendChild(reloadButton);
}

export const drawWin = (view: ViewRender) => {
    const { ctx } = view;
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Vous avez gagné ! 🥳`, view.canvas.width / 2 - 100, view.canvas.height / 2);

    addButton(view);
}

export const drawLose = (view: ViewRender) => {
    const { ctx } = view;
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.fillText(`Vous avez perdu 😭`, view.canvas.width / 2 - 100, view.canvas.height / 2);

    addButton(view);

}