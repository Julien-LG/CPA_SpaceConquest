class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
        requestAnimationFrame(this.animate.bind(this)); // Starts the rendering loop
    }

    setupEventListeners() {
        // Initializes event listeners for user interaction
        let selectionStart = null;

        // Right-click to start selecting triangles
        this.view.canvas.addEventListener('mousedown', e => {
            if (e.button === 2) { // Right mouse button
                e.preventDefault(); // Prevents the context menu from showing
                selectionStart = { x: e.offsetX, y: e.offsetY };
            }
        });

        // Drag to select an area
        this.view.canvas.addEventListener('mousemove', e => {
            if (selectionStart) {
                const currentPoint = { x: e.offsetX, y: e.offsetY };
                //this.view.clearCanvas();
                this.view.drawAll(this.model); // Redraws all game elements
                //this.view.drawSelectionArea(selectionStart, currentPoint); // Draws the selection area
            }
        });

        // Release right-click to finalize selection
        this.view.canvas.addEventListener('mouseup', e => {
            if (e.button === 2 && selectionStart) {
                const selectionEnd = { x: e.offsetX, y: e.offsetY };
                this.model.selectTrianglesInArea(selectionStart, selectionEnd);
                selectionStart = null; // Resets the selection start point for the next selection
                this.view.drawAll; // Ensures the game state is updated and rendered
            }
        });

        // Left-click to move selected triangles
        this.view.canvas.addEventListener('click', e => {
            const destination = { x: e.offsetX, y: e.offsetY };
            this.model.setDestination(destination); // Corrected to use setDestination for defining movement target
        });

        // Prevents the context menu from showing on right-click
        this.view.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    animate() {
        // Update the model for continuous movement and handle collisions
        this.model.moveAndOrientSelectedTriangles();
        // Clear the canvas and redraw all elements based on the updated model state
        this.view.clearCanvas();
        this.view.drawAll(this.model);
        // Continues the loop for the next frame
        requestAnimationFrame(this.animate.bind(this));
    }
}
