export function addSpaceships(app, spaceships) {
    // Create a container to hold all the spaceship sprites.
    const spaceshipContainer = new PIXI.Container();

    // Add the spaceship container to the stage.
    app.stage.addChild(spaceshipContainer);

    const spaceshipCount = 1;
    // Number of frames for the spaceship
    const nbSprites = 3;
    // const spaceshipAssets = ['spaceship1'];
    
    // Create an array to store the textures
    const spaceshipTextures = [];
    for (let i = 0; i < nbSprites; i++) {
        spaceshipTextures.push(PIXI.Texture.from(`spaceship${i}`));
    }

    // Create a spaceship sprite for each spaceship.
    for (let i = 0; i < spaceshipCount; i++) {
        // Cycle through the spaceship assets for each sprite.
        //const spaceshipAsset = spaceshipAssets[i % spaceshipAssets.length];
        
        // Create a spaceship animated sprite.
        let spaceship = new PIXI.AnimatedSprite(spaceshipTextures);
        spaceship.scale.set(0.1);
        spaceship.animationSpeed = 0.3;
        spaceship.play();

        //const spaceship = PIXI.Sprite.from(spaceshipAsset);

        // Center the sprite anchor.
        /*spaceship.anchor.set(0.5);

        // Assign additional properties for the animation.
        spaceship.direction = Math.random() * Math.PI * 2;
        spaceship.speed = 2 + Math.random() * 2;
        spaceship.turnSpeed = Math.random() - 0.8;

        // Randomly position the spaceship sprite around the stage.
        // spaceship.x = Math.random() * app.screen.width;
        // spaceship.y = Math.random() * app.screen.height;

        spaceship.x = app.screen.width / 2;
        spaceship.y = app.screen.height / 2;

        // Scale the spaceship sprite to create uniformity.
        spaceship.scale.set(0.25);
        */
        // Add the spaceship sprite to the spaceship container.
        spaceshipContainer.addChild(spaceship);

        // Add the spaceship sprite to the spaceship array.
        spaceships.push(spaceship);
        //spaceships[0].push(spaceship);
    }
}

/*export function animateSpaceships(app, spaceships, time) {
    const delta = time.deltaTime;

    // Rayon de l'orbite
    const orbitRadius = 50;

    // Vitesse de rotation des vaisseaux autour du point central
    //const rotationSpeed = 0.005;
    const rotationSpeed = 0.5;

    // Angle initial pour chaque vaisseau
    let angle = 0;

    spaceships.forEach((spaceship) => {
        // Calcul des nouvelles coordonnées en fonction de l'angle et du rayon de l'orbite
        // const newX = centerX + Math.cos(angle) * orbitRadius;
        // const newY = centerY + Math.sin(angle) * orbitRadius;
        let newX = spaceship.x + Math.sin(spaceship.direction) * spaceship.speed;
        let newY = spaceship.y + Math.cos(spaceship.direction) * spaceship.speed;

        spaceship.direction += spaceship.turnSpeed * 0.05;
        //spaceship.rotation += 0.05/5;

        let teta = Math.atan((newY - spaceship.y)/(newX - spaceship.x));
        spaceship.rotation = teta; //marche en parti
        spaceship.x = newX;
        spaceship.y = newY;
        console.log(spaceship.rotation);
        
        //spaceship.rotation = -teta + Math.PI / 2;
        //spaceship.rotation = Math.PI/2;

        
        // Applique la rotation au vaisseau spatial pour qu'il fasse face au centre
        //spaceship.rotation = Math.atan2(centerY - newY, centerX - newX) + Math.PI / 2;


        // Incrémente l'angle pour la prochaine itération, faisant ainsi tourner le vaisseau autour du point central
        // angle += rotationSpeed * delta;
    });
}*/

/*export function animateSpaceships(app, spaceships, time)
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
}*/

export function animateSpaceships(app, spaceships, time) {
    const delta = time.deltaTime/10;

    spaceships.forEach((spaceship) => {
        // Rotation continue du vaisseau
        const rotationSpeed = 0.001; // Vitesse de rotation en radians par unité de temps
        //spaceship.angle += rotationSpeed * delta;
        //spaceship.angle += rotationSpeed * delta;

        // Calcul des coordonnées en fonction de l'angle
        /*const orbitRadius = 100;
        const centerX = app.screen.width / 2;
        const centerY = app.screen.height / 2;
        const newX = centerX + Math.cos(spaceship.angle) * orbitRadius;
        const newY = centerY + Math.sin(spaceship.angle) * orbitRadius;

        // Met à jour la position du vaisseau spatial
        spaceship.x = newX;
        spaceship.y = newY;

        // Rotation du vaisseau spatial pour qu'il fasse face au centre
        // Calcule l'angle entre la position actuelle du vaisseau et le centre de l'écran
        spaceship.rotation = Math.atan2(centerY - newY, centerX - newX) + Math.PI / 2;*/
        //spaceship.x += 1;
    });
}