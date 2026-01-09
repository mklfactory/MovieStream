const API_BASE = "http://127.0.0.1:8000/api/v1/titles/";
const API_GENRES = "http://127.0.0.1:8000/api/v1/genres/";

const modal = document.getElementById("movieModal");
const closeModalBtn = document.querySelector(".modal-close");

// MODALE
async function openMovieModal(movie) {
    try {
        const movieId = movie.id || movie.url.split("/").slice(-2)[0];
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

// FERME MODALE
closeModalBtn.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if(event.target === modal) modal.style.display = "none"; };

// Création carte film
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
    overlay.appendChild(detailsBtn);

    detailsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openMovieModal(movie);
    });

    div.addEventListener("click", () => openMovieModal(movie));

    div.appendChild(overlay);
    return div;
}

// Charger films
async function fetchMovies(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur API");
    const data = await res.json();
    return data.results || [];
}

// Meilleur film
async function loadBestMovie() {
    try {
        const movies = await fetchMovies(`${API_BASE}?sort_by=-imdb_score&page_size=1`);
        const movie = movies[0];
        document.getElementById("bestMovieTitle").textContent = movie.title;
        document.getElementById("bestMovieDescription").textContent = movie.description;
        document.getElementById("bestMoviePoster").src = movie.image_url;
        document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(movie);
    } catch (err) {
        console.error(err);
        document.getElementById("bestMovieTitle").textContent = "Erreur de chargement";
        document.getElementById("bestMovieDescription").textContent = "";
    }
}

// Charger les genres dynamiquement
async function loadGenres() {
    try {
        const res = await fetch(API_GENRES);
        if (!res.ok) throw new Error("Impossible de récupérer les genres");
        const genresData = await res.json();

        const container = document.getElementById("genresContainer");
        container.innerHTML = ""; // Supprimer le spinner

        for (const genre of genresData.results) {
            const section = document.createElement("section");
            section.className = "category-section";

            const h2 = document.createElement("h2");
            h2.textContent = genre.name;
            section.appendChild(h2);

            const grid = document.createElement("div");
            grid.className = "movies-grid";
            section.appendChild(grid);

            const btn = document.createElement("button");
            btn.className = "btn-see-more";
            btn.textContent = "Voir plus";
            section.appendChild(btn);

            btn.addEventListener("click", () => {
                grid.classList.toggle("show-all");
                btn.textContent = grid.classList.contains("show-all") ? "Voir moins" : "Voir plus";
            });

            container.appendChild(section);

            // Charger 6 films par genre
            const movies = await fetchMovies(`${API_BASE}?sort_by=-imdb_score&page_size=6&genre=${genre.name}`);
            movies.forEach(movie => grid.appendChild(createMovieCard(movie)));
        }
    } catch (err) {
        console.error(err);
    }
}

// INITIALISATION
window.onload = async () => {
    await loadBestMovie();
    await loadGenres();
};
