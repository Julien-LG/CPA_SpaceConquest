class View {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.backgroundColor = 'white';
    }

    drawAll(model) {
        // Clear the canvas, draw triangles, the circle, and HP
        model.triangles.forEach(triangle => this.drawTriangle(triangle));
        this.drawCircle(model.circle);
        this.drawSelectionArea(model.selectionStart, model.selectionEnd);
    }

    drawTriangle(triangle) {
        // Dessine un triangle sur le canvas
        this.ctx.beginPath();
        this.ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
        triangle.points.forEach(point => this.ctx.lineTo(point.x, point.y));
        this.ctx.closePath();
        this.ctx.fillStyle = triangle.color;
        this.ctx.fill();

        // Si le triangle est slectionné, dessine un contour orange
        if (triangle.selected) {
            this.ctx.strokeStyle = 'brightorange';
            this.ctx.lineWidth = 5; 
            this.ctx.stroke(); // Dessine le contour
        }
    }

    clearCanvas() {
        // Nettoie le canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Dessine le cercle vert
    drawCircle(circle) {
        this.ctx.beginPath();
        this.ctx.arc(circle.x, circle.y, circle.radius, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'green';
        this.ctx.fill();

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`HP: ${circle.hp}`, circle.x - 15, circle.y + 5);
    }

    drawSelectionArea(start, end) {
        // Dessine la zone de sélection
        if (!start || !end) return;
        this.ctx.beginPath();
        this.ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3; 
        this.ctx.stroke();
        this.ctx.closePath();
    }
}
