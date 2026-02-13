let allNames = [];
let currentFilter = 'all';
let currentSearch = '';
let selectedFirstLetter = null;
let selectedContainsLetters = [];

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
        if (currentFilter === 'neutral') {
            // Show only neutral names
            filtered = filtered.filter(name => name.gender === 'neutral');
        } else {
            // For kluk/holka, include both specific gender and neutral names
            filtered = filtered.filter(name =>
                name.gender === currentFilter || name.gender === 'neutral'
            );
        }
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

// Capitalize name properly (handles composite names)
function capitalizeName(name) {
    // Handle composite names with hyphens and spaces
    return name
        .trim() // Remove leading/trailing whitespace
        .split(/([- ])/) // Split on hyphens and spaces, but keep the delimiters
        .map(part => {
            if (part === '-' || part === ' ') {
                return part; // Keep delimiters as-is
            }
            if (part === '') {
                return part; // Skip empty parts
            }
            // Capitalize first letter, lowercase the rest
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');
}

// Get random subset of names using Fisher-Yates shuffle
function getRandomSubset(arr, count) {
    const result = [];
    const copy = [...arr];
    const n = Math.min(count, copy.length);

    for (let i = 0; i < n; i++) {
        const randomIndex = Math.floor(Math.random() * (copy.length - i)) + i;
        [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
        result.push(copy[i]);
    }

    return result;
}

// Calculate number of columns in the grid
function getGridColumnCount() {
    const grid = document.getElementById('namesGrid');
    const gridWidth = grid.offsetWidth;
    const minColumnWidth = 200; // From CSS: minmax(200px, 1fr)
    const gap = 15; // From CSS: gap: 15px

    // Calculate how many columns fit
    const columns = Math.floor((gridWidth + gap) / (minColumnWidth + gap));
    return Math.max(1, columns);
}

// Calculate optimal number of names to display (multiple of columns)
function calculateRandomSubsetSize() {
    const columns = getGridColumnCount();
    const targetRows = 5; // Aim for about 5 rows
    return columns * targetRows;
}

// Display names in the grid
function displayNames() {
    const filtered = getFilteredNames();
    const grid = document.getElementById('namesGrid');
    const resultsCount = document.getElementById('resultsCount');

    // If no search is active and results are large, show random subset
    let namesToDisplay = filtered;
    const randomSubsetSize = calculateRandomSubsetSize();
    const showRandomSubset = !currentSearch && filtered.length > randomSubsetSize;

    if (showRandomSubset) {
        namesToDisplay = getRandomSubset(filtered, randomSubsetSize);
        resultsCount.textContent = `${randomSubsetSize} náhodných jmen z ${filtered.length}`;
    } else {
        // When showing all results (not random), sort alphabetically
        namesToDisplay = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
        // Update results count
        resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'jméno' : filtered.length < 5 ? 'jména' : 'jmen'}`;
    }

    // Clear grid
    grid.innerHTML = '';

    // Add filtered names
    namesToDisplay.forEach(name => {
        const card = document.createElement('div');
        card.className = 'name-card';

        // Determine gender label and icon
        let genderLabel;
        if (name.gender === 'kluk') {
            genderLabel = '👦 Chlapec';
        } else if (name.gender === 'holka') {
            genderLabel = '👧 Dívka';
        } else {
            genderLabel = '⚧ Neutrální';
        }

        card.innerHTML = `
            <div class="name-text">${capitalizeName(name.name)}</div>
            <div class="name-gender ${name.gender}">${genderLabel}</div>
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

    // Info icon toggle
    const infoIcon = document.querySelector('.info-icon');
    const infoBox = document.getElementById('infoBox');

    if (infoIcon && infoBox) {
        infoIcon.addEventListener('click', () => {
            infoBox.classList.toggle('hidden');
        });
    }

    // Alphabet filter toggle (first letter)
    const alphabetToggle = document.getElementById('alphabetToggle');
    const alphabetFilter = document.getElementById('alphabetFilter');

    // Contains filter toggle
    const containsToggle = document.getElementById('containsToggle');
    const containsFilter = document.getElementById('containsFilter');

    // Check if filters are side by side (based on screen width)
    function areFiltersSideBySide() {
        return window.innerWidth > 768;
    }

    alphabetToggle.addEventListener('click', () => {
        const wasHidden = alphabetFilter.classList.contains('hidden');
        alphabetFilter.classList.toggle('hidden');
        alphabetToggle.classList.toggle('active');

        // If filters are side by side, sync the other one
        if (areFiltersSideBySide()) {
            if (wasHidden) {
                // Opening - also open the other one if closed
                if (containsFilter.classList.contains('hidden')) {
                    containsFilter.classList.remove('hidden');
                    containsToggle.classList.add('active');
                }
            } else {
                // Closing - also close the other one
                containsFilter.classList.add('hidden');
                containsToggle.classList.remove('active');
            }
        }
    });

    containsToggle.addEventListener('click', () => {
        const wasHidden = containsFilter.classList.contains('hidden');
        containsFilter.classList.toggle('hidden');
        containsToggle.classList.toggle('active');

        // If filters are side by side, sync the other one
        if (areFiltersSideBySide()) {
            if (wasHidden) {
                // Opening - also open the other one if closed
                if (alphabetFilter.classList.contains('hidden')) {
                    alphabetFilter.classList.remove('hidden');
                    alphabetToggle.classList.add('active');
                }
            } else {
                // Closing - also close the other one
                alphabetFilter.classList.add('hidden');
                alphabetToggle.classList.remove('active');
            }
        }
    });

    // Build combined search pattern from selected letters
    function buildLetterPattern() {
        let pattern = '';

        if (selectedFirstLetter) {
            pattern = `^${selectedFirstLetter}`;
        } else {
            pattern = '^';
        }

        // Add lookaheads for each contains letter (ensures all are present in any order)
        if (selectedContainsLetters.length > 0) {
            const lookaheads = selectedContainsLetters.map(letter => `(?=.*${letter})`).join('');
            pattern += lookaheads;
        }

        pattern += '.*';

        // Only return pattern if we have at least one filter selected
        if (selectedFirstLetter || selectedContainsLetters.length > 0) {
            return pattern;
        }

        return '';
    }

    // Update search input with combined pattern
    function updateSearchFromLetters() {
        const pattern = buildLetterPattern();
        searchInput.value = pattern;
        searchInput.dispatchEvent(new Event('input'));
    }

    // Generate alphabet filter letters
    const alphabet = 'AÁBCČDĎEÉĚFGHIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽ'.split('');

    // First letter filter
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => {
            // Toggle selection
            if (selectedFirstLetter === letter) {
                selectedFirstLetter = null;
                btn.classList.remove('active');
            } else {
                selectedFirstLetter = letter;
                // Visual feedback
                document.querySelectorAll('.letter-btn:not(.contains-letter-btn)').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
            updateSearchFromLetters();
        });
        alphabetFilter.appendChild(btn);
    });

    // Contains letter filter (allows multiple selections)
    alphabet.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'letter-btn contains-letter-btn';
        btn.textContent = letter;
        btn.dataset.letter = letter;
        btn.addEventListener('click', () => {
            // Toggle selection in array
            const index = selectedContainsLetters.indexOf(letter);
            if (index > -1) {
                // Remove from selection
                selectedContainsLetters.splice(index, 1);
                btn.classList.remove('active');
            } else {
                // Add to selection
                selectedContainsLetters.push(letter);
                btn.classList.add('active');
            }
            updateSearchFromLetters();
        });
        containsFilter.appendChild(btn);
    });

    // Clear active letter when search is manually changed
    searchInput.addEventListener('input', () => {
        const currentPattern = searchInput.value;
        const expectedPattern = buildLetterPattern();

        // Only clear if the search was manually changed (doesn't match our pattern)
        if (currentPattern !== expectedPattern) {
            // Clear all selections if search was manually edited
            selectedFirstLetter = null;
            selectedContainsLetters = [];
            document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('active'));
        }
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
