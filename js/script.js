const API_BASE = "/api/v1/titles/";

// ==============================
// MODALE
// ==============================
const modal = document.getElementById("movieModal");
const modalClose = document.querySelector(".modal-close");
modalClose.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", (e) => { if (e.target === modal) modal.style.display = "none"; });

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
    } catch (err) { console.error("Erreur modale :", err); }
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
            <button>Détails</button>
        </div>`;
    return div;
}

// ==============================
// REMPLISSAGE GRID ET MODALE
// ==============================
async function loadCategory(categoryId, genre="", limit=6) {
    const container = document.getElementById(categoryId);
    container.innerHTML = "";
    try {
        const res = await fetch(`${API_BASE}?genre=${genre}&sort_by=-imdb_score&page_size=${limit}`);
        const data = await res.json();
        data.results.forEach(movie => {
            const card = createMovieCard(movie);
            container.appendChild(card);
        });
        attachCardEvents(categoryId);
    } catch(err) { console.error(err); }
}

// ==============================
// ATTACHE LES ÉVÉNEMENTS AUX CARTES
// ==============================
function attachCardEvents(containerId) {
    const container = document.getElementById(containerId);
    container.querySelectorAll(".movie-card").forEach(card => {
        const movieId = card.dataset.id;
        const btn = card.querySelector("button");
        if (btn) btn.onclick = (e) => { e.stopPropagation(); openMovieModal(movieId); };
        card.onclick = () => openMovieModal(movieId);
    });
}

// ==============================
// BOUTONS VOIR PLUS / VOIR MOINS
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
// CHARGEMENT INITIAL
// ==============================
async function loadBestMovie() {
    try {
        const res = await fetch(`${API_BASE}?sort_by=-imdb_score&page_size=1`);
        const data = await res.json();
        const movie = data.results[0];
        document.getElementById("bestMovieTitle").textContent = movie.title;
        document.getElementById("bestMovieDescription").textContent = movie.description;
        document.getElementById("bestMoviePoster").src = movie.image_url;
        document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(movie.id);
    } catch(err) { console.error(err); }
}

// ==============================
// INITIALISATION
// ==============================
loadBestMovie();
loadCategory("topRatedMovies");
loadCategory("actionMovies","Action");
loadCategory("comedyMovies","Comedy");
