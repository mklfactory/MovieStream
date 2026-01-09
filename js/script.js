/*********************************
 * CONFIG
 *********************************/
const API_URL = "http://localhost:8000/api/movies/";

/*********************************
 * UTILITAIRES
 *********************************/
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.classList.add("movie-card");

    card.innerHTML = `
        <img src="${movie.image_url}" alt="${movie.title}">
        <div class="overlay">
            <h5>${movie.title}</h5>
            <button>Détails</button>
        </div>
    `;

    card.querySelector("button").addEventListener("click", (e) => {
        e.stopPropagation();
        openModal(movie);
    });

    card.addEventListener("click", () => openModal(movie));

    return card;
}

/*********************************
 * MODALE
 *********************************/
const modal = document.getElementById("movieModal");
const modalClose = document.querySelector(".modal-close");

function openModal(movie) {
    document.getElementById("modalMoviePoster").src = movie.image_url;
    document.getElementById("modalMovieTitle").textContent = movie.title;
    document.getElementById("modalMovieSummary").textContent =
        movie.description || "Aucune description disponible.";

    modal.style.display = "block";
}

modalClose.addEventListener("click", () => {
    modal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
});

/*********************************
 * VOIR PLUS / VOIR MOINS
 *********************************/
document.querySelectorAll(".btn-see-more").forEach((btn) => {
    btn.addEventListener("click", () => {
        const grid = btn.previousElementSibling;
        grid.classList.toggle("show-all");

        btn.textContent = grid.classList.contains("show-all")
            ? "Voir moins"
            : "Voir plus";
    });
});

/*********************************
 * HERO – MEILLEUR FILM
 *********************************/
async function loadBestMovie() {
    const response = await fetch(`${API_URL}?ordering=-imdb_score&page_size=1`);
    const data = await response.json();
    const movie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent =
        movie.description;

    const poster = document.getElementById("bestMoviePoster");
    poster.src = movie.image_url;
    poster.style.display = "block";

    document.getElementById("bestMovieDetailsBtn").onclick = () =>
        openModal(movie);
}

/*********************************
 * CATÉGORIES
 *********************************/
async function loadCategory(containerId, params) {
    const response = await fetch(`${API_URL}${params}`);
    const data = await response.json();
    const container = document.getElementById(containerId);

    container.innerHTML = "";

    data.results.slice(0, 6).forEach((movie) => {
        container.appendChild(createMovieCard(movie));
    });
}

/*********************************
 * INITIALISATION
 *********************************/
async function init() {
    await loadBestMovie();

    await loadCategory("topRatedMovies", "?ordering=-imdb_score");
    await loadCategory("actionMovies", "?genres=Action");
    await loadCategory("comedyMovies", "?genres=Comedy");

    document.getElementById("loadingSpinner")?.remove();
}

init();
