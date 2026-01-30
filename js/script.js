const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

async function fetchJSON(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Erreur fetch : "+url);
    return res.json();
}

async function loadBestMovie() {
    const data = await fetchJSON(`${API_URL}?min_year=2000&ordering=-imdb_score&page=1`);
    const best = data.results[0];
    document.getElementById("bestMovieTitle").textContent = best.title;
    console.log(best);
    document.getElementById("bestMovieDescription").textContent = best.description || "Découvrez le film le mieux noté selon IMDB.";
    const poster = document.getElementById("bestMoviePoster");
    poster.src = best.image_url;
    poster.classList.remove("d-none");
    document.getElementById("bestMovieDetailsBtn").onclick = () => openModal(best.id);
}

async function loadMovies(containerId,url,limit=6){
    const container = document.getElementById(containerId);
    container.innerHTML = "";
    let movies = [];
    const p1 = await fetchJSON(url+"&page=1");
    const p2 = await fetchJSON(url+"&page=2");
    movies.push(...p1.results,...p2.results);

    movies.slice(0,limit).forEach(m=>{
        const card = document.createElement("div");
        card.className="movie-card";
        card.innerHTML=`<img src="${m.image_url}" alt="${m.title}">
            <div class="overlay">
                <h5>${m.title}</h5>
                <button>Détails</button>
            </div>`;
        card.querySelector("button").onclick = ()=>openModal(m.id);
        container.appendChild(card);
    });
}

async function openModal(id){
    const m = await fetchJSON(`${API_URL}${id}`);
    document.getElementById("modalMovieTitle").textContent = m.title;
    document.getElementById("modalMoviePoster").src = m.image_url;
    document.getElementById("modalMovieSummary").textContent = m.long_description || m.description;
    document.getElementById("modalMovieDetails").innerHTML = `
        <p><strong>Genre :</strong> ${m.genres.join(", ")}</p>
        <p><strong>Année :</strong> ${m.year}</p>
        <p><strong>IMDB :</strong> ${m.imdb_score}</p>
        <p><strong>Réalisateur(s) :</strong> ${m.directors.join(", ")}</p>
        <p><strong>Acteurs :</strong> ${m.actors.join(", ")}</p>
        <p><strong>Durée :</strong> ${m.duration} min</p>
    `;
    document.getElementById("movieModal").style.display="block";
}

document.querySelector(".modal-close").onclick = ()=>{ document.getElementById("movieModal").style.display="none"; }
window.onclick = (e)=>{ if(e.target.id=="movieModal") e.target.style.display="none"; }

async function loadCategoriesSelector(){
    const data = await fetchJSON(CATEGORY_URL);
    const sel = document.getElementById("categorySelector");
    data.results.forEach(cat=> sel.innerHTML+=`<option value="${cat.name}">${cat.name}</option>`);
    sel.onchange = ()=> {
        if(sel.value) loadMovies("customCategoryMovies",`${API_URL}?genre=${sel.value}&sort_by=-imdb_score`);
    }
}

function setupShowMoreButtons(){
    document.querySelectorAll(".btn-see-more").forEach(b=>{
        b.onclick = ()=>{
            const grid = b.previousElementSibling;
            grid.classList.toggle("show-all");
            b.textContent = grid.classList.contains("show-all") ? "Voir moins" : "Voir plus";
        }
    });
}

async function init(){
    document.getElementById("loadingSpinner").style.display="block";
    await loadBestMovie();
    loadMovies("topRatedMovies",`${API_URL}?sort_by=-imdb_score`);
    loadMovies("actionMovies",`${API_URL}?genre=Action&min_year=2000&ordering=-imdb_score`);
    loadMovies("comedyMovies",`${API_URL}?genre=Comedy&min_year=2000&ordering=-imdb_score`);
    loadCategoriesSelector();
    setupShowMoreButtons();
    document.getElementById("loadingSpinner").style.display="none";
}

init();
