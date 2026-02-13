# Výběr jména pro miminko

Jednoduchá webová aplikace pro procházení a výběr českých jmen pro miminko.

## Funkce

- 🔍 Inteligentní vyhledávání (automaticky rozpozná regex)
- 🔤 Filtrování podle prvního písmene (kliknutím na písmeno)
- 🔍 Filtrování podle obsažených písmen (vyberte více písmen - jméno musí obsahovat všechna)
- 🔀 Kombinovatelné filtry (můžete použít oba filtry písmen najednou)
- 👶 Filtrování podle pohlaví (chlapci/dívky/neutrální)
- 📱 Responzivní design

## Data

Aplikace obsahuje 11,490 českých jmen rozdělených do tří kategorií:
- **Chlapci (kluk)**: 3,136 jmen
- **Dívky (holka)**: 4,036 jmen
- **Neutrální**: 4,318 jmen vhodných pro obě pohlaví

Data pochází z oficiálního otevřeného datasetu Ministerstva vnitra ČR (stav k 31. 1. 2026).

## Filtrování

- **Všechna**: Zobrazí náhodný výběr jmen ze všech 11,490
- **Chlapci**: Zobrazí náhodný výběr z jmen pro chlapce + neutrální jména (celkem 7,454)
- **Dívky**: Zobrazí náhodný výběr z jmen pro dívky + neutrální jména (celkem 8,354)
- **Neutrální**: Zobrazí náhodný výběr z neutrálních jmen (celkem 4,318)

**Poznámka**: Bez aktivního vyhledávání se zobrazuje náhodný výběr jmen přizpůsobený šířce obrazovky (cca 5 řádků), aby byl poslední řádek vždy plný. Při vyhledávání se zobrazí všechny odpovídající výsledky.

## Jak hledat

Aplikace automaticky rozpozná, zda hledáte běžný text nebo používáte regulární výraz.

**Filtrování podle prvního písmene:**
- Klikněte na tlačítko "🔤 Filtrovat podle prvního písmene" pro zobrazení abecedy
- Vyberte libovolné písmeno (A-Ž) pro zobrazení jmen začínajících tímto písmenem
- Kliknutím na stejné písmeno zrušíte výběr
- Ideální pro uživatele, kteří neznají regulární výrazy

**Filtrování podle obsažených písmen:**
- Klikněte na tlačítko "🔍 Filtrovat podle obsažených písmen" pro zobrazení abecedy
- Můžete vybrat **více písmen** - jméno musí obsahovat všechna vybraná písmena
- Kliknutím na stejné písmeno zrušíte výběr
- Například:
  - Výběr "L" najde Klára, Libuše, Emil, Oldřich
  - Výběr "R" + "K" najde Karel, Marek, Mirka (obsahují obě písmena)

**Kombinace filtrů:**
- Můžete kombinovat všechny filtry najednou!
- Například: První písmeno "M" + obsahuje "R" + "K" = najde Marek, Mirka
- Funguje i s filtrem pohlaví (chlapci/dívky/neutrální)

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
- `data/` - Zdrojová data z Ministerstva vnitra ČR

## GitHub

Projekt je open source a dostupný na GitHubu: https://github.com/ep69/jmena

Našli jste chybu nebo máte nápad na vylepšení? [Nahlaste issue](https://github.com/ep69/jmena/issues/new)!
