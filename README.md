# Výběr jména pro miminko

Jednoduchá webová aplikace pro procházení a výběr českých jmen pro miminko.

## Funkce

- 🔍 Inteligentní vyhledávání (automaticky rozpozná regex)
- 👶 Filtrování podle pohlaví (chlapci/dívky)
- 📱 Responzivní design

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
