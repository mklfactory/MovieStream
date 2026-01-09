// =========================
// CONFIGURATION API
// =========================
const API_URL = "http://127.0.0.1:8000/api/v1/titles/";
const CATEGORY_URL = "http://127.0.0.1:8000/api/v1/genres/";

// =========================
// FETCH UTILITAIRE
// =========================
async function fetchJSON(url){
    const res = await fetch(url);
    if(!res.ok) throw new Error("Erreur lors du chargement : "+url);
    return res.json();
}

// =========================
// MEILLEUR FILM
// =========================
async function loadBestMovie(){
    const data = await fetchJSON(`${API_URL}?sort_by=-imdb_score&page_size=1`);
    const best = data.results[0];

    document.getElementById("bestMovieTitle").textContent = best.title;
    document.getElementById("bestMovieDescription").textContent = best.description || "Aucune description";
    document.getElementById("bestMoviePoster").src = best.image_url;

    document.getElementById("bestMovieDetailsBtn").onclick = () => openMovieModal(best.id);
}

// =========================
// AFFICHAGE FILMS
// =========================
async function loadMovies(containerId, url, limit=6){
    const container = document.getElementById(containerId);
    container.innerHTML="";

    const movies=[];
    let page1=await fetchJSON(url+"?page=1");
    let page2=await fetchJSON(url+"?page=2");
    movies.push(...page1.results, ...page2.results);

    movies.slice(0,limit).forEach(m=>{
        container.innerHTML += createMovieCard(m);
    });

    container.querySelectorAll(".movie-card").forEach(card=>{
        card.onclick = ()=>{
            const id = card.dataset.id;
            openMovieModal(id);
        };
    });
}

function createMovieCard(movie){
    return `
    <div class="movie-card" data-id="${movie.id}">
        <img src="${movie.image_url}" alt="${movie.title}">
        <div class="overlay">
            <h5>${movie.title}</h5>
            <button onclick="openMovieModal(${movie.id});event.stopPropagation();">Détails</button>
        </div>
    </div>`;
}

// =========================
// MODALE
// =========================
async function openMovieModal(id){
    const movie = await fetchJSON(API_URL+id);
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
    document.getElementById("movieModal").style.display="block";
}
document.querySelector(".modal-close").onclick = ()=>{
    document.getElementById("movieModal").style.display="none";
}

// =========================
// CATÉGORIES PRÉDÉFINIES
// =========================
function loadPredefinedCategories(){
    loadMovies("topRatedMovies", `${API_URL}?sort_by=-imdb_score`);
    loadMovies("actionMovies", `${API_URL}?genre=Action&sort_by=-imdb_score`);
    loadMovies("comedyMovies", `${API_URL}?genre=Comedy&sort_by=-imdb_score`);
}

// =========================
// CATEGORIES DYNAMIQUES
// =========================
async function loadCategoriesSelector(){
    const data = await fetchJSON(CATEGORY_URL);
    const selector=document.getElementById("categorySelector");
    data.results.forEach(cat=>{
        const opt = document.createElement("option");
        opt.value = cat.name;
        opt.textContent = cat.name;
        selector.appendChild(opt);
    });

    selector.onchange=()=>{
        const cat=selector.value;
        if(cat){
            loadMovies("customCategoryMovies", `${API_URL}?genre=${cat}&sort_by=-imdb_score`);
        }
    }
}

// =========================
// BOUTONS VOIR PLUS
// =========================
function setupShowMoreButtons(){
    const btns=[
        {id:"showMoreTopRated", target:"topRatedMovies", url:`${API_URL}?sort_by=-imdb_score`},
        {id:"showMoreAction", target:"actionMovies", url:`${API_URL}?genre=Action&sort_by=-imdb_score`},
        {id:"showMoreComedy", target:"comedyMovies", url:`${API_URL}?genre=Comedy&sort_by=-imdb_score`},
        {id:"showMoreCustom", target:"customCategoryMovies", dynamic:true}
    ];
    btns.forEach(b=>{
        const button = document.getElementById(b.id);
        button.onclick = ()=>{
            const selectorValue = document.getElementById("categorySelector")?.value;
            const url = b.dynamic ? `${API_URL}?genre=${selectorValue}&sort_by=-imdb_score` : b.url;
            loadMovies(b.target,url,12);
            button.textContent = "Voir moins";
            button.onclick = ()=>{
                loadMovies(b.target,url,6);
                button.textContent="Voir plus";
                setupShowMoreButtons();
            }
        }
    });
}

// =========================
// INITIALISATION
// =========================
async function init(){
    document.getElementById("loadingSpinner").style.display="block";
    await loadBestMovie();
    loadPredefinedCategories();
    loadCategoriesSelector();
    setupShowMoreButtons();
    document.getElementById("loadingSpinner").style.display="none";
}
init();
