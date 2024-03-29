// Fonctions utilitaires pour les opérations vectorielles et la détection de collision
function dot(a, b) {
    // Produit scalaire de deux vecteurs
    return a.x * b.x + a.y * b.y;
}

function subtract(a, b) {
    // Soustraction vectorielle pour obtenir un nouveau vecteur
    return { x: a.x - b.x, y: a.y - b.y };
}

function normalize(v) {
    // Normalise un vecteur à une longueur unitaire
    const length = Math.sqrt(v.x * v.x + v.y * v.y);
    return { x: v.x / length, y: v.y / length };
}

function project(vertices, axis) {
    // Projette un polygone sur un axe et retourne le min et le max de la projection
    let min = dot(axis, vertices[0]);
    let max = min;
    for (let i = 1; i < vertices.length; i++) {
        const projection = dot(axis, vertices[i]);
        min = Math.min(min, projection);
        max = Math.max(max, projection);
    }
    return { min, max };
}

function overlaps(a, b) {
    // Vérifie si les projections de deux polygones sur un axe se chevauchent
    return a.min <= b.max && a.max >= b.min;
}

function getEdges(vertices) {
    // Calcule les vecteurs normaux des arêtes d'un polygone
    const edges = [];
    for (let i = 0; i < vertices.length; i++) {
        const next = i + 1 === vertices.length ? 0 : i + 1;
        edges.push(normalize(subtract(vertices[next], vertices[i])));
    }
    return edges;
}

function trianglesCollide(tri1, tri2) {
    // Détection de collision entre deux triangles utilisant le théorème des axes séparateurs
    const edges = getEdges(tri1).concat(getEdges(tri2));
    for (let edge of edges) {
        const axis = { x: -edge.y, y: edge.x };
        const projection1 = project(tri1, axis);
        const projection2 = project(tri2, axis);
        if (!overlaps(projection1, projection2)) {
            return false; // Pas de collision si une séparation est trouvée
        }
    }
    return true; // Collision détectée
}

function triangleCircleCollision(triangle, circle, radius) {
    // Détection de collision entre un triangle et un cercle
    for (let point of triangle) {
        const distance = Math.sqrt((point.x - circle.x) ** 2 + (point.y - circle.y) ** 2);
        if (distance < radius) {
            return true; // Collision si un point du triangle est à l'intérieur du cercle
        }
    }
    return false;
}

// Variables globales pour le mouvement et la gestion des triangles
let triangles = []; // Conteneur pour les triangles rouges
let blueTriangles = []; // Conteneur pour les triangles bleus
const circle = { x: 300, y: 200 }; // Position et rayon du cercle central
const circleRadius = 50;
let velocity = { x: 0, y: 0 }; // Vélocité appliquée à tous les triangles rouges
const friction = 0.95; // Facteur de friction ralentissant progressivement les triangles
const acceleration = 4; // Accélération appliquée à la vélocité lors de l'appui sur les touches

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Création du triangle bleu initial dans le coin inférieur droit
    blueTriangles.push(createTriangle(canvas.width - 50, canvas.height - 50, 'blue'));

    // Fonction pour créer un triangle à une position donnée
    function createTriangle(x, y, color = 'red') {
        const size = 20; // Taille des triangles
        const triangle = [
            { x: x - size, y: y + size / Math.sqrt(3) },
            { x: x, y: y - 2 * size / Math.sqrt(3) },
            { x: x + size, y: y + size / Math.sqrt(3) }
        ];
        return { points: triangle, color }; // Retourne un objet contenant les points du triangle et sa couleur
    }

    // Fonction pour dessiner un triangle sur le canvas
    function drawTriangle(triangle) {
        ctx.beginPath();
        ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
        triangle.points.forEach((point, index) => {
            if (index > 0) {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.closePath();
        ctx.fillStyle = triangle.color;
        ctx.fill();
    }

    // Fonction pour dessiner le cercle central
    function drawCircle() {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circleRadius, 0, 2 * Math.PI);
        ctx.fillStyle = 'green';
        ctx.fill();
    }

    // Applique la vélocité aux triangles rouges et gère les collisions avec les bords du canvas
    function applyVelocityAndCheckBorders() {
        velocity.x *= friction;
        velocity.y *= friction;
        triangles.forEach(triangle => {
            triangle.points.forEach(point => {
                point.x += velocity.x;
                point.y += velocity.y;
                // Inversion de la vélocité en cas de collision avec un bord pour simuler un rebond
                if (point.x < 0 || point.x > canvas.width) velocity.x = -velocity.x;
                if (point.y < 0 || point.y > canvas.height) velocity.y = -velocity.y;
            });
        });
    }

    // Vérifie les collisions entre les triangles rouges et bleus, et supprime les triangles en collision
    function checkCollisions() {
        // Filtre les triangles rouges pour retirer ceux en collision avec un triangle bleu ou le cercle
        triangles = triangles.filter(triangle =>
            !blueTriangles.some(blue => trianglesCollide(triangle.points, blue.points))
            && !triangleCircleCollision(triangle.points, circle, circleRadius)
        );

        // Filtre les triangles bleus pour retirer ceux en collision avec un triangle rouge
        blueTriangles = blueTriangles.filter(blue =>
            !triangles.some(triangle => trianglesCollide(triangle.points, blue.points))
        );
    }

    // Redessine tous les éléments sur le canvas à chaque frame
    function redraw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawCircle();
        [...triangles, ...blueTriangles].forEach(triangle => drawTriangle(triangle));
    }

    // Gestion des entrées du clavier pour le mouvement des triangles rouges
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowUp': velocity.y -= acceleration; break;
            case 'ArrowDown': velocity.y += acceleration; break;
            case 'ArrowLeft': velocity.x -= acceleration; break;
            case 'ArrowRight': velocity.x += acceleration; break;
        }
    });

    // Ajout d'un triangle rouge avec un clic gauche de la souris
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        triangles.push(createTriangle(x, y, 'red'));
        redraw(); // Mise à jour immédiate pour montrer le nouveau triangle
    });

    // Ajout d'un triangle bleu avec un clic droit de la souris
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault(); // Empêche l'affichage du menu contextuel
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        blueTriangles.push(createTriangle(x, y, 'blue'));
        redraw(); // Mise à jour immédiate pour montrer le nouveau triangle
    });

    // Boucle principale du jeu pour la mise à jour et le dessin
    function loop() {
        applyVelocityAndCheckBorders(); // Applique mouvement et vérifie les bords
        checkCollisions(); // Vérifie les collisions entre les triangles et avec le cercle
        redraw(); // Redessine le canvas avec l'état actuel des objets
        requestAnimationFrame(loop); // Appelle la fonction loop à chaque rafraîchissement de l'écran
    }

    loop(); // Démarre la boucle de jeu
});
