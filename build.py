"""Build index.html (Foldle) from src/template.html, src/engine.js and data/answers.txt."""
from pathlib import Path

root = Path(__file__).parent
template = (root / "src" / "template.html").read_text()
engine = (root / "src" / "engine.js").read_text()
answers = (root / "data" / "answers.txt").read_text().split()
html = template.replace("__ENGINE__", engine).replace("__ANSWERS__", " ".join(answers))
(root / "index.html").write_text(html)
print(f"Built index.html: {len(answers)} hidden words")
