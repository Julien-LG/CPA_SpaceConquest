document.addEventListener('DOMContentLoaded', () => {
    const appModel = new Model();
    const appView = new View();
    const appController = new Controller(appModel, appView);

    appController.animate; // Initial draw
});
