// import { Application, Assets, AnimatedSprite, Texture } from 'pixi.js';

(async () =>
{
    // Create a new application
    const app = new PIXI.Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window });

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Load the animation sprite sheet
    await PIXI.Assets.load('https://pixijs.com/assets/spritesheet/fighter.json');

    // Create an array of textures from the sprite sheet
    const frames = [];

    for (let i = 0; i < 30; i++)
    {
        const val = i < 10 ? `0${i}` : i;

        // Magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
    }

    // Create an AnimatedSprite (brings back memories from the days of Flash, right ?)
    const anim = new PIXI.AnimatedSprite(frames);

    /*
     * An AnimatedSprite inherits all the properties of a PIXI sprite
     * so you can change its position, its anchor, mask it, etc
     */
    anim.x = app.screen.width / 2;
    anim.y = app.screen.height / 2;
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.5;
    anim.play();

    app.stage.addChild(anim);
    console.log(anim.rotation);
    console.log(anim.direction);
    // Animate the rotation
    app.ticker.add(() =>
    {
        anim.rotation += 0.01;
        //anim.direction = Math.random() * Math.PI * 2;
        //anim.rotation = anim.direction;
        // console.log(anim.direction);
        // anim.x += 1;
    });
})();