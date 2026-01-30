

# JustStreamIt

JustStreamIt est une interface web type Netflix qui consomme l'API OCMovies pour afficher les films les mieux notés et plusieurs catégories de films.

## Objectifs du projet

- Consommer une API REST (OCMovies) avec JavaScript.
- Construire une page d'accueil dynamique (carrousels, meilleur film, modale de détails).
- Manipuler le DOM sans framework (vanilla JS).

## Structure du projet

- `index.html` : page principale.
- `css/style.css` : styles.
- `js/script.js` : configuration des URLs de l’API et logique applicative (fetch, manipulation du DOM, modales, carrousels).
- `img/` : images et ressources graphiques.

## Prérequis

- Python 3.x installé.
- Une instance de l’API OCMovies installée et démarrée dans un **autre dossier/projet**.
- Un navigateur web récent.

Exemple d’API OCMovies (projet OpenClassrooms) :  
https://github.com/OpenClassrooms-Student-Center/OCMovies-API-E

## Installation de l'API (backend)

1. Clonez le dépôt de l'API OCMovies dans un dossier.

   Documentation et code de l'API :  
   https://github.com/OpenClassrooms-Student-Center/OCMovies-API-EN-FR

2. Créez et activez un environnement virtuel, installez les dépendances, créez la base et lancez le serveur :

   ```bash
   cd backend/ocmovies-api-fr
   python -m venv env
   source env/bin/activate        # Windows : env\Scripts\activate
   pip install -r requirements.txt
   python manage.py create_db
   python manage.py runserver

3.  Par défaut, l’API est disponible à l’adresse :

    http://127.0.0.1:8000/api/v1/titles/

    http://127.0.0.1:8000/api/v1/genres/

## Installation et lancement du frontend

1. Placez-vous dans le dossier frontend/ :
    cd frontend

2. Vérifiez la configuration des URLs dans js/config.js :
const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";



3. Lancez un petit serveur HTTP local ou ouvrez simplement index.html :

Avec Python :
    python -m http.server 8001

Puis ouvrez http://127.0.0.1:8001 dans votre navigateur.
Ou ouvrez frontend/index.html directement (ou via une extension type “Live Server”).

Utilisation
Une fois l’API démarrée et la page ouverte dans le navigateur :
    Le film le mieux noté s’affiche en haut de la page (titre, affiche, description).
    Des carrousels présentent des listes de films (meilleurs films, catégories spécifiques).
    Un clic sur un film ou sur le bouton “Plus d’infos” ouvre une modale avec les détails du film.

Technologies utilisées
    HTML5
    CSS3
    JavaScript (vanilla)
    API REST OCMovies (Django REST Framework)

Statut du projet
    Projet pédagogique réalisé dans le cadre de la formation développeur Python (JustStreamIt / OCMovies).