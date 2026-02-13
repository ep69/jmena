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

// Check if string looks like a regex pattern
function looksLikeRegex(str) {
    // Check for common regex metacharacters
    return /[\^\$\*\+\?\{\}\[\]\(\)\|\\]/.test(str);
}

// Filter and search names
function getFilteredNames() {
    let filtered = allNames;

    // Apply gender filter
    if (currentFilter !== 'all') {
        filtered = filtered.filter(name => name.gender === currentFilter);
    }

    // Apply search/regex filter
    if (currentSearch) {
        const isRegexPattern = looksLikeRegex(currentSearch);

        if (isRegexPattern) {
            // Try to use as regex
            try {
                const regex = new RegExp(currentSearch, 'i');
                filtered = filtered.filter(name => regex.test(name.name));
            } catch (error) {
                // Invalid regex, fall back to plain text search
                const searchLower = currentSearch.toLowerCase();
                filtered = filtered.filter(name =>
                    name.name.toLowerCase().includes(searchLower)
                );
            }
        } else {
            // Plain text search
            const searchLower = currentSearch.toLowerCase();
            filtered = filtered.filter(name =>
                name.name.toLowerCase().includes(searchLower)
            );
        }
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
    // Search input (handles both plain text and regex)
    const searchInput = document.getElementById('searchInput');
    const searchStatus = document.getElementById('searchStatus');

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;

        // Update status indicator
        if (!currentSearch) {
            searchStatus.textContent = '';
            searchStatus.className = 'search-status';
        } else if (looksLikeRegex(currentSearch)) {
            try {
                new RegExp(currentSearch, 'i');
                searchStatus.textContent = '🎯 Regex';
                searchStatus.className = 'search-status regex-mode';
            } catch (error) {
                searchStatus.textContent = '⚠️ Neplatný regex (hledám jako text)';
                searchStatus.className = 'search-status text-mode';
            }
        } else {
            searchStatus.textContent = '🔍 Textové hledání';
            searchStatus.className = 'search-status text-mode';
        }

        displayNames();
    });

    // Regex example buttons
    const exampleButtons = document.querySelectorAll('.regex-example');
    exampleButtons.forEach(button => {
        button.addEventListener('click', () => {
            const pattern = button.dataset.pattern;
            searchInput.value = pattern;
            searchInput.dispatchEvent(new Event('input'));
        });
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
