import { ViewRender, drawAll } from "./view";
import { OurModel } from "./model";

export type OurController = {
    view: ViewRender,
    modele: OurModel,
};

export const initController = (model: OurModel, view: ViewRender): OurController => {
    return {
        view,
        modele: model
    };
}

export const animate = (controller: OurController) => {
    const { view, modele } = controller;
    drawAll(view, modele);
    requestAnimationFrame(() => animate(controller));
}