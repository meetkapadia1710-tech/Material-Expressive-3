"""Combine local source ledgers with namespaces; no network access."""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
E = ROOT / "evidence"
register = []
lines = ["# Source index", "", "Research snapshot: 27–28 October 2026, Asia/Calcutta.", "",
         "Each topic guide links claims to primary sources. IDs are local to their original ledger; the combined register qualifies them to avoid collisions. A citation record describes the method and limits of verification, not automatic endorsement of every statement on the linked page.", "",
         "[Combined register JSON](evidence/source-register.json) includes the topic citations, the 88 retrieved page documents and the 41 retrieved token modules. [Page CSV](evidence/source-inventory.csv), [module manifest](evidence/module-data-manifest.json), and [REA method](research-method.md) retain full provenance."]
for namespace, filename in [("foundations", "sources-foundations.json"), ("type-layout", "sources-type-layout.json"), ("components", "sources-components.json")]:
    value = json.loads((E / filename).read_text(encoding="utf-8"))
    rows = value["sources"] if isinstance(value, dict) else value
    lines.extend(["", f"## {namespace} ({len(rows)} citation records)", "", f"[Full ledger](evidence/{filename})", "", "| Qualified ID | Primary source | Verification scope |", "|---|---|---|"])
    for row in rows:
        identifier = namespace + ":" + row["id"]
        register.append({**row, "qualified_id": identifier, "ledger": filename})
        title = row.get("title", row["url"]).replace("|", "\\|").replace("\n", " ")
        scope = str(row.get("verified_scope", "See ledger")).replace("|", "\\|").replace("\n", " ")
        lines.append(f"| `{identifier}` | [{title}]({row['url']}) | {scope} |")
for row in json.loads((E / "source-inventory.json").read_text(encoding="utf-8")):
    register.append({**row, "qualified_id": "page:" + row["source_id"], "ledger": "source-inventory.json"})
for i, row in enumerate(json.loads((E / "module-data-manifest.json").read_text(encoding="utf-8")), 1):
    register.append({**row, "qualified_id": f"module:M{i:03}", "ledger": "module-data-manifest.json"})
(E / "source-register.json").write_text(json.dumps(register, ensure_ascii=False, indent=2), encoding="utf-8")
(ROOT / "sources.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"Wrote {len(register)} ledger-qualified source records")
