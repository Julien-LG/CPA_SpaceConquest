import { useRef, useEffect } from 'react'

import * as conf from './config'
import { addEvent } from './Model/eventFunctions';
import { OurModel, updateModel, generateTrianglesAroundPlanetofSetSize, regenerateHP, createGameTest, winGame, loseGame } from "./Model/model";
import { initView, ViewRender, drawAll, clearAll  } from "./view";
import { directTrianglesToNearestPlanet, directTrianglesToWeakestAndClosest, directTrianglesToWeakestClosestEnemy } from './Model/ia';


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
                clearAll(view);
                alert('You win!');
            }
            else {
                clearAll(view);
                alert('You lose!');
            }
        }
    };

    update();

    // Génération des troupes pour chaque taille de planète
    const intervalGenerateTroupsBigPlanet = setInterval(() => {
        controller.model = generateTrianglesAroundPlanetofSetSize(controller.model, conf.BIGPLANETRADIUS);
    }, 2000);
    const intervalGenerateTroupsMediumPlanet = setInterval(() => {
        controller.model = generateTrianglesAroundPlanetofSetSize(controller.model, conf.MEDIUMPLANETRADIUS);
    }, 3000);
    const intervalGenerateTroupsSmallPlanet = setInterval(() => {
        controller.model = generateTrianglesAroundPlanetofSetSize(controller.model, conf.SMALLPLANETRADIUS);
    }, 4500);

    //Régéneration de la santé des planètes
    const intervalRegenerateHealth = setInterval(() => {
        controller.model = regenerateHP(controller.model);
    }, 5000);

    // Actions des IA toutes les 4 secondes
    const intervalId2 = setInterval(() => {
        controller.model = directTrianglesToNearestPlanet(controller.model, 'red');  // IA pour enemies rouges
        controller.model = directTrianglesToWeakestClosestEnemy(controller.model, 'green');  // IA pour enemies verts
        controller.model = directTrianglesToWeakestAndClosest(controller.model, 'orange');  // IA pour enemies oranges
    }, 6000);

    // Supprime l'intervalle lorsqu'on gagne ou perd
    return () => {
        clearInterval(intervalGenerateTroupsBigPlanet);
        clearInterval(intervalGenerateTroupsMediumPlanet);
        clearInterval(intervalGenerateTroupsSmallPlanet);
        clearInterval(intervalRegenerateHealth);
        clearInterval(intervalId2);
    }
}


export const setupEventListeners = (controller: OurController) => {
    const view = controller.view;
    // Initialise les écouteurs d'événements pour l'interaction utilisateur
    
    let isRightClick = false; // Indicateur pour suivre l'état du clic droit

    // Clic droit pour commencer la sélection des triangles
    view.canvas.addEventListener('mousedown', e => {
        if (e.button === 2) { // Bouton droit de la souris
            e.preventDefault(); // Empêche l'affichage du menu contextuel
            isRightClick = true;
            controller.model = addEvent(controller.model, e);
        }
    });

    // Glisser pour sélectionner une zone
    view.canvas.addEventListener('mousemove', e => {
        if (controller.model.startSelec && isRightClick) {
            controller.model = addEvent(controller.model, e);
        }
    });

    // Relâcher le clic droit pour finaliser la sélection
    view.canvas.addEventListener('mouseup', e => {
        if (e.button === 2 && controller.model.startSelec && isRightClick) {
            controller.model = addEvent(controller.model, e);
            isRightClick = false;
        }
    });

    view.canvas.addEventListener('contextmenu', e => {
        // Empêche l'affichage du menu contextuel par défaut
        e.preventDefault();
        controller.model = addEvent(controller.model, e);
    });

    // Ajoute un listener d'événements pour l'événement de clic (gauche)
    view.canvas.addEventListener('click', e => {
        controller.model = addEvent(controller.model, e);
    });
 
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