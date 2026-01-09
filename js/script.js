const API_BASE = "http://127.0.0.1:8000/api/v1/";

async function fetchAPI(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("Erreur API :", response.status);
        return null;
    }
    return await response.json();
}

/* =========================
   MEILLEUR FILM
========================= */
async function loadBestMovie() {
    const data = await fetchAPI(`${API_BASE}titles/?ordering=-imdb_score&page_size=1`);
    if (!data || !data.results.length) return;

    const movie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent = movie.description;
    document.getElementById("bestMoviePoster").src = movie.image_url;

    document.getElementById("bestMovieDetailsBtn")
        .onclick = () => openModal(movie.id);
}

/* =========================
   CATÉGORIES
========================= */
async function loadCategory(containerId, genre = "") {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    let url = `${API_BASE}titles/?ordering=-imdb_score&page_size=6`;
    if (genre) url += `&genre=${genre}`;

    const data = await fetchAPI(url);
    if (!data) return;

    data.results.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";

        card.innerHTML = `
            <img src="${movie.image_url}" alt="${movie.title}">
            <div class="overlay">
                <h4>${movie.title}</h4>
                <button>Détails</button>
            </div>
        `;

        card.querySelector("button")
            .addEventListener("click", () => openModal(movie.id));

        container.appendChild(card);
    });

    container.dataset.expanded = "false";
    applyVisibility(container);
}

/* =========================
   VOIR PLUS / MOINS
========================= */
function applyVisibility(container) {
    const cards = [...container.children];
    const expanded = container.dataset.expanded === "true";

    let visible = 6;
    if (window.innerWidth < 768) visible = 2;
    else if (window.innerWidth < 1024) visible = 4;

    cards.forEach((card, index) => {
        card.style.display = expanded || index < visible ? "block" : "none";
    });
}

document.querySelectorAll(".btn-toggle").forEach(button => {
    button.addEventListener("click", () => {
        const container = document.getElementById(button.dataset.target);
        const expanded = container.dataset.expanded === "true";

        container.dataset.expanded = expanded ? "false" : "true";
        button.textContent = expanded ? "Voir plus" : "Voir moins";

        applyVisibility(container);
    });
});

window.addEventListener("resize", () => {
    document.querySelectorAll(".movies").forEach(applyVisibility);
});

/* =========================
   MODALE
========================= */
async function openModal(id) {
    const movie = await fetchAPI(`${API_BASE}titles/${id}/`);
    if (!movie) return;

    document.getElementById("modalPoster").src = movie.image_url;
    document.getElementById("modalTitle").textContent = movie.title;
    document.getElementById("modalDetails").innerHTML = `
        <p><strong>Genres :</strong> ${movie.genres.join(", ")}</p>
        <p><strong>Date :</strong> ${movie.date_published}</p>
        <p><strong>Score IMDB :</strong> ${movie.imdb_score}</p>
        <p><strong>Réalisateur :</strong> ${movie.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${movie.actors.join(", ")}</p>
        <p><strong>Durée :</strong> ${movie.duration} min</p>
        <p><strong>Pays :</strong> ${movie.countries.join(", ")}</p>
        <p>${movie.long_description}</p>
    `;

    document.getElementById("modal").classList.remove("hidden");
}

document.getElementById("closeModal")
    .addEventListener("click", () =>
        document.getElementById("modal").classList.add("hidden")
    );

/* =========================
   GENRES
========================= */
async function loadGenres() {
    const data = await fetchAPI(`${API_BASE}genres/`);
    if (!data) return;

    const select = document.getElementById("genreSelect");

    data.forEach(genre => {
        const option = document.createElement("option");
        option.value = genre;
        option.textContent = genre;
        select.appendChild(option);
    });

    select.addEventListener("change", () =>
        loadCategory("others", select.value)
    );
}

/* =========================
   INIT
========================= */
loadBestMovie();
loadCategory("topRated");
loadCategory("action", "Action");
loadCategory("drama", "Drama");
loadGenres();
