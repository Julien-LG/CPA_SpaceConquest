import { BACKGROUNDIMAGE, ASTEROIDSPRITE, SPACESHIPSPRITE } from './config';
import {Triangle, Circle, Rectangle, OurModel} from './Model/model';

// On affche les sprites
const doSprites = true;

const backgroundImage = new Image();
backgroundImage.src = BACKGROUNDIMAGE;

const spriteAsteroid = new Image();
spriteAsteroid.src = ASTEROIDSPRITE;

const spriteSpaceship = new Image();
spriteSpaceship.src = SPACESHIPSPRITE;


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

function rotateAndPaintImage ( context: CanvasRenderingContext2D, image: HTMLImageElement, angleInRad: number, positionX: number, positionY: number, axisX: number, axisY: number ) {
  context.translate( positionX, positionY );
  context.rotate( angleInRad );
  context.drawImage( image, -axisX, -axisY, 20,20 );
  context.rotate( -angleInRad );
  context.translate( -positionX, -positionY );
}

const drawTriangle = (ctx: CanvasRenderingContext2D, triangle: Triangle) => {
    ctx.save();
    
    if(doSprites) {
        // On affiche le sprite avec la bonne orientation
        let width = 30;
        let height = 30;
        ctx.translate(triangle.center.x, triangle.center.y);
        ctx.rotate(triangle.angle);
        ctx.drawImage(spriteSpaceship, -width / 2, -height / 2, width, height);
        ctx.rotate(-triangle.angle);
        ctx.translate(-triangle.center.x, -triangle.center.y);
    }
    // Dessine un triangle sur le canvas
    ctx.beginPath();
    ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
    triangle.points.forEach(point => ctx.lineTo(point.x, point.y));
    ctx.closePath();
    if(!doSprites) {        
        ctx.fillStyle = triangle.color;
        ctx.fill();
    }
    ctx.stroke();
    // Si le triangle est sélectionné, dessine un contour orange
    if (triangle.selected) {
        ctx.strokeStyle = 'orange';
        ctx.lineWidth = 3; 
    }
    else {
        ctx.strokeStyle = triangle.color;
        ctx.lineWidth = 1; 
    }
    ctx.stroke(); // Dessine le contour
    ctx.restore();
}

const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
    // Dessine un cercle sur le canvas
    ctx.beginPath();
    ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);

    if (doSprites) {
        ctx.drawImage(circle.sprite, circle.center.x-circle.radius, circle.center.y-circle.radius, circle.radius*2, circle.radius*2);
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.fillText(`HP: ${circle.hp}`, circle.center.x - 20, circle.center.y + 5);
    }
    else {
        ctx.fillStyle = circle.color;
        ctx.fill();
    }
    
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.fillText(`HP: ${circle.hp}`, circle.center.x - 20, circle.center.y + 5);

    ctx.strokeStyle = 'light-grey';
    ctx.lineWidth = 1.5; 
    ctx.stroke(); // Dessine le contour
}

const drawRectangle = (ctx: CanvasRenderingContext2D, rectangle: Rectangle) => {
    if(doSprites) {
        // Calculer le nombre de lignes et de colonnes nécessaires pour remplir le rectangle
        const numColumns = Math.ceil(rectangle.width / spriteAsteroid.width);
        const numRows = Math.ceil(rectangle.height / spriteAsteroid.height);

        /// Dessiner les lignes de sprites
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numColumns; col++) {
                // Calculer les coordonnées de dessin
                const x = rectangle.x + col * spriteAsteroid.width;
                const y = rectangle.y + row * spriteAsteroid.height;

                // Vérifier si le dessin dépasse la limite du rectangle
                if (x < rectangle.x + rectangle.width && y < rectangle.y + rectangle.height) {
                    // Dessiner le sprite seulement si sa position ne dépasse pas la limite du rectangle
                    const drawWidth = Math.min(spriteAsteroid.width, rectangle.x + rectangle.width - x);
                    const drawHeight = Math.min(spriteAsteroid.height, rectangle.y + rectangle.height - y);
                    ctx.drawImage(spriteAsteroid, x, y, drawWidth, drawHeight);
                }
            }
        }
    }
    else {
        // Dessine un rectangle sur le canvas
        ctx.beginPath();
        ctx.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
        ctx.fillStyle = rectangle.color;
        ctx.fill();
    }
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
    //backgroundImage.
    ctx.drawImage(backgroundImage, 0, 0, view.canvas.width, view.canvas.height);
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