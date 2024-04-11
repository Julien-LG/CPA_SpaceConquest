import { ViewRender, drawAll } from "./view";
import { OurModel } from "./model";

export type OurController = {
    view: ViewRender,
    model: OurModel,
};

export const initController = (model: OurModel, view: ViewRender): OurController => {
    const  controller: OurController = {view, model};
    return controller;
}

export const animate = (controller: OurController) => {
    const { view, model } = controller;
    drawAll(view, model);
    requestAnimationFrame(() => animate(controller));
}