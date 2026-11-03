"""Build index.html from src/template.html and the word lists in data/."""
from pathlib import Path

root = Path(__file__).parent
template = (root / "src" / "template.html").read_text()
answers = (root / "data" / "answers.txt").read_text().split()
guesses = set((root / "data" / "valid-guesses.txt").read_text().split())
extras = set((root / "data" / "extra-guesses.txt").read_text().split())
missing = [w for w in answers if w not in guesses]
if missing:
    raise SystemExit(f"These answers aren't in valid-guesses.txt: {missing}")
valid = sorted(guesses | extras)

html = template.replace("__ANSWERS__", " ".join(answers)).replace("__VALID__", " ".join(valid))
(root / "index.html").write_text(html)
print(f"Built index.html: {len(answers)} answers, {len(valid)} valid guesses")
