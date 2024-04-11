import { OurModel, initModel, executeEvents, addEvent, createGameTest } from "./model";
import { initView, ViewRender, drawAll } from "./view";


export type OurController = {
    view: ViewRender,
    model: OurModel,
};

export const initController = (): OurController => {
    const newModel = createGameTest();
    const newView = initView();
    const  controller: OurController = {view : newView, model: newModel};
    return controller;
}

export const animate = (controller: OurController) => {
    controller.model = executeEvents(controller.model);
    const { view, model } = controller;
    drawAll(view, model);
    requestAnimationFrame(() => animate(controller));
}

export const setupEventListeners= (controller : Controller) => {
    const view = controller.view;
    controller.model;
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
        if (controller.model.selectionStart) {
            controller.model = addEvent(controller.model, e);
        }
    });

    // Release right-click to finalize selection
    view.canvas.addEventListener('mouseup', e => {
        if (e.button === 2 && controller.model.selecStart) {
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