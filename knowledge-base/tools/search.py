"""Search the local authored guides and source-text corpus, without network."""
import argparse
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("query")
parser.add_argument("--limit", type=int, default=20)
args = parser.parse_args()
terms = args.query.casefold().split()
rows = []
for path in list(ROOT.glob("*.md")) + list((ROOT / "evidence/page-text").glob("*.txt")):
    for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if terms and all(term in line.casefold() for term in terms):
            rows.append((path, number, re.sub(r"\s+", " ", line).strip()))
for path, number, line in rows[:max(0, args.limit)]:
    print(f"{path.relative_to(ROOT)}:{number}: {line[:550]}")
print(f"\n{len(rows)} matching lines; showing at most {max(0, args.limit)}. All query terms must occur on the same line.")
