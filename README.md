# Výběr jména pro miminko

Jednoduchá webová aplikace pro procházení a výběr českých jmen pro miminko.

## Funkce

- 🔍 Inteligentní vyhledávání (automaticky rozpozná regex)
- 👶 Filtrování podle pohlaví (chlapci/dívky/neutrální)
- 📱 Responzivní design

## Data

Aplikace obsahuje 11,471 českých jmen rozdělených do tří kategorií:
- **Chlapci (kluk)**: 3,128 jmen
- **Dívky (holka)**: 4,035 jmen
- **Neutrální**: 4,308 jmen vhodných pro obě pohlaví

## Filtrování

- **Všechna**: Zobrazí všechna jména (11,471)
- **Chlapci**: Zobrazí jména pro chlapce + neutrální jména (7,436)
- **Dívky**: Zobrazí jména pro dívky + neutrální jména (8,343)
- **Neutrální**: Zobrazí pouze neutrální jména (4,308)

## Jak hledat

Aplikace automaticky rozpozná, zda hledáte běžný text nebo používáte regulární výraz.

**Běžné vyhledávání:**
- Zadejte `adam` → najde Adam, Adamec, atd.

**Regulární výrazy (automaticky rozpoznáno):**
- `^A.*` - Jména začínající na A
- `.*a$` - Jména končící na a
- `^M.*[aá]$` - Jména začínající na M a končící na a nebo á
- `^.{3}$` - Jména o přesně 3 znacích
- `^(Dan|Jan).*` - Jména začínající Dan nebo Jan

Aplikace zobrazí indikátor, zda používá textové hledání (🔍) nebo regex (🎯).

## Použití

Jednoduše otevřete `index.html` v prohlížeči. Aplikace funguje kompletně na straně klienta, není potřeba žádný server.

Alternativně můžete použít místní HTTP server:

```bash
python -m http.server 8000
```

Pak otevřete http://localhost:8000 v prohlížeči.

## Struktura souborů

- `index.html` - Hlavní HTML stránka
- `style.css` - Styly aplikace
- `app.js` - JavaScript pro vyhledávání a filtrování
- `jmena.json` - Data jmen ve formátu JSON
- `jmena.csv` - Původní CSV soubor s daty
