document.addEventListener('DOMContentLoaded', () => {
    const appCollison = new Collision();
    const appModel = new Model(appCollison);
    const appView = new View();
    const appController = new Controller(appModel, appView);

    appController.animate; // Initial draw
});
