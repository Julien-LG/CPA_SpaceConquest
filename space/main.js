import { addBackground } from './addBackground.js';
import { addPlanets } from './addPlanets.js';
import { addSpaceships, animateSpaceshipes } from './addSpaceships.js';

// Create a PixiJS application.
const app = new PIXI.Application();

// Store an array of spaceship sprites for animation.
const spaceships = [];

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
        { alias: 'background', src: 'https://t3.ftcdn.net/jpg/02/64/27/90/360_F_264279006_WDXxV3OHjAOoHqH7iiLDrg23p0947g7U.jpg' },
        { alias: 'spaceship1', src: 'https://art.pixilart.com/thumb/3709098ff9a16b0.png' },
        // { alias: 'planet1', src: '/planet1.png' },
        { alias: 'planet1', src: 'https://openseauserdata.com/files/fe26e80b6d3670342a9816edfe2390fc.png'},
        { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
        { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
    ];

    // Load the assets defined above.
    await PIXI.Assets.load(assets);
}

// Asynchronous IIFE
(async () =>
{
    await setup();
    await preload();

    addBackground(app);
    addPlanets(app, planets);
    addSpaceships(app, spaceships);

    // Add the fish animation callback to the application's ticker.
    app.ticker.add((time) => animateSpaceshipes(app, spaceships, time));
})();