import { addBackground } from './addBackground.js';
import { addPlanets } from './addPlanets.js';
import { addSpaceships, animateSpaceships } from './addSpaceships.js';

// Create a PixiJS application.
const app = new PIXI.Application();

// Store an array of spaceship sprites for animation.
const spaceships = [];
//const spaceshipsStates = [];

// Store an array of planets sprites.
const planets = [];

async function setup()
{
    // Intialize the application.
    await app.init({ background: '#000000', resizeTo: window });

    // Then adding the application's canvas to the DOM body.
    document.body.appendChild(app.canvas);
}

async function preload()
{
    // Create an array of asset data to load.
    const assets = [
        { alias: 'background', src: 'Assets/background.png' },
        // { alias: 'spaceship1', src: 'Assets/spaceship0.png'},
        { alias: 'planet1', src: 'Assets/planet1.png'},
        { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
        { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
    ];

    const assetsSprite = [
        { alias: 'spaceship0', src: 'Assets/spaceship0.png'},
        { alias: 'spaceship1', src: 'Assets/spaceship1.png' },
        { alias: 'spaceship2', src: 'Assets/spaceship2.png' },
    ];

    // Load the assets defined above.
    await PIXI.Assets.load(assets);
    await PIXI.Assets.load(assetsSprite);
}

// Asynchronous IIFE
(async () =>
{
    await setup();
    await preload();

    addBackground(app);
    addPlanets(app, planets);
    addSpaceships(app, spaceships);

    // Add the sapceship animation callback to the application's ticker.
    app.ticker.add((time) => animateSpaceships(app, spaceships, time));
})();