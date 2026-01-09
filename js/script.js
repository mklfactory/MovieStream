const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

async function fetchJSON(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur lors du chargement : " + url);
    return response.json();
}

async function loadBestMovie() {
    const data = await fetchJSON(`${API_URL}?sort_by=-imdb_score&page=1`);
    const bestMovie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = bestMovie.title;
    document.getElementById("bestMovieDescription").textContent = bestMovie.description || "Aucune description";
    const poster = document.getElementById("bestMoviePoster");
    poster.src = bestMovie.image_url;
    poster.classList.remove("d-none");

    document.getElementById("bestMovieDetailsBtn").addEventListener("click", () =>
        openMovieModal(bestMovie.id)
    );
}

async function loadMovies(containerId, url, limit = 6) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    const movies = [];
    let page1 = await fetchJSON(url + "&page=1");
    let page2 = await fetchJSON(url + "&page=2");
    movies.push(...page1.results, ...page2.results);

    let html = "";
    movies.slice(0, limit).forEach(movie => {
        html += `
        <div class="movie-card" id="movie-${movie.id}">
            <img src="${movie.image_url}" alt="${movie.title}">
            <div class="overlay">
                <h5>${movie.title}</h5>
                <button onclick="openMovieModal(${movie.id})">Détails</button>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

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

function loadPredefinedCategories() {
    loadMovies("topRatedMovies", `${API_URL}?sort_by=-imdb_score`);
    loadMovies("actionMovies", `${API_URL}?genre=Action&sort_by=-imdb_score`);
    loadMovies("comedyMovies", `${API_URL}?genre=Comedy&sort_by=-imdb_score`);
}

async function loadCategoriesSelector() {
    const data = await fetchJSON(CATEGORY_URL);
    const selector = document.getElementById("categorySelector");
    selector.innerHTML = `<option value="">Choisir une catégorie...</option>`;
    data.results.forEach(cat => selector.innerHTML += `<option value="${cat.name}">${cat.name}</option>`);
    selector.addEventListener("change", () => {
        const cat = selector.value;
        if (cat) loadMovies("customCategoryMovies", `${API_URL}?genre=${cat}&sort_by=-imdb_score`);
    });
}

function setupShowMoreButtons() {
    document.querySelectorAll(".btn-see-more").forEach(button => {
        button.addEventListener("click", () => {
            const grid = button.previousElementSibling;
            grid.classList.toggle("show-all");
            button.textContent = grid.classList.contains("show-all") ? "Voir moins" : "Voir plus";
        });
    });
}

async function init() {
    document.getElementById("loadingSpinner").style.display = "block";
    await loadBestMovie();
    loadPredefinedCategories();
    loadCategoriesSelector();
    setupShowMoreButtons();
    document.getElementById("loadingSpinner").style.display = "none";
}

init();
