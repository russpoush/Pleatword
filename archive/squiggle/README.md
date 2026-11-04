# Squiggle

A daily word puzzle. Today's 5-letter word is drawn on a phone keyboard as the line your finger would make swipe-typing it. Guess the word in 6 tries.

## How it plays

- The blue line starts at the dot and ends at the arrow. A small loop marks a double letter.
- Tap keys (or type) to guess. Your guess draws its own dotted line so you can compare shapes.
- Each stroke (letter to next letter) is scored on the bar between your tiles:
  - green: right stroke in the right spot
  - yellow: that stroke (either direction) appears elsewhere in the word
  - grey: not in the word
- After 3 misses, hollow dots mark each letter's key.
- Everyone gets the same word each day. Puzzle #1 is Nov 3, 2026. Stats and streaks are kept in the browser's local storage.
- Practice rounds use a random word and don't touch the streak.

## Files

| Path | What it is |
|---|---|
| `index.html` | The built, playable game. One self-contained file. Open it in a browser or host it anywhere (GitHub Pages works). |
| `src/template.html` | Game source: markup, styles and script. Word lists are injected at build time. |
| `data/answers.txt` | 614 hand-picked daily answers, all in ENABLE. The daily order is a seeded shuffle of this list. |
| `data/valid-guesses.txt` | Words accepted as guesses: the 8,672 five-letter words in the public-domain ENABLE list. |
| `data/extra-guesses.txt` | Newer everyday words ENABLE is missing (emoji, inbox, login...). Add your own here. |
| `data/SOURCES.md` | Where each word list came from. |
| `build.py` | Rebuilds `index.html` from the template and word lists. |

## Build

```bash
python3 build.py
```

No dependencies beyond Python 3.

## Changing things

- **Answer list:** edit `data/answers.txt`, then rebuild. Changing it reshuffles the daily order, so do it before launch.
- **Launch date:** `LAUNCH` in `src/template.html`.
- **Hint timing:** search for `misses >= 3` in `src/template.html`.
- **Curve shape:** `const t = 0.2` in `geometry()` sets the curve tension.

## Word lists

All word lists are free to use commercially. The guess list is ENABLE, which is in the public domain; see `data/SOURCES.md`. The build stops with an error if any daily answer is missing from the guess list.
