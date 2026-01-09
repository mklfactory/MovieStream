const API_BASE = "http://127.0.0.1:8000/api/v1/titles/";

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

closeModal.onclick = () => modal.classList.add("hidden");

async function fetchData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Erreur API");
    return response.json();
}

/* MEILLEUR FILM */
async function loadBestMovie() {
    const data = await fetchData(`${API_BASE}?sort_by=-imdb_score&page_size=1`);
    const movie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent = movie.description;
    document.getElementById("bestMoviePoster").src = movie.image_url;

    document.getElementById("bestMovieDetailsBtn")
        .onclick = () => openModal(movie.id);
}

/* CATÉGORIES */
async function loadCategory(containerId, genre = "") {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    const url = genre
        ? `${API_BASE}?genre=${genre}&sort_by=-imdb_score&page_size=6`
        : `${API_BASE}?sort_by=-imdb_score&page_size=6`;

    const data = await fetchData(url);

    data.results.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.image_url}">
            <div class="overlay">
                <h4>${movie.title}</h4>
                <button>Détails</button>
            </div>
        `;

        card.querySelector("button").onclick = () => openModal(movie.id);
        container.appendChild(card);
    });

    container.dataset.expanded = "false";
    applyVisibility(container);
}

/* VOIR PLUS / MOINS */
function applyVisibility(container) {
    const cards = [...container.children];
    const expanded = container.dataset.expanded === "true";

    let limit = 6;
    if (window.innerWidth < 768) limit = 2;
    else if (window.innerWidth < 1024) limit = 4;

    cards.forEach((card, index) => {
        card.style.display = expanded || index < limit ? "block" : "none";
    });
}

document.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.onclick = () => {
        const container = document.getElementById(btn.dataset.target);
        const expanded = container.dataset.expanded === "true";

        container.dataset.expanded = expanded ? "false" : "true";
        btn.textContent = expanded ? "Voir plus" : "Voir moins";

        applyVisibility(container);
    };
});

window.onresize = () => {
    document.querySelectorAll(".movies").forEach(applyVisibility);
};

/* MODALE */
async function openModal(id) {
    const movie = await fetchData(`${API_BASE}${id}`);

    document.getElementById("modalPoster").src = movie.image_url;
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalDetails").innerHTML = `
        <p><strong>Genres :</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Date :</strong> ${movie.date_published}</p>
        <p><strong>Classification :</strong> ${movie.rated || "N/A"}</p>
        <p><strong>Score IMDB :</strong> ${movie.imdb_score}</p>
        <p><strong>Réalisateur :</strong> ${movie.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${movie.actors.join(", ")}</p>
        <p><strong>Durée :</strong> ${movie.duration} min</p>
        <p><strong>Pays :</strong> ${movie.countries.join(", ")}</p>
        <p><strong>Recettes :</strong> ${movie.worldwide_gross_income || "N/A"}</p>
        <p>${movie.long_description}</p>
    `;

    modal.classList.remove("hidden");
}

/* GENRES */
async function loadGenres() {
    const data = await fetchData("http://127.0.0.1:8000/api/v1/genres/");
    const select = document.getElementById("genreSelect");

    data.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        select.appendChild(option);
    });

    select.onchange = () => loadCategory("others", select.value);
}

/* INIT */
loadBestMovie();
loadCategory("topRated");
loadCategory("action", "Action");
loadCategory("drama", "Drama");
loadGenres();
