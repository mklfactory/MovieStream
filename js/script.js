const API_BASE = "http://127.0.0.1:8000/api/v1/titles/";

// ==============================
// MODALE
// ==============================
const modal = document.getElementById("movieModal");
const modalClose = document.querySelector(".modal-close");

// Fermer la modale
modalClose.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

// Ouvrir la modale avec les infos du film
async function openMovieModal(movieId) {
    try {
        const res = await fetch(`${API_BASE}${movieId}/`);
        const movie = await res.json();
        document.getElementById("modalMoviePoster").src = movie.image_url;
        document.getElementById("modalMovieTitle").textContent = movie.title;
        document.getElementById("modalMovieDetails").innerHTML = `
            <p><strong>Année :</strong> ${movie.year}</p>
            <p><strong>IMDb :</strong> ${movie.imdb_score}</p>
            <p><strong>Genres :</strong> ${movie.genres.join(", ")}</p>`;
        document.getElementById("modalMovieSummary").textContent = movie.description;
        modal.style.display = "block";
    } catch (err) {
        console.error("Erreur modale :", err);
        alert("Impossible de charger les détails du film.");
    }
}

// ==============================
// Création des cartes films
// ==============================
function createMovieCard(movie) {
    const div = document.createElement("div");
    div.classList.add("movie-card");
    div.dataset.id = movie.id;

    div.innerHTML = `
        <img src="${movie.image_url}" alt="${movie.title}">
        <div class="overlay">
            <h5>${movie.title}</h5>
            <button class="details-btn">Détails</button>
        </div>`;

    // Attacher l'événement Détails
    div.querySelector(".details-btn").addEventListener("click", (e) => {
        e.stopPropagation(); // éviter le click sur la carte
        openMovieModal(movie.id);
    });

    // Cliquer sur la carte ouvre aussi la modale
    div.addEventListener("click", () => openMovieModal(movie.id));

    return div;
}

// ==============================
// Remplir une catégorie
// ==============================
async function loadCategory(categoryId, genre="", limit=6) {
    const container = document.getElementById(categoryId);
    container.innerHTML = "";
    try {
        const res = await fetch(`${API_BASE}?genre=${genre}&sort_by=-imdb_score&page_size=${limit}`);
        const data = await res.json();
        data.results.forEach(movie => {
            container.appendChild(createMovieCard(movie));
        });
    } catch(err) { console.error(err); }
}

// ==============================
// Boutons Voir plus / Voir moins
// ==============================
document.querySelectorAll(".btn-see-more").forEach(btn => {
    btn.addEventListener("click", () => {
        const targetId = btn.dataset.target;
        const grid = document.getElementById(targetId);
        grid.classList.toggle("show-all");
        btn.textContent = grid.classList.contains("show-all") ? "Voir moins" : "Voir plus";
    });
});

// ==============================
// Charger le meilleur film
// ==============================
async function loadBestMovie() {
    try {
        const res = await fetch(`${API_BASE}?sort_by=-imdb_score&page_size=1`);
        const data = await res.json();
        const movie = data.results[0];

        document.getElementById("bestMovieTitle").textContent = movie.title;
        document.getElementById("bestMovieDescription").textContent = movie.description;
        document.getElementById("bestMoviePoster").src = movie.image_url;

        // Attacher bouton Détails
        document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(movie.id);
    } catch(err) {
        console.error("Erreur meilleur film :", err);
    }
}

// ==============================
// Initialisation
// ==============================
loadBestMovie();
loadCategory("topRatedMovies");
loadCategory("actionMovies","Action");
loadCategory("comedyMovies","Comedy");
