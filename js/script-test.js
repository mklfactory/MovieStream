// script.js - Version async sans API pour JustStreamIt

async function initModalSystem() {
    // Récupération des éléments de la modale
    const modalElement = document.getElementById("movieModal");
    if (!modalElement) return;

    const modalTitle = document.getElementById("modalMovieTitle");
    const modalPoster = document.getElementById("modalMoviePoster");
    const modalSummary = document.getElementById("modalMovieSummary");
    const modalDetails = document.getElementById("modalMovieDetails");

    // Instance Bootstrap de la modale
    const bsModal = new bootstrap.Modal(modalElement);

    // Les éléments qui doivent ouvrir la modale
    const detailTriggers = document.querySelectorAll(".movie-details-btn");

    detailTriggers.forEach(trigger => {
        trigger.addEventListener("click", async () => {
            // Ici on pourrait faire des appels async/await plus tard si besoin
            const title = trigger.getAttribute("data-title") || "Titre inconnu";
            const genre = trigger.getAttribute("data-genre") || "—";
            const year = trigger.getAttribute("data-year") || "—";
            const rating = trigger.getAttribute("data-rating") || "—";
            const summary = trigger.getAttribute("data-summary") || "Aucun résumé disponible.";
            const poster = trigger.getAttribute("data-poster") || "https://placehold.co/300x450?text=Affiche";

            if (modalTitle) modalTitle.textContent = title;
            if (modalPoster) modalPoster.src = poster;
            if (modalSummary) modalSummary.textContent = summary;

            if (modalDetails) {
                modalDetails.innerHTML = `
                    <p class="mb-1"><strong>Genre :</strong> ${genre}</p>
                    <p class="mb-1"><strong>Année :</strong> ${year}</p>
                    <p class="mb-1"><strong>Note IMDB :</strong> ${rating}</p>
                `;
            }

            // Ouverture de la modale (synchrone, mais dans une fonction async)
            bsModal.show();
        });
    });
}

// Appel asynchrone après chargement du DOM
document.addEventListener("DOMContentLoaded", async () => {
    await initModalSystem();
});
