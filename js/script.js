const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur lors du chargement : " + url);
    return response.json();
}

// Meilleur film
async function loadBestMovie() {
    const data = await fetchJSON(`${API_URL}?sort_by=-imdb_score&page=1`);
    const bestMovie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = bestMovie.title;
    document.getElementById("bestMovieDescription").textContent = bestMovie.description || "Aucune description";
    document.getElementById("bestMoviePoster").src = bestMovie.image_url;
    document.getElementById("bestMoviePoster").classList.remove("d-none");

    document.getElementById("bestMovieDetailsBtn").addEventListener("click", () =>
        openMovieModal(bestMovie.id)
    );
}

// Liste de films
async function loadMovies(containerId, url, limit = 6) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const movies = [];
    let page1 = await fetchJSON(url + "&page=1");
    let page2 = await fetchJSON(url + "&page=2");
    movies.push(...page1.results, ...page2.results);

    container.innerHTML = movies.slice(0, limit).map(createMovieCard).join("");

    container.querySelectorAll(".movie-card").forEach(card => {
        card.addEventListener("click", () => {
            const movieId = card.id.replace("movie-", "");
            openMovieModal(movieId);
        });
    });
}

// Carte film
function createMovieCard(movie) {
    return `
        <div class="movie-card" id="movie-${movie.id}">
            <img class="movie-poster" src="${movie.image_url}" alt="${movie.title}">
            <div class="p-3">
                <h5>${movie.title}</h5>
            </div>
        </div>
    `;
}

// Modale
async function openMovieModal(movieId) {
    const movie = await fetchJSON(`${API_URL}${movieId}`);

    document.getElementById("modalMovieTitle").textContent = movie.title;
    document.getElementById("modalMoviePoster").src = movie.image_url;
    document.getElementById("modalMovieSummary").textContent = movie.long_description || movie.description;

    document.getElementById("modalMovieDetails").innerHTML = `
        <p><strong>Genre :</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Année :</strong> ${movie.year}</p>
        <p><strong>Note IMDB :</strong> ${movie.imdb_score}</p>
        <p><strong>Réalisateur(s) :</strong> ${movie.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${movie.actors.join(", ")}</p>
        <p><strong>Durée :</strong> ${movie.duration} min</p>
    `;

    new bootstrap.Modal(document.getElementById("movieModal")).show();
}

// Catégories prédéfinies
function loadPredefinedCategories() {
    loadMovies("topRatedMovies", `${API_URL}?sort_by=-imdb_score`);
    loadMovies("actionMovies", `${API_URL}?genre=Action&sort_by=-imdb_score`);
    loadMovies("comedyMovies", `${API_URL}?genre=Comedy&sort_by=-imdb_score`);
}

// Catégorie personnalisée
async function loadCategoriesSelector() {
    const data = await fetchJSON(CATEGORY_URL);
    const selector = document.getElementById("categorySelector");
    selector.innerHTML = `<option value="">Choisir une catégorie...</option>`;
    data.results.forEach(cat => {
        selector.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });

    selector.addEventListener("change", () => {
        const category = selector.value;
        if (category) loadMovies("customCategoryMovies", `${API_URL}?genre=${category}&sort_by=-imdb_score`);
    });
}

// Voir plus - transition fluide
function setupShowMoreButtons() {
    const buttons = [
        { id: "showMoreTopRated", target: "topRatedMovies" },
        { id: "showMoreAction", target: "actionMovies" },
        { id: "showMoreComedy", target: "comedyMovies" },
        { id: "showMoreCustom", target: "customCategoryMovies" }
    ];

    buttons.forEach(b => {
        const btn = document.getElementById(b.id);
        const grid = document.getElementById(b.target);

        btn.addEventListener("click", () => {
            grid.classList.add("show-all");
            btn.style.display = "none"; // cacher le bouton
        });
    });
}

// Initialisation
async function init() {
    document.getElementById("loadingSpinner").style.display = "block";

    await loadBestMovie();
    loadPredefinedCategories();
    loadCategoriesSelector();
    setupShowMoreButtons();

    document.getElementById("loadingSpinner").style.display = "none";
}

init();
