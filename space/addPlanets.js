export function addPlanets(app, planets)
{
    // Create a container to hold all the planet sprites.
    const planetContainer = new PIXI.Container();

    // Add the planet container to the stage.
    app.stage.addChild(planetContainer);

    const planetCount = 2;
    const planetAssets = ['planet1'];

    // Create a planet sprite for each planet.
    for (let i = 0; i < planetCount; i++)
    {
        // Cycle through the planet assets for each sprite.
        const planetAsset = planetAssets[i % planetAssets.length];

        // Create a planet sprite.
        const planet = PIXI.Sprite.from(planetAsset);

        // Center the sprite anchor.
        planet.anchor.set(0.5);

        // Randomly position the planet sprite around the stage.
        planet.x = Math.random() * app.screen.width;
        planet.y = Math.random() * app.screen.height;

        // Randomly scale the planet sprite to create some variety.
        planet.scale.set(0.05);

        // Add the planet sprite to the planet container.
        planetContainer.addChild(planet);

        // Add the planet sprite to the planet array.
        planets.push(planet);
    }
}