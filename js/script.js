const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

// FETCH UTILS
async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur chargement: " + url);
    return res.json();
}

// HERO
async function loadBestMovie() {
    const data = await fetchJSON(`${API_URL}?sort_by=-imdb_score&page=1`);
    const movie = data.results[0];
    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent = movie.description || "Aucune description";
    const poster = document.getElementById("bestMoviePoster");
    poster.src = movie.image_url;
    poster.style.display = "block";

    document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(movie);
}

// CARTE FILM
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    card.innerHTML = `
        <img src="${movie.image_url}" alt="${movie.title}">
        <div class="overlay">
            <h5>${movie.title}</h5>
            <button>Details</button>
        </div>
    `;
    card.querySelector("button").onclick = (e) => { e.stopPropagation(); openMovieModal(movie); };
    return card;
}

// LOAD CATEGORY
async function loadMovies(containerId, params = "", limit = 6) {
    const container = document.getElementById(containerId);
    const data = await fetchJSON(API_URL + params);
    container.innerHTML = "";
    data.results.slice(0, limit).forEach(m => container.appendChild(createMovieCard(m)));
}

// CATEGORIES
async function loadCategoriesSelector() {
    const data = await fetchJSON(CATEGORY_URL);
    const selector = document.getElementById("categorySelector");
    data.results.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        selector.appendChild(opt);
    });
    selector.onchange = () => {
        if (selector.value) loadMovies("customCategoryMovies", `?genre=${selector.value}&sort_by=-imdb_score`);
    };
}

// MODALE
const modal = document.getElementById("movieModal");
const modalClose = document.querySelector(".modal-close");
function openMovieModal(movie) {
    document.getElementById("modalMovieTitle").textContent = movie.title;
    document.getElementById("modalMoviePoster").src = movie.image_url;
    document.getElementById("modalMovieDetails").innerHTML = `
        <p><strong>Genre :</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Année :</strong> ${movie.year}</p>
        <p><strong>Note IMDB :</strong> ${movie.imdb_score}</p>
        <p><strong>Réalisateur(s) :</strong> ${movie.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${movie.actors.join(", ")}</p>
        <p><strong>Durée :</strong> ${movie.duration} min</p>
    `;
    document.getElementById("modalMovieSummary").textContent = movie.long_description || movie.description;
    modal.style.display = "block";
}
modalClose.onclick = () => modal.style.display = "none";
window.onclick = (e) => { if(e.target==modal) modal.style.display="none"; };

// SHOW MORE BUTTONS
document.querySelectorAll(".btn-see-more").forEach(btn => {
    btn.onclick = () => {
        const target = document.getElementById(btn.dataset.target);
        target.classList.toggle("show-all");
        btn.textContent = target.classList.contains("show-all") ? "Voir moins" : "Voir plus";
    };
});

// INIT
async function init() {
    document.getElementById("loadingSpinner").style.display = "block";
    await loadBestMovie();
    await loadMovies("topRatedMovies", "?sort_by=-imdb_score");
    await loadMovies("actionMovies", "?genre=Action&sort_by=-imdb_score");
    await loadMovies("comedyMovies", "?genre=Comedy&sort_by=-imdb_score");
    await loadCategoriesSelector();
    document.getElementById("loadingSpinner").style.display = "none";
}
init();
