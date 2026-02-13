const GRID_MIN_COLUMN_WIDTH = 200;
const GRID_GAP = 15;
const TARGET_ROWS = 5;
const SIDE_BY_SIDE_BREAKPOINT = 768;

let allNames = [];
let currentFilter = 'all';
let currentSearch = '';
let selectedFirstLetter = null;
let selectedContainsLetters = [];

// Check if filters are side by side (based on screen width)
function areFiltersSideBySide() {
    return window.innerWidth > SIDE_BY_SIDE_BREAKPOINT;
}

// Parse search pattern to extract letter filter components
function parseLetterPattern(pattern) {
    if (!pattern) return null;

    const result = {
        firstLetter: null,
        containsLetters: []
    };

    // Check if pattern matches our letter filter format: ^LETTER(?=.*L1)(?=.*L2).*
    // Pattern must end with .*
    if (!pattern.endsWith('.*')) {
        return null;
    }

    let remaining = pattern.slice(0, -2); // Remove .* at end

    // Check for first letter: ^LETTER
    if (remaining.startsWith('^')) {
        const firstLetterMatch = remaining.match(/^\^([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ])/);
        if (firstLetterMatch) {
            result.firstLetter = firstLetterMatch[1];
            remaining = remaining.slice(2); // Remove ^LETTER
        } else {
            remaining = remaining.slice(1); // Remove ^ only
        }
    }

    // Extract contains letters: (?=.*LETTER)
    const lookaheadPattern = /\(\?=\.\*([A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ])\)/g;
    let match;
    while ((match = lookaheadPattern.exec(remaining)) !== null) {
        result.containsLetters.push(match[1]);
    }

    // Check if we consumed the entire pattern (validates it matches our format)
    const reconstructed = remaining.replace(/\(\?=\.\*[A-ZÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]\)/g, '');
    if (reconstructed !== '') {
        return null; // Pattern has extra stuff we don't recognize
    }

    // Only return if we found at least one letter filter
    if (result.firstLetter || result.containsLetters.length > 0) {
        return result;
    }

    return null;
}

// Update URL with current filter state
function updateURL() {
    const params = new URLSearchParams();

    if (currentFilter !== 'all') {
        params.set('gender', currentFilter);
    }

    if (currentSearch) {
        params.set('search', currentSearch);
    }

    const queryString = params.toString();
    const newURL = queryString ? `?${queryString}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
}

// Load filters from URL on page load
function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Load gender filter
    const gender = params.get('gender');
    if (gender && ['all', 'kluk', 'holka', 'neutral'].includes(gender)) {
        currentFilter = gender;
    }
    // Always update UI (either from URL or default 'all')
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === currentFilter) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    // Load search
    const search = params.get('search');
    if (search) {
        currentSearch = search;
        const searchInput = document.getElementById('searchInput');
        const searchStatus = document.getElementById('searchStatus');
        if (searchInput) {
            searchInput.value = search;
            // Update search status indicator
            if (looksLikeRegex(search)) {
                try {
                    new RegExp(search, 'i');
                    searchStatus.textContent = '🎯 Regulární výraz';
                    searchStatus.className = 'search-status regex-mode';
                } catch (error) {
                    searchStatus.textContent = '⚠️ Neplatný regex (hledám jako text)';
                    searchStatus.className = 'search-status text-mode';
                }
            } else {
                searchStatus.textContent = '🔍 Textové hledání';
                searchStatus.className = 'search-status text-mode';
            }
        }

        // Check if search pattern matches our letter filter format
        const letterPattern = parseLetterPattern(search);
        if (letterPattern) {
            // Update state
            if (letterPattern.firstLetter) {
                selectedFirstLetter = letterPattern.firstLetter;
            }
            if (letterPattern.containsLetters.length > 0) {
                selectedContainsLetters = letterPattern.containsLetters;
            }

            // Unfold the filters and highlight the letters
            const alphabetFilter = document.getElementById('alphabetFilter');
            const alphabetToggle = document.getElementById('alphabetToggle');
            const containsFilter = document.getElementById('containsFilter');
            const containsToggle = document.getElementById('containsToggle');

            const shouldUnfoldFirst = letterPattern.firstLetter;
            const shouldUnfoldContains = letterPattern.containsLetters.length > 0;

            // If side-by-side and at least one needs unfolding, unfold both
            if (areFiltersSideBySide() && (shouldUnfoldFirst || shouldUnfoldContains)) {
                if (alphabetFilter && alphabetToggle) {
                    alphabetFilter.classList.remove('hidden');
                    alphabetToggle.classList.add('active');
                    alphabetToggle.setAttribute('aria-expanded', 'true');
                }
                if (containsFilter && containsToggle) {
                    containsFilter.classList.remove('hidden');
                    containsToggle.classList.add('active');
                    containsToggle.setAttribute('aria-expanded', 'true');
                }
            } else {
                // Not side-by-side, unfold individually
                if (shouldUnfoldFirst && alphabetFilter && alphabetToggle) {
                    alphabetFilter.classList.remove('hidden');
                    alphabetToggle.classList.add('active');
                    alphabetToggle.setAttribute('aria-expanded', 'true');
                }
                if (shouldUnfoldContains && containsFilter && containsToggle) {
                    containsFilter.classList.remove('hidden');
                    containsToggle.classList.add('active');
                    containsToggle.setAttribute('aria-expanded', 'true');
                }
            }

            // Highlight the letter buttons
            if (letterPattern.firstLetter) {
                document.querySelectorAll('.letter-btn:not(.contains-letter-btn)').forEach(btn => {
                    if (btn.dataset.letter === letterPattern.firstLetter) {
                        btn.classList.add('active');
                    }
                });
            }

            if (letterPattern.containsLetters.length > 0) {
                document.querySelectorAll('.contains-letter-btn').forEach(btn => {
                    if (letterPattern.containsLetters.includes(btn.dataset.letter)) {
                        btn.classList.add('active');
                    }
                });
            }
        }
    }
}

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
        .split(/([- '])/) // Split on hyphens, spaces, and apostrophes, but keep the delimiters
        .map(part => {
            if (part === '-' || part === ' ' || part === "'") {
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

    // Calculate how many columns fit
    const columns = Math.floor((gridWidth + GRID_GAP) / (GRID_MIN_COLUMN_WIDTH + GRID_GAP));
    return Math.max(1, columns);
}

// Calculate optimal number of names to display (multiple of columns)
function calculateRandomSubsetSize() {
    const columns = getGridColumnCount();
    return columns * TARGET_ROWS;
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

    // Show empty state if no results
    if (namesToDisplay.length === 0) {
        grid.innerHTML = '<p class="no-results">Žádná jména nenalezena. Zkuste upravit nebo vymazat filtry.</p>';
        updateURL();
        return;
    }

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

    // Update URL with current filters
    updateURL();
}

// Setup event listeners
function setupEventListeners() {
    // Search input (handles both plain text and regex)
    const searchInput = document.getElementById('searchInput');
    const searchStatus = document.getElementById('searchStatus');
    searchStatus.setAttribute('aria-live', 'polite');

    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value;
        const regexInfoBox = document.getElementById('regexInfoBox');

        // Update status indicator
        if (!currentSearch) {
            searchStatus.textContent = '';
            searchStatus.className = 'search-status';
            regexInfoBox.classList.add('hidden');
        } else if (looksLikeRegex(currentSearch)) {
            try {
                new RegExp(currentSearch, 'i');
                searchStatus.textContent = '🎯 Regulární výraz';
                searchStatus.className = 'search-status regex-mode';
            } catch (error) {
                searchStatus.textContent = '⚠️ Neplatný regex (hledám jako text)';
                searchStatus.className = 'search-status text-mode';
                regexInfoBox.classList.add('hidden');
            }
        } else {
            searchStatus.textContent = '🔍 Textové hledání';
            searchStatus.className = 'search-status text-mode';
            regexInfoBox.classList.add('hidden');
        }

        // Clear letter selections if search was manually changed
        const expectedPattern = buildLetterPattern();
        if (currentSearch !== expectedPattern) {
            selectedFirstLetter = null;
            selectedContainsLetters = [];
            document.querySelectorAll('.letter-btn').forEach(b => b.classList.remove('active'));
        }

        displayNames();
    });

    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', () => {
        // Clear search input
        searchInput.value = '';
        currentSearch = '';

        // Clear selected letters
        selectedFirstLetter = null;
        selectedContainsLetters = [];

        // Remove active class from all letter buttons
        document.querySelectorAll('.letter-btn').forEach(btn => btn.classList.remove('active'));

        // Clear search status
        searchStatus.textContent = '';
        searchStatus.className = 'search-status';

        // Hide regex info box
        const regexInfoBox = document.getElementById('regexInfoBox');
        regexInfoBox.classList.add('hidden');

        // Refresh display (keeps current gender filter)
        displayNames();
    });

    // Regex info box toggle
    const regexInfoBox = document.getElementById('regexInfoBox');
    searchStatus.addEventListener('click', (e) => {
        // Only toggle if it's in regex mode
        if (searchStatus.classList.contains('regex-mode')) {
            regexInfoBox.classList.toggle('hidden');
        }
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

    // Helper to sync aria-expanded on toggle buttons
    function updateToggleAria(toggleBtn, filterEl) {
        const expanded = !filterEl.classList.contains('hidden');
        toggleBtn.setAttribute('aria-expanded', String(expanded));
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

        updateToggleAria(alphabetToggle, alphabetFilter);
        updateToggleAria(containsToggle, containsFilter);
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

        updateToggleAria(alphabetToggle, alphabetFilter);
        updateToggleAria(containsToggle, containsFilter);
    });

    // Sync filter open/close state on resize transitions
    let wasSideBySide = areFiltersSideBySide();
    window.addEventListener('resize', () => {
        const isSideBySide = areFiltersSideBySide();
        if (isSideBySide === wasSideBySide) return;
        wasSideBySide = isSideBySide;

        if (isSideBySide) {
            // Transitioning to side-by-side: if either is open, open both
            const alphabetOpen = !alphabetFilter.classList.contains('hidden');
            const containsOpen = !containsFilter.classList.contains('hidden');
            if (alphabetOpen || containsOpen) {
                alphabetFilter.classList.remove('hidden');
                alphabetToggle.classList.add('active');
                containsFilter.classList.remove('hidden');
                containsToggle.classList.add('active');
            }
        }

        updateToggleAria(alphabetToggle, alphabetFilter);
        updateToggleAria(containsToggle, containsFilter);
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
    loadFiltersFromURL();
    setupEventListeners();
    loadNames();
});
