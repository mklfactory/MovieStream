// =========================
// CONFIGURATION API
// =========================
const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

// =========================
// FETCH UTILITAIRE
// =========================
async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur lors du chargement : " + url);
    return response.json();
}

// =============================
// 1️⃣ MEILLEUR FILM (Hero Section)
// =============================
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

// =============================
// 2️⃣ AFFICHER UNE LISTE DE FILMS
// =============================
async function loadMovies(containerId, url, limit = 6) {
    const container = document.getElementById(containerId);
    container.innerHTML = ""; // reset

    const movies = [];

    // L’API retourne seulement 5 films par page → on récupère 2 pages
    let page1 = await fetchJSON(url + "&page=1");
    let page2 = await fetchJSON(url + "&page=2");

    movies.push(...page1.results, ...page2.results);

    // Générer le HTML
    let html = "";
    movies.slice(0, limit).forEach(movie => {
        html += createMovieCard(movie);
    });
    container.innerHTML = html;

    // Event delegation pour toutes les cartes
    container.querySelectorAll(".movie-card").forEach(card => {
        card.addEventListener("click", () => {
            const movieId = card.id.replace("movie-", "");
            openMovieModal(movieId);
        });
    });
}

// =============================
// 3️⃣ GÉNÉRATION HTML D’UNE CARTE FILM
// =============================
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

// =============================
// 4️⃣ OUVERTURE DE LA MODALE
// =============================
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

// =============================
// 5️⃣ CATÉGORIES PRÉDÉFINIES
// =============================
function loadPredefinedCategories() {
    loadMovies("topRatedMovies", `${API_URL}?sort_by=-imdb_score`);
    loadMovies("actionMovies", `${API_URL}?genre=Action&sort_by=-imdb_score`);
    loadMovies("comedyMovies", `${API_URL}?genre=Comedy&sort_by=-imdb_score`);
}

// =============================
// 6️⃣ CHARGER TOUTES LES CATÉGORIES
// =============================
async function loadCategoriesSelector() {
    const data = await fetchJSON(CATEGORY_URL);

    const selector = document.getElementById("categorySelector");
    selector.innerHTML = `<option value="">Choisir une catégorie...</option>`;

    data.results.forEach(cat => {
        selector.innerHTML += `<option value="${cat.name}">${cat.name}</option>`;
    });

    selector.addEventListener("change", () => {
        const category = selector.value;
        if (category) {
            loadMovies("customCategoryMovies", `${API_URL}?genre=${category}&sort_by=-imdb_score`);
        }
    });
}

// ======================================
// 7️⃣ GESTION DES BOUTONS "VOIR PLUS"
// ======================================
function setupShowMoreButtons() {
    const buttons = [
        { id: "showMoreTopRated", target: "topRatedMovies", url: `${API_URL}?sort_by=-imdb_score` },
        { id: "showMoreAction", target: "actionMovies", url: `${API_URL}?genre=Action&sort_by=-imdb_score` },
        { id: "showMoreComedy", target: "comedyMovies", url: `${API_URL}?genre=Comedy&sort_by=-imdb_score` },
        { id: "showMoreCustom", target: "customCategoryMovies", dynamic: true }
    ];

    buttons.forEach(b => {
        document.getElementById(b.id).addEventListener("click", () => {
            const selectorValue = document.getElementById("categorySelector")?.value;
            const url = b.dynamic ? `${API_URL}?genre=${selectorValue}&sort_by=-imdb_score` : b.url;
            loadMovies(b.target, url, 12); // passe de 6 → 12 films
        });
    });
}

// =============================
// 8️⃣ INITIALISATION GLOBALE
// =============================
async function init() {
    document.getElementById("loadingSpinner").style.display = "block";

    await loadBestMovie();
    loadPredefinedCategories();
    loadCategoriesSelector();
    setupShowMoreButtons();

    document.getElementById("loadingSpinner").style.display = "none";
}

init();
