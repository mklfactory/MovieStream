const API = "/api/v1/titles/";

const modal = document.getElementById("modal");
const closeModal = document.getElementById("closeModal");

closeModal.onclick = () => modal.classList.add("hidden");

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur API");
    return res.json();
}

/* BEST MOVIE */
async function loadBestMovie() {
    const data = await fetchJSON(`${API}?sort_by=-imdb_score&page_size=1`);
    const movie = data.results[0];

    document.getElementById("bestMovieTitle").textContent = movie.title;
    document.getElementById("bestMovieDescription").textContent = movie.description || "";
    document.getElementById("bestMoviePoster").src = movie.image_url;

    document.getElementById("bestMovieDetailsBtn").onclick = () => openModal(movie.id);
}

/* MOVIE LIST */
async function loadCategory(containerId, genre = "") {
    const container = document.getElementById(containerId);
    const url = genre
        ? `${API}?genre=${genre}&sort_by=-imdb_score&page_size=12`
        : `${API}?sort_by=-imdb_score&page_size=12`;

    const data = await fetchJSON(url);

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
    updateView(container);
}

/* VOIR PLUS / MOINS */
function updateView(container) {
    const cards = container.children;
    const expanded = container.dataset.expanded === "true";

    [...cards].forEach((card, index) => {
        card.style.display = expanded || index < 4 ? "block" : "none";
    });
}

document.querySelectorAll("[data-target]").forEach(btn => {
    btn.onclick = () => {
        const container = document.getElementById(btn.dataset.target);
        const expanded = container.dataset.expanded === "true";
        container.dataset.expanded = (!expanded).toString();
        btn.textContent = expanded ? "Voir plus" : "Voir moins";
        updateView(container);
    };
});

/* MODAL */
async function openModal(id) {
    try {
        const movie = await fetchJSON(`${API}${id}`);
        document.getElementById("modalTitle").textContent = movie.title;
        document.getElementById("modalPoster").src = movie.image_url;
        document.getElementById("modalInfo").textContent =
            `Note IMDB : ${movie.imdb_score} | ${movie.year}`;
        modal.classList.remove("hidden");
    } catch {
        alert("Impossible de charger les détails du film.");
    }
}

/* INIT */
loadBestMovie();
loadCategory("topRated");
loadCategory("action", "Action");
