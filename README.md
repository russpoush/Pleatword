# Pleatword

A daily folding word puzzle. You get a 7×3 sheet of two-sided origami paper with a letter on every square, front and back. Fold it along the creases until a hidden 5-letter word shows up, left to right, in a row.

## How it plays

- The front of the paper is white and the back is colored. Each square's back letter shows in its corner chip.
- Tap a crease handle, then pick which side folds over. The flap flips, so its back letters land in mirror order.
- Win when the hidden word appears in any row. **Par** is the fewest folds that can do it.
- **Hint** lights up the next fold on a shortest path from where you are.
- Undo and Start over are always available. A fold that makes the sheet narrower than 5 squares is a dead end.
- One shared sheet a day (puzzle #1 is Nov 4, 2026), plus unlimited bonus sheets that don't touch the streak.

## How puzzles are made

`src/engine.js` generates each sheet:

1. Pick the hidden word (the daily word is a seeded shuffle of `data/answers.txt`).
2. Fold a blank sheet 2–3 random times and write the word onto the faces that end up on top in one row.
3. Fill every other face with common letters.
4. Check every fold sequence up to 4 folds deep. Reject the sheet if the word is visible before folding, needs fewer than 2 folds, or if another answer word shows up as early as the real one. Par is the shortest solution found.

The same seed always gives the same sheet, so everyone gets an identical daily puzzle without a server.

## Files

| Path | What it is |
|---|---|
| `index.html` | The built, playable game in one self-contained file. |
| `src/engine.js` | Fold physics, solver and puzzle generator. Also loads in Node for testing. |
| `src/template.html` | Page, styles and UI script. |
| `data/answers.txt` | 614 common words used as hidden words. |
| `build.py` | Builds `index.html`: `python3 build.py`. |
| `archive/squiggle/` | The earlier Squiggle prototype, kept for reference. It turned out to be too close to an existing game (Keyboard Lines). |

## Name

Pleatword was checked by an independent verifier on Nov 4, 2026. No games, App Store or Google Play apps, or pleatword.com were found with the name. The prototype was first called "Foldle," which is already taken by a different daily folding puzzle (foldle.app).

## Tuning

- Sheet size: `W0`, `H0` in `src/engine.js`.
- Difficulty: fold count in `makePuzzle` (currently 2–3) and `par >= 2`.
- Launch date: `LAUNCH` in `src/template.html`.
