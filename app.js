let allNames = [];
let currentFilter = 'all';
let currentSearch = '';

// Load names from JSON file
async function loadNames() {
    try {
        const response = await fetch('jmena.json');
        allNames = await response.json();
        displayNames();
    } catch (error) {
        console.error('Error loading names:', error);
        document.getElementById('namesGrid').innerHTML =
            '<p style="color: white; text-align: center;">Chyba při načítání jmen</p>';
    }
}

// Filter and search names
function getFilteredNames() {
    let filtered = allNames;

    // Apply gender filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(name => name.gender === currentFilter);
    }

    // Apply search filter
    if (currentSearch) {
        const searchLower = currentSearch.toLowerCase();
        filtered = filtered.filter(name =>
            name.name.toLowerCase().includes(searchLower)
        );
    }

    return filtered;
}

// Display names in the grid
function displayNames() {
    const filtered = getFilteredNames();
    const grid = document.getElementById('namesGrid');
    const resultsCount = document.getElementById('resultsCount');

    // Update results count
    resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'jméno' : filtered.length < 5 ? 'jména' : 'jmen'}`;

    // Clear grid
    grid.innerHTML = '';

    // Add filtered names
    filtered.forEach(name => {
        const card = document.createElement('div');
        card.className = 'name-card';
        card.innerHTML = `
            <div class="name-text">${name.name}</div>
            <div class="name-gender ${name.gender}">${name.gender === 'kluk' ? '👦 Chlapec' : '👧 Dívka'}</div>
        `;
        grid.appendChild(card);
    });
}

// Setup event listeners
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        displayNames();
    });

    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Update filter
            currentFilter = button.dataset.filter;
            displayNames();
        });
    });
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadNames();
});
