import { useRef, useEffect } from 'react'

import { OurModel, updateModel, addEvent, generateTrianglesAroundCircles, createGameTest, winGame, loseGame } from "./Model/model";
import { initView, ViewRender, drawAll } from "./view";
import { directTrianglesToNearestPlanet, directTrianglesToWeakestClosestEnemy } from './Model/ai';


export type OurController = {
    view: ViewRender,
    model: OurModel,
    height: number,
    width: number
};

export const initController = (canvas: HTMLCanvasElement, height: number, width: number): OurController => {
    const newModel = createGameTest(height, width);
    const newView = initView(canvas);
    const controller: OurController = {view: newView, model: newModel, height, width};
    return controller;
};

export const animate = (controller: OurController) => {
    const update = () => {
        controller.model = updateModel(controller.model);
        const { view, model } = controller;
        drawAll(view, model);

        if (!winGame(model) && !loseGame(model)) {
            requestAnimationFrame(update);
        }
        else {
            if (winGame(model)) {
                alert('You win!');
            }
            else {
                alert('You lose!');
            }
        }
    };

    update();

    // Génération des triangles toutes les 2 secondes //A MODIFIER POUR CHAQUE TAILLE DE PLANETE
    const intervalId = setInterval(() => {
        controller.model = generateTrianglesAroundCircles(controller.model);
    }, 2000);

    // Actions des IA toutes les 4 secondes
    const intervalId2 = setInterval(() => {
        controller.model = directTrianglesToNearestPlanet(controller.model, 'red');  // IA pour enemies rouges
        controller.model = directTrianglesToWeakestClosestEnemy(controller.model, 'green');  // IA pour enemies verts
        controller.model = directTrianglesToWeakestClosestEnemy(controller.model, 'orange');  // IA pour enemies oranges
    }, 4000);

    // Supprime l'intervalle lorsqu'on gagne ou perd
    return () => clearInterval(intervalId);
}

export const setupEventListeners= (controller : OurController) => {
    const view = controller.view;
    // Initializes event listeners for user interaction
    
    // Right-click to start selecting triangles
    view.canvas.addEventListener('mousedown', e => {
        if (e.button === 2) { // Right mouse button
            e.preventDefault(); // Prevents the context menu from showing
            controller.model = addEvent(controller.model, e);
        }
    });

    // Drag to select an area
    view.canvas.addEventListener('mousemove', e => {
        if (controller.model.startSelec) {
            controller.model = addEvent(controller.model, e);
        }
    });

    // Release right-click to finalize selection
    view.canvas.addEventListener('mouseup', e => {
        if (e.button === 2 && controller.model.startSelec) {
            controller.model = addEvent(controller.model, e);
        }
    });

    //click
    view.canvas.addEventListener('click', e => {
        controller.model = addEvent(controller.model, e);
    });

    // Prevents the context menu from showing on right-click
    view.canvas.addEventListener('contextmenu', e => e.preventDefault());
    controller.view = view;
}

const StartGame = ({height, width} : { height: number; width: number })=> {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const controller = initController(canvasRef.current!, height, width);
        if (canvasRef.current) {
            controller.view.canvas = canvasRef.current;
            setupEventListeners(controller);
            animate(controller);
        }
    }, [height, width]);

    return <canvas ref={canvasRef} width={width} height={height} />;
}

export default StartGame;