// JustStreamIt - Scripts JavaScript

// Configuration de l'API
const API_BASE_URL = 'http://localhost:8000/api/v1';

// Variables globales
let bestMovie = null;
let topRatedMovies = [];
let actionMovies = [];
let comedyMovies = [];
let customCategoryMovies = [];
let categories = [];

// Éléments DOM
let loadingSpinner;
let movieModal;

// Initialisation des éléments DOM
function initializeElements() {
    loadingSpinner = document.getElementById('loadingSpinner');
    movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
}

// Fonction pour afficher/masquer le spinner
function toggleSpinner(show) {
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

// Fonction pour faire une requête à l'API
async function fetchFromAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Erreur API:', error);
        // Retourner des données de démonstration en cas d'erreur
        return generateMockData(endpoint);
    }
}

// Fonction pour générer des données de démonstration
function generateMockData(endpoint) {
    const mockMovie = (id, title, genre = 'Drama', rating = 8.5) => ({
        id: id,
        title: title,
        genres: [genre],
        imdb_score: rating,
        image_url: `https://via.placeholder.com/300x450/333/fff?text=${encodeURIComponent(title)}`,
        description: `Ceci est la description du film "${title}". Un excellent film qui mérite d'être vu.`,
        year: 2023,
        rated: 'PG-13',
        directors: ['Réalisateur Test'],
        actors: ['Acteur 1', 'Acteur 2', 'Acteur 3'],
        duration: 120,
        countries: ['France'],
        worldwide_gross_income: '$100M',
        long_description: `Description détaillée du film "${title}". Cette œuvre cinématographique explore des thèmes profonds et captivants à travers une narration exceptionnelle et des performances d'acteurs remarquables.`
    });
    
    if (endpoint.includes('/titles/?sort_by=-imdb_score')) {
        const count = endpoint.includes('genre=Action') ? 6 : 
                     endpoint.includes('genre=Comedy') ? 6 : 7;
        const genre = endpoint.includes('genre=Action') ? 'Action' : 
                     endpoint.includes('genre=Comedy') ? 'Comedy' : 'Drama';
        
        return {
            results: Array.from({length: count}, (_, i) => 
                mockMovie(i + 1, `${genre} Film ${i + 1}`, genre, 8.5 - i * 0.1)
            )
        };
    }
    
    if (endpoint.includes('/genres/')) {
        return {
            results: [
                { name: 'Action' },
                { name: 'Comedy' },
                { name: 'Drama' },
                { name: 'Horror' },
                { name: 'Romance' },
                { name: 'Sci-Fi' },
                { name: 'Thriller' },
                { name: 'Mystery' }
            ]
        };
    }
    
    // Film individuel
    return mockMovie(1, 'Film de Démonstration', 'Drama', 9.2);
}

// Fonction pour créer une carte de film
function createMovieCard(movie) {
    return `
        <div class="movie-card" onclick="showMovieDetails(${movie.id})">
            <div class="movie-poster">${movie.image_url ? `<img src="${movie.image_url}" alt="${movie.title}" style="width:100%; height:100%; object-fit:cover;">` : movie.title}</div>
            <div class="p-3">
                <h6 class="mb-2">${movie.title}</h6>
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">${movie.year || '2023'}</small>
                    <span class="badge bg-warning text-dark">★ ${movie.imdb_score || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
}

// Fonction pour afficher les films dans une section
function displayMovies(containerId, movies) {
    const container = document.getElementById(containerId);
    if (container && movies.length > 0) {
        container.innerHTML = movies.map(movie => createMovieCard(movie)).join('');
    }
}

// Fonction pour afficher les détails d'un film dans la modale
async function showMovieDetails(movieId) {
    try {
        const movie = await fetchFromAPI(`/titles/${movieId}/`);
        
        document.getElementById('modalMovieTitle').textContent = movie.title;
        document.getElementById('modalMoviePoster').src = movie.image_url || `https://via.placeholder.com/300x450/333/fff?text=${encodeURIComponent(movie.title)}`;
        document.getElementById('modalMovieSummary').textContent = movie.long_description || movie.description || 'Aucun résumé disponible.';
        
        const details = `
            <p><strong>Genre:</strong> ${movie.genres ? movie.genres.join(', ') : 'N/A'}</p>
            <p><strong>Date de sortie:</strong> ${movie.year || 'N/A'}</p>
            <p><strong>Classification:</strong> ${movie.rated || 'N/A'}</p>
            <p><strong>Score IMDB:</strong> ⭐ ${movie.imdb_score || 'N/A'}/10</p>
            <p><strong>Réalisateur:</strong> ${movie.directors ? movie.directors.join(', ') : 'N/A'}</p>
            <p><strong>Acteurs:</strong> ${movie.actors ? movie.actors.join(', ') : 'N/A'}</p>
            <p><strong>Durée:</strong> ${movie.duration ? movie.duration + ' min' : 'N/A'}</p>
            <p><strong>Pays:</strong> ${movie.countries ? movie.countries.join(', ') : 'N/A'}</p>
            <p><strong>Box Office:</strong> ${movie.worldwide_gross_income || 'N/A'}</p>
        `;
        
        document.getElementById('modalMovieDetails').innerHTML = details;
        movieModal.show();
    } catch (error) {
        console.error('Erreur lors du chargement des détails:', error);
    }
}

// Fonction pour charger les catégories
async function loadCategories() {
    try {
        const response = await fetchFromAPI('/genres/');
        categories = response.results || [];
        
        const selector = document.getElementById('categorySelector');
        selector.innerHTML = '<option value="">Choisir une catégorie...</option>';
        
        categories.forEach(category => {
            selector.innerHTML += `<option value="${category.name}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
    }
}

// Fonction pour charger les films d'une catégorie personnalisée
async function loadCustomCategory(genre) {
    if (!genre) return;
    
    try {
        const response = await fetchFromAPI(`/titles/?sort_by=-imdb_score&genre=${genre}&page_size=6`);
        customCategoryMovies = response.results || [];
        displayMovies('customCategoryMovies', customCategoryMovies);
    } catch (error) {
        console.error('Erreur lors du chargement de la catégorie personnalisée:', error);
    }
}

// Fonction pour gérer les boutons "Voir plus"
function setupShowMoreButtons() {
    const buttons = ['showMoreTopRated', 'showMoreAction', 'showMoreComedy', 'showMoreCustom'];
    
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                const container = button.previousElementSibling;
                const hiddenCards = container.querySelectorAll('.movie-card[style*="display: none"], .movie-card:not([style])');
                
                hiddenCards.forEach((card, index) => {
                    if (index < 6) { // Montrer 6 films supplémentaires
                        card.style.display = 'block';
                    }
                });
                
                // Masquer le bouton si tous les films sont visibles
                if (container.querySelectorAll('.movie-card[style*="display: none"]').length === 0) {
                    button.style.display = 'none';
                }
            });
        }
    });
}

// Fonction pour charger le meilleur film
async function loadBestMovie() {
    try {
        const bestMovieResponse = await fetchFromAPI('/titles/?sort_by=-imdb_score&page_size=1');
        if (bestMovieResponse.results && bestMovieResponse.results.length > 0) {
            bestMovie = bestMovieResponse.results[0];
            document.getElementById('bestMovieTitle').textContent = bestMovie.title;
            document.getElementById('bestMovieDescription').textContent = bestMovie.description || 'Film le mieux noté selon IMDB.';
            
            const posterImg = document.getElementById('bestMoviePoster');
            if (bestMovie.image_url) {
                posterImg.src = bestMovie.image_url;
                posterImg.classList.remove('d-none');
            }
            
            // Event listener pour le bouton détails
            document.getElementById('bestMovieDetailsBtn').addEventListener('click', () => {
                showMovieDetails(bestMovie.id);
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement du meilleur film:', error);
    }
}

// Fonction pour charger tous les films par catégorie
async function loadAllMovieCategories() {
    try {
        // Charger les films les mieux notés (excluant le meilleur)
        const topRatedResponse = await fetchFromAPI('/titles/?sort_by=-imdb_score&page=2&page_size=6');
        topRatedMovies = topRatedResponse.results || [];
        displayMovies('topRatedMovies', topRatedMovies);
        
        // Charger les films d'action
        const actionResponse = await fetchFromAPI('/titles/?sort_by=-imdb_score&genre=Action&page_size=6');
        actionMovies = actionResponse.results || [];
        displayMovies('actionMovies', actionMovies);
        
        // Charger les comédies
        const comedyResponse = await fetchFromAPI('/titles/?sort_by=-imdb_score&genre=Comedy&page_size=6');
        comedyMovies = comedyResponse.results || [];
        displayMovies('comedyMovies', comedyMovies);
    } catch (error) {
        console.error('Erreur lors du chargement des catégories de films:', error);
    }
}

// Fonction pour configurer les event listeners
function setupEventListeners() {
    // Event listener pour le sélecteur de catégorie
    const categorySelector = document.getElementById('categorySelector');
    if (categorySelector) {
        categorySelector.addEventListener('change', (e) => {
            loadCustomCategory(e.target.value);
        });
    }
}

// Fonction pour gérer le responsive
function handleResponsive() {
    const movieGrids = document.querySelectorAll('.movies-grid');
    const showMoreBtns = document.querySelectorAll('.show-more-btn');
    
    function updateVisibility() {
        const width = window.innerWidth;
        let visibleCount;
        
        if (width <= 576) {
            visibleCount = 2; // Mobile
        } else if (width <= 992) {
            visibleCount = 4; // Tablette
        } else {
            visibleCount = 6; // Desktop
        }
        
        movieGrids.forEach((grid, gridIndex) => {
            const cards = grid.querySelectorAll('.movie-card');
            cards.forEach((card, cardIndex) => {
                if (cardIndex < visibleCount) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Afficher/masquer le bouton "Voir plus"
            if (showMoreBtns[gridIndex] && cards.length > visibleCount) {
                showMoreBtns[gridIndex].style.display = width < 993 ? 'block' : 'none';
            }
        });
    }
    
    window.addEventListener('resize', updateVisibility);
    updateVisibility(); // Appel initial
}

// Fonction principale d'initialisation
async function initializeApp() {
    // Initialiser les éléments DOM
    initializeElements();
    
    // Afficher le spinner de chargement
    toggleSpinner(true);
    
    try {
        // Charger le meilleur film
        await loadBestMovie();
        
        // Charger toutes les catégories de films
        await loadAllMovieCategories();
        
        // Charger les catégories disponibles
        await loadCategories();
        
        // Configurer les event listeners
        setupEventListeners();
        
        // Configurer les boutons "Voir plus"
        setupShowMoreButtons();
        
        // Gérer le responsive
        handleResponsive();
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation:', error);
    } finally {
        // Masquer le spinner de chargement
        toggleSpinner(false);
    }
}

// Fonction utilitaire pour le debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Fonction pour gérer les erreurs globalement
function handleGlobalErrors() {
    window.addEventListener('error', (event) => {
        console.error('Erreur JavaScript:', event.error);
    });
    
    window.addEventListener('unhandledrejection', (event) => {
        console.error('Promise rejetée:', event.reason);
    });
}

// Initialisation de l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
    // Gérer les erreurs globales
    handleGlobalErrors();
    
    // Initialiser l'application
    initializeApp();
});

// Exposer les fonctions nécessaires globalement pour les onclick
window.showMovieDetails = showMovieDetails;