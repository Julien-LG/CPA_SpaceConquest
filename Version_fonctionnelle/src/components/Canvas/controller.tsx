import { useRef, useEffect } from 'react'

import { OurModel, updateModel, addEvent, createGameTest, winGame, loseGame } from "./model";
import { initView, ViewRender, drawAll } from "./view";


export type OurController = {
    view: ViewRender,
    model: OurModel,
};

export const initController = (canvas: HTMLCanvasElement): OurController => {
    const newModel = createGameTest();
    const newView = initView(canvas);
    const controller: OurController = {view: newView, model: newModel};
    return controller;
};

export const animate = (controller: OurController) => {
    controller.model = updateModel(controller.model);
    const { view, model } = controller;
    drawAll(view, model);
    if (!winGame(model) && !loseGame(model)) {
        requestAnimationFrame(() => animate(controller));
    }
}

export const setupEventListeners= (controller : OurController) => {
    const view = controller.view;
    const model = controller.model;
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

    // Left-click to move selected triangles
    view.canvas.addEventListener('click', e => {
        if (e.button === 0) { // Left mouse button
            controller.model = addEvent(controller.model, e);
        }
    });

    // Prevents the context menu from showing on right-click
    view.canvas.addEventListener('contextmenu', e => e.preventDefault());
}

const StartGame = ({height, width} : { height: number; width: number })=> {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const controller = initController(canvasRef.current!);
        if (canvasRef.current) {
            controller.view.canvas = canvasRef.current;
            setupEventListeners(controller);
            animate(controller);
        }
    }, [height, width]);

    return <canvas ref={canvasRef} width={width} height={height} />;
}

export default StartGame;