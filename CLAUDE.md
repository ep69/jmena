# Claude Conversation Summary

## Project Overview

Czech baby name selection webapp built with plain HTML, CSS, and JavaScript. Displays 11,490 official Czech names from the Ministry of Interior dataset (as of January 31, 2026).

**Repository:** https://github.com/ep69/jmena

## Data Source

- **Official Source:** Czech Ministry of Interior (Ministerstvo vnitra ČR)
- **Dataset Date:** 2026-01-31
- **Total Names:** 11,490
  - Boys (MUZ → kluk): 3,136
  - Girls (ZENA → holka): 4,036
  - Neutral (NEUTRALNI → neutral): 4,318
- **Source File:** `aux/OpenData_-_seznam_jmen_k_2026-01-31_v2.csv`
- **Usage Constraint:** aux/ files should only be referenced when regenerating jmena.json

## User Requests History

### Initial Implementation
1. Create webapp for choosing Czech baby names from official CSV data
2. Use plain HTML/CSS/JavaScript (no frameworks, client-side only)
3. Support intelligent text search with automatic regex detection
4. Filter by gender (boys/girls/neutral) with neutral names appearing in both boy/girl categories
5. Filter by first letter using GUI alphabet buttons
6. Filter by contained letters with multi-select (name must contain ALL selected letters)
7. Display random subset optimized for screen size (complete grid rows)
8. Show proper Czech name capitalization including composite names with hyphens
9. Provide info about official data source with Ministry website link
10. Add footer with GitHub repository link and issue reporting
11. Make alphabet filters display side-by-side on wide screens with synchronized states

### Recent Additions
12. Add reset button to the right of search input field to clear all filters
13. Remove aux/ files from memory (use only for regenerating jmena.json)
14. Create this CLAUDE.md documentation file
15. Encode active filters to URL for sharing links with filter states

## Current Implementation Status

### URL Filter Encoding
**Status:** ✅ Complete

Active filters are encoded in the URL for easy sharing and bookmarking:
- **URL Parameters:**
  - `gender`: Gender filter (kluk/holka/neutral, omitted if 'all')
  - `search`: Search text or regex pattern (letter filters are encoded as regex in this parameter)

- **Implementation** (app.js):
  - `updateURL()`: Encodes current state to URL, called after each filter change
  - `loadFiltersFromURL()`: Reads URL params on page load and applies filters
  - `parseLetterPattern()`: Parses regex pattern to detect and extract letter filter components
  - Uses `history.replaceState()` to update URL without page reload
  - Letter filters generate regex patterns that are stored in the search parameter
  - When loading from URL, if pattern matches letter filter format, UI is updated:
    - Letter filter sections are unfolded (synchronized side-by-side if screen width > 768px)
    - Corresponding letter buttons are highlighted
    - State variables (selectedFirstLetter, selectedContainsLetters) are set

- **Example URLs:**
  - `?gender=kluk&search=^M` - Boys' names starting with M (unfolds first letter filter, highlights M)
  - `?search=^M(?=.*A)(?=.*R).*` - Names starting with M containing A and R (unfolds both filters, highlights M, A, R)
  - `?gender=holka&search=.*ie$` - Girls' names ending with "ie" (no letter filter UI changes)

### Reset Button Implementation
**Status:** ✅ Complete

- ✅ **HTML Structure** (index.html, lines 31-40)
  - Button with SVG X icon positioned in `.search-input-wrapper`
  - Tooltip: "Vymazat všechny filtry"

- ✅ **CSS Styling** (style.css, lines 95-127)
  - Absolute positioning on right side of input
  - Hover effect changes color to #667eea
  - Input has padding-right: 45px for button clearance

- ✅ **JavaScript Event Listener** (app.js, lines 201-219)
  - Clears search input and currentSearch state
  - Resets selected letters (first letter and contains letters)
  - Removes active class from all letter buttons
  - Clears search status indicator
  - Refreshes display (preserves current gender filter)

## Key Technical Implementation

### Search with Auto-Regex Detection
```javascript
// Detects regex metacharacters
function looksLikeRegex(str) {
    return /[\^\$\*\+\?\{\}\[\]\(\)\|\\]/.test(str);
}
```

### Fisher-Yates Shuffle for Unbiased Random Selection
```javascript
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
```

### Multi-Letter Contains Filter (Lookahead Pattern)
```javascript
// Example: First letter M, contains R and K
// Pattern: ^M(?=.*R)(?=.*K).*

function buildLetterPattern() {
    let pattern = '';

    if (selectedFirstLetter) {
        pattern = `^${selectedFirstLetter}`;
    } else {
        pattern = '^';
    }

    // Add lookaheads for each contains letter
    if (selectedContainsLetters.length > 0) {
        const lookaheads = selectedContainsLetters.map(letter => `(?=.*${letter})`).join('');
        pattern += lookaheads;
    }

    pattern += '.*';

    return (selectedFirstLetter || selectedContainsLetters.length > 0) ? pattern : '';
}
```

### Czech Name Capitalization
```javascript
function capitalizeName(name) {
    return name
        .trim()
        .split(/([- ])/) // Split on hyphens and spaces, keep delimiters
        .map(part => {
            if (part === '-' || part === ' ') return part;
            if (part === '') return part;
            return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');
}
```

### Dynamic Grid Calculation
```javascript
function calculateRandomSubsetSize() {
    const columns = getGridColumnCount();
    const targetRows = 5; // Aim for about 5 rows
    return columns * targetRows;
}

function getGridColumnCount() {
    const grid = document.getElementById('namesGrid');
    const gridWidth = grid.offsetWidth;
    const minColumnWidth = 200; // From CSS: minmax(200px, 1fr)
    const gap = 15; // From CSS: gap: 15px

    const columns = Math.floor((gridWidth + gap) / (minColumnWidth + gap));
    return Math.max(1, columns);
}
```

### Sorted vs Random Display
```javascript
// When showing all results (not random), sort alphabetically
if (showRandomSubset) {
    namesToDisplay = getRandomSubset(filtered, randomSubsetSize);
    resultsCount.textContent = `${randomSubsetSize} náhodných jmen z ${filtered.length}`;
} else {
    namesToDisplay = [...filtered].sort((a, b) => a.name.localeCompare(b.name, 'cs'));
    resultsCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'jméno' : filtered.length < 5 ? 'jména' : 'jmen'}`;
}
```

## File Structure

```
/home/szidek/git/personal/jmena/
├── index.html           # Main HTML structure
├── style.css            # All styling
├── app.js               # JavaScript logic
├── jmena.json           # Processed name data
├── README.md            # User-facing documentation
├── CLAUDE.md            # This file - conversation summary
└── aux/                 # Source data (use only for regenerating jmena.json)
    └── OpenData_-_seznam_jmen_k_2026-01-31_v2.csv
```

## CSS Architecture

### Layout
- **Container:** max-width: 1200px, centered
- **Grid:** `grid-template-columns: repeat(auto-fill, minmax(200px, 1fr))`
- **Gradient Background:** `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **Responsive Breakpoint:** 768px

### Key Styles
- **Primary Color:** #667eea
- **Card Hover:** translateY(-2px) with enhanced shadow
- **Gender Colors:**
  - Boys (kluk): #4A90E2
  - Girls (holka): #E85D75
  - Neutral: #9B59B6

## JavaScript State Variables

```javascript
let allNames = [];                    // All names loaded from JSON
let currentFilter = 'all';            // Gender filter: 'all', 'kluk', 'holka', 'neutral'
let currentSearch = '';               // Search/regex pattern
let selectedFirstLetter = null;       // Currently selected first letter
let selectedContainsLetters = [];    // Array of selected contains letters
```

## Alphabet Filter Synchronization

When filters are displayed side-by-side (screen width > 768px):
- Opening one filter automatically opens the other
- Closing one filter automatically closes the other
- Provides consistent UI experience on wide screens

```javascript
function areFiltersSideBySide() {
    return window.innerWidth > 768;
}

// Sync logic in toggle event listeners
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
```

## Gender Filtering Logic

Neutral names appear in both boy and girl categories:

```javascript
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
```

## Fixed Issues During Development

1. **Biased Random Distribution**
   - Problem: Simple random selection was biased
   - Fix: Implemented proper Fisher-Yates shuffle algorithm

2. **Neutral Names Filtering**
   - Problem: Neutral names not appearing in boy/girl filters
   - Fix: Modified filter logic to include neutral names in both categories

3. **Sorted Results Grouping**
   - Problem: Random names were being sorted, breaking grid layout
   - Fix: Only sort when not showing random subset

4. **CSV Format Adaptation**
   - Problem: New Ministry data format with different columns
   - Fix: Adapted processing to handle DRUH_JMENA and JMENO columns

5. **Alphabet Filter Synchronization**
   - Problem: Independent filter states on wide screens was inconsistent
   - Fix: Implemented synchronized open/close behavior for side-by-side display

## Links and Resources

- **Official Data Source:** https://mv.gov.cz/clanek/seznam-jmen.aspx
- **GitHub Repository:** https://github.com/ep69/jmena
- **Issue Reporting:** https://github.com/ep69/jmena/issues/new

## Notes

- Client-side only - no server or build tools required
- Simply open index.html in a browser
- All filtering and search happens in JavaScript
- Random subset optimizes for complete grid rows based on screen width
- Czech locale comparison ensures proper alphabetical sorting
- SVG icons used throughout for crisp display at any resolution
