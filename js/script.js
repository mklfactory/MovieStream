const API_BASE = "http://127.0.0.1:8000/api/v1/titles/";

const modal = document.getElementById("movieModal");
const closeModalBtn = document.querySelector(".modal-close");

async function fetchMovies(url) {
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
}

// Afficher le meilleur film
async function loadBestMovie() {
    const movies = await fetchMovies(`${API_BASE}?sort_by=-imdb_score&page_size=1`);
    const movie = movies[0];
    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent = movie.description;
    document.getElementById("bestMoviePoster").src = movie.image_url;
    document.getElementById("bestMoviePoster").classList.remove("d-none");
    document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(movie);
}

// Crée une carte film
function createMovieCard(movie) {
    const div = document.createElement("div");
    div.className = "movie-card";

    const img = document.createElement("img");
    img.src = movie.image_url;
    img.alt = movie.title;
    div.appendChild(img);

    const overlay = document.createElement("div");
    overlay.className = "overlay";
    const title = document.createElement("h5");
    title.textContent = movie.title;
    overlay.appendChild(title);

    const detailsBtn = document.createElement("button");
    detailsBtn.textContent = "Détails";
    detailsBtn.className = "details-btn";
    overlay.appendChild(detailsBtn);

    div.appendChild(overlay);

    detailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openMovieModal(movie);
    });
    div.addEventListener("click", () => openMovieModal(movie));

    return div;
}

// Charger catégorie
async function loadCategory(category, elementId) {
    let url = `${API_BASE}?sort_by=-imdb_score&page_size=6`;
    if (category) url += `&genre=${category}`;
    const movies = await fetchMovies(url);
    const container = document.getElementById(elementId);
    movies.forEach(movie => container.appendChild(createMovieCard(movie)));
}

// Modale
async function openMovieModal(movie) {
    try {
        const movieId = movie.url ? movie.url.split("/").slice(-2)[0] : movie.id;
        const res = await fetch(`${API_BASE}${movieId}/`);
        if (!res.ok) throw new Error("Film introuvable");
        const data = await res.json();

        document.getElementById("modalMoviePoster").src = data.image_url;
        document.getElementById("modalMovieTitle").textContent = data.title;
        document.getElementById("modalMovieDetails").innerHTML = `
            <p><strong>Année :</strong> ${data.year}</p>
            <p><strong>IMDb :</strong> ${data.imdb_score}</p>
            <p><strong>Genres :</strong> ${data.genres.join(", ")}</p>`;
        document.getElementById("modalMovieSummary").textContent = data.description;

        modal.style.display = "block";
    } catch (err) {
        console.error(err);
        alert("Impossible de charger les détails du film.");
    }
}

closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if(event.target === modal) modal.style.display = "none"; };

// Voir plus / Voir moins
document.querySelectorAll(".btn-see-more").forEach(btn => {
    btn.addEventListener("click", e => {
        const grid = e.target.previousElementSibling;
        grid.classList.toggle("show-all");
        btn.textContent = grid.classList.contains("show-all") ? "Voir moins" : "Voir plus";
    });
});

// Initialisation
window.onload = async () => {
    await loadBestMovie();
    await loadCategory("", "topRatedMovies");
    await loadCategory("Action", "actionMovies");
    await loadCategory("Comedy", "comedyMovies");
};
