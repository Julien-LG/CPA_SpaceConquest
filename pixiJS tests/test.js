// import { Application, Assets } from 'pixi.js';
const app = new PIXI.Application();
(async () =>
{
    await setup();
    // await preload();
})();

async function setup()
{
    await app.init({ background: '#1099bb', resizeTo: window });
    document.body.appendChild(app.canvas);
}

async function preload()
{
    const assets = [
        { alias: 'background', src: 'https://pixijs.com/assets/tutorials/fish-pond/pond_background.jpg' },
        { alias: 'fish1', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish1.png' },
        { alias: 'fish2', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish2.png' },
        { alias: 'fish3', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish3.png' },
        { alias: 'fish4', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish4.png' },
        { alias: 'fish5', src: 'https://pixijs.com/assets/tutorials/fish-pond/fish5.png' },
        { alias: 'overlay', src: 'https://pixijs.com/assets/tutorials/fish-pond/wave_overlay.png' },
        { alias: 'displacement', src: 'https://pixijs.com/assets/tutorials/fish-pond/displacement_map.png' },
    ];
    await Assets.load(assets);
}

await PIXI.Assets.load('sample.png');
let sprite = PIXI.Sprite.from('sample.png');

  /*await app.init({ width: 640, height: 360 });

  document.body.appendChild(app.canvas);

/*await PIXI.Assets.load("https://pixijs.com/assets/files/sample-747abf529b135a1f549dff3ec846afbc.png");
let sprite = PIXI.Sprite.from('sample.png');
app.stage.addChild(sprite);*/

/*let carre = new PIXI.Graphics();
carre.beginFill(0xFF0000);
carre.rect(0, 0, 100, 100);
carre.endFill();
app.stage.addChild(carre);

let elapsed = 0.0;
// Tell our application's ticker to run a new callback every frame, passing
// in the amount of time that has passed since the last tick
app.ticker.add((ticker) => {
// Add the time to our total elapsed time
elapsed += ticker.deltaTime;
// Update the sprite's X position based on the cosine of our elapsed time.  We divide
// by 50 to slow the animation down a bit...
carre.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
});*/