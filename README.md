# CPA_Projet
 Projet de CPA.


#Lancement du projet en local

-ouvrir le terminal dans le repértoire courant et faire $http-server  
-accèder à l'adresse 127.0.0.1:8080


#Pour les modifications de fichiers

Pour accèder à une classe de pixi.js, il faut utiliser la variable globale "PIXI", donc pour utiliser la classe "Application" on fait : ¨PIXI.Application".  

Pour réaliser des imports il faut que les fichiers soient es modules JavaScript, d'où l'utilisation de http-server, dans le cas contraire il faut utiliser des .mjs mais le lien entre différents fichiers est plus compliqué, et puisque le but à terme et de tout poster en ligne, alors il vaut mieux faire un serveur http temporaire.