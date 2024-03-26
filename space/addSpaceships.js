export function addSpaceships(app, spaceships)
{
    // Create a container to hold all the spaceship sprites.
    const spaceshipContainer = new PIXI.Container();

    // Add the spaceship container to the stage.
    app.stage.addChild(spaceshipContainer);

    const spaceshipCount = 5;
    const spaceshipAssets = ['spaceship1'];

    // Create a spaceship sprite for each spaceship.
    for (let i = 0; i < spaceshipCount; i++)
    {
        // Cycle through the spaceship assets for each sprite.
        const spaceshipAsset = spaceshipAssets[i % spaceshipAssets.length];

        // Create a spaceship sprite.
        const spaceship = PIXI.Sprite.from(spaceshipAsset);

        // Center the sprite anchor.
        spaceship.anchor.set(0.5);

        // Assign additional properties for the animation.
        spaceship.direction = Math.random() * Math.PI * 2;
        spaceship.speed = 2 + Math.random() * 2;
        spaceship.turnSpeed = Math.random() - 0.8;

        // Randomly position the spaceship sprite around the stage.
        spaceship.x = Math.random() * app.screen.width;
        spaceship.y = Math.random() * app.screen.height;

        // Scale the spaceship sprite to create uniformity.
        spaceship.scale.set(0.25);

        // Add the spaceship sprite to the spaceship container.
        spaceshipContainer.addChild(spaceship);

        // Add the spaceship sprite to the spaceship array.
        spaceships.push(spaceship);
    }
}

export function animateSpaceshipes(app, spaceships, time)
{
    // Extract the delta time from the Ticker object.
    const delta = time.deltaTime;

    // Define the padding around the stage where spaceshipes are considered out of sight.
    const stagePadding = 100;
    const boundWidth = app.screen.width + stagePadding * 2;
    const boundHeight = app.screen.height + stagePadding * 2;

    // Iterate through each spaceship sprite.
    spaceships.forEach((spaceship) =>
    {
        // Animate the spaceship movement direction according to the turn speed.
        spaceship.direction += spaceship.turnSpeed * 0.01;

        // Animate the spaceship position according to the direction and speed.
        spaceship.x += Math.sin(spaceship.direction) * spaceship.speed;
        spaceship.y += Math.cos(spaceship.direction) * spaceship.speed;

        // Apply the spaceship rotation according to the direction.
        spaceship.rotation = -spaceship.direction - Math.PI / 2;

        // Wrap the spaceship position when it goes out of bounds.
        if (spaceship.x < -stagePadding)
        {
            spaceship.x += boundWidth;
        }
        if (spaceship.x > app.screen.width + stagePadding)
        {
            spaceship.x -= boundWidth;
        }
        if (spaceship.y < -stagePadding)
        {
            spaceship.y += boundHeight;
        }
        if (spaceship.y > app.screen.height + stagePadding)
        {
            spaceship.y -= boundHeight;
        }
    });
}
