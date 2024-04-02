class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.setupEventListeners();
        requestAnimationFrame(this.animate.bind(this)); // Starts the rendering loop
        let selectionStart = null;
        let selectionEnd = null;   
    }

    setupEventListeners() {
        // Initializes event listeners for user interaction
        
        // Right-click to start selecting triangles
        this.view.canvas.addEventListener('mousedown', e => {
            if (e.button === 2) { // Right mouse button
                e.preventDefault(); // Prevents the context menu from showing
                this.selectionStart = { x: e.offsetX, y: e.offsetY };
            }
        });

        // Drag to select an area
        this.view.canvas.addEventListener('mousemove', e => {
            if (this.selectionStart) {
                this.selectionEnd = { x: e.offsetX, y: e.offsetY };
                this.view.clearCanvas();
                this.view.drawAll(this.model,this.selectionStart,this.selectionEnd);
            }
        });

        // Release right-click to finalize selection
        this.view.canvas.addEventListener('mouseup', e => {
            if (e.button === 2 && this.selectionStart) {
                this.selectionEnd = { x: e.offsetX, y: e.offsetY };
                this.model.selectTrianglesInArea(this.selectionStart, this.selectionEnd);
                this.view.drawAll(this.model,this.selectionStart,this.selectionEnd);
                this.selectionStart = null; // Resets the selection start point for the next selection
                this.selectionEnd = null; // Resets the selection end point for the next selection
            }
        });

        // Left-click to move selected triangles
        this.view.canvas.addEventListener('click', e => {
            const destination = { x: e.offsetX, y: e.offsetY };
            this.model.setDestination(destination);
        });

        // Prevents the context menu from showing on right-click
        this.view.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    animate() {
        // Update the model for continuous movement and handle collisions
        this.model.moveTriangles();
        // Clear the canvas and redraw all elements based on the updated model state
        this.view.clearCanvas();
        this.view.drawAll(this.model, this.selectionStart, this.selectionEnd);
        // Continues the loop for the next frame
        requestAnimationFrame(this.animate.bind(this));
    }
}
