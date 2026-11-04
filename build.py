"""Build index.html (Pleatword) from src/template.html, src/engine.js and data/answers.txt.

Before writing anything, checks that no retired name (retired-names.txt) appears
in the project, so an old name can't slip back in after a rename.
"""
import re
import sys
from pathlib import Path

root = Path(__file__).parent
SKIP_DIRS = {".git", "archive"}
TEXT_EXT = {".html", ".js", ".py", ".md", ".txt", ".json", ".css"}


def retired_names():
    lines = (root / "retired-names.txt").read_text().splitlines()
    return [l.strip().lower() for l in lines if l.strip() and not l.startswith("#")]


def check_names(extra_text=None):
    names = retired_names()
    pattern = re.compile("|".join(re.escape(n) for n in names), re.IGNORECASE)
    hits = []
    for path in sorted(root.rglob("*")):
        rel = path.relative_to(root)
        if rel.parts[0] in SKIP_DIRS or not path.is_file() or path.suffix not in TEXT_EXT:
            continue
        if rel.name == "retired-names.txt":
            continue
        for n, line in enumerate(path.read_text(errors="ignore").splitlines(), 1):
            if pattern.search(line):
                hits.append(f"{rel}:{n}: {line.strip()[:100]}")
    if extra_text is not None:
        for n, line in enumerate(extra_text.splitlines(), 1):
            if pattern.search(line):
                hits.append(f"(built page):{n}: {line.strip()[:100]}")
    if hits:
        print("Build stopped: retired names found. Rename these and build again:")
        print("\n".join(hits))
        sys.exit(1)


template = (root / "src" / "template.html").read_text()
engine = (root / "src" / "engine.js").read_text()
answers = (root / "data" / "answers.txt").read_text().split()
html = template.replace("__ENGINE__", engine).replace("__ANSWERS__", " ".join(answers))

check_names(extra_text=html)
(root / "index.html").write_text(html)
print(f"Built index.html: {len(answers)} hidden words. Name check passed ({', '.join(retired_names())} not found).")
