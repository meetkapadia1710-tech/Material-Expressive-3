"""Validate local research deliverables and evidence integrity; no network."""
import collections
import datetime
import hashlib
import json
import pathlib
import re
import sys
from urllib.parse import unquote

ROOT = pathlib.Path(__file__).resolve().parents[1]
E = ROOT / "evidence"
errors = []
checks = collections.Counter()
required = ["README.md", "foundations.md", "color.md", "typography.md", "layout.md", "components.md", "design-tokens.md", "token-catalog.md", "accessibility.md", "motion-shape-icons.md", "interaction-elevation-content.md", "implementation.md", "research-method.md", "coverage-report.md", "sources.md"]
for name in required:
    path = ROOT / name
    if not path.is_file() or path.stat().st_size == 0: errors.append(f"Missing or empty deliverable: {name}")
    checks["required_deliverables"] += 1

for path in E.rglob("*.json"):
    try: json.loads(path.read_text(encoding="utf-8")); checks["json_files_parsed"] += 1
    except Exception as error: errors.append(f"Invalid JSON: {path.relative_to(ROOT)}: {error}")

for manifest in ["page-data-manifest.json", "module-data-manifest.json"]:
    for row in json.loads((E / manifest).read_text(encoding="utf-8")):
        if row["status"] != "retrieved": errors.append(f"Unretrieved manifest entry: {row.get('url')}"); continue
        path = ROOT / row["local_file"]
        if not path.is_file(): errors.append(f"Missing source: {row['local_file']}"); continue
        if hashlib.sha256(path.read_bytes()).hexdigest() != row["sha256"]: errors.append(f"Hash mismatch: {row['local_file']}")
        checks["source_hashes_checked"] += 1

for path in ROOT.glob("*.md"):
    for match in re.finditer(r"\[[^\]]*\]\(([^)]+)\)", path.read_text(encoding="utf-8")):
        target = match.group(1).strip().strip("<>").split("#", 1)[0]
        if not target or re.match(r"^(https?|mailto|codex):", target, re.I): continue
        target = unquote(target)
        dest = pathlib.Path(target) if pathlib.Path(target).is_absolute() else path.parent / target
        if not dest.exists() and dest.resolve() != (E / "validation-report.json").resolve():
            errors.append(f"Broken local link in {path.name}: {target}")
        checks["local_markdown_targets_checked"] += 1

for filename in ["sources-foundations.json", "sources-type-layout.json", "sources-components.json"]:
    value = json.loads((E / filename).read_text(encoding="utf-8"))
    rows = value["sources"] if isinstance(value, dict) else value
    ids = [r["id"] for r in rows]
    if len(ids) != len(set(ids)): errors.append(f"Duplicate IDs in {filename}")
    for row in rows:
        for field in ["id", "url", "title", "accessed_at", "method", "verified_scope", "limitations"]:
            if field not in row: errors.append(f"Missing {field} in {filename}:{row.get('id')}")
        checks["topic_citation_records_checked"] += 1
register = json.loads((E / "source-register.json").read_text(encoding="utf-8"))
ids = [r["qualified_id"] for r in register]
if len(ids) != len(set(ids)): errors.append("Duplicate qualified source IDs")
checks["qualified_source_records"] = len(ids)

inventory = json.loads((E / "source-inventory.json").read_text(encoding="utf-8"))
for row in inventory:
    if not (ROOT / row["text_file"]).is_file(): errors.append(f"Missing extract: {row['text_file']}")
checks["source_text_extracts_checked"] = len(inventory)

stats = json.loads((E / "coverage-statistics.json").read_text(encoding="utf-8"))
coverage = json.loads((E / "sitemap-coverage.json").read_text(encoding="utf-8"))
if stats["sitemap_urls"] != len(coverage): errors.append("Sitemap row count disagrees with statistics")
if stats["data_documents"] != len(inventory): errors.append("Document count disagrees with statistics")
if stats["visible_sections"] != sum(r["visible_section_count"] for r in inventory): errors.append("Section count disagrees with statistics")
records = {}
for path in E.glob("rea-*.json"):
    for record in json.loads(path.read_text(encoding="utf-8")).get("records", []): records[record["evidence_id"]] = record
for record in records.values():
    cleanup = record["normalized_result"].get("browser", {}).get("cleanup")
    if cleanup != "terminated-owned-process": errors.append(f"Unexpected REA cleanup {cleanup}: {record['evidence_id']}")
    checks["rea_cleanup_records_checked"] += 1

def at_pointer(value, pointer):
    for part in pointer.lstrip("/").split("/"):
        key = part.replace("~1", "/").replace("~0", "~")
        value = value[int(key)] if isinstance(value, list) else value[key]
    return value

catalog = json.loads((E / "token-catalog.json").read_text(encoding="utf-8"))
grouped = collections.defaultdict(list)
for occurrence in catalog["occurrences"]: grouped[occurrence["module"]].append(occurrence)
sets_by_module = {}
for module in catalog["modules"]:
    source = json.loads((ROOT / module["local_file"]).read_text(encoding="utf-8"))
    sets_by_module[module["module"]] = source["system"].get("tokenSets", [])
    for occurrence in grouped[module["module"]]:
        try:
            token = at_pointer(source, occurrence["token_pointer"])
            if token["name"] != occurrence["token_identity"] or token["tokenName"] != occurrence["token_name"]:
                errors.append(f"Token identity mismatch: {module['module']}:{occurrence['token_pointer']}")
            checks["token_declarations_checked"] += 1
            for value in occurrence["value_declarations"]:
                at_pointer(source, value["pointer"])
                checks["token_value_pointers_checked"] += 1
            if occurrence.get("contextual_tree_pointer"):
                at_pointer(source, occurrence["contextual_tree_pointer"])
                checks["contextual_tree_pointers_checked"] += 1
        except (KeyError, IndexError, ValueError, TypeError) as error:
            errors.append(f"Invalid token pointer: {module['module']}:{occurrence['token_pointer']}: {error}")
    del source
for occurrence in catalog["occurrences"]:
    try:
        token_set = at_pointer({"system": {"tokenSets": sets_by_module[occurrence["token_set_source_module"]]}}, occurrence["token_set_pointer"])
        if token_set["tokenSetName"] != occurrence["token_set"]:
            errors.append(f"Token-set mismatch: {occurrence['token_name']}")
        checks["token_set_pointers_checked"] += 1
    except (KeyError, IndexError, ValueError, TypeError) as error:
        errors.append(f"Invalid token-set pointer: {occurrence['token_name']}: {error}")
if catalog["summary"].get("integrity_problems"): errors.append("Token catalog reports integrity problems")

report = {"validated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "status": "passed" if not errors else "failed", "checks": dict(checks), "errors": errors,
          "scope": "Local evidence integrity, inventories and file navigation only; no remote liveness, visual or behavioral certification."}
(E / "validation-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
print(json.dumps(report, indent=2))
sys.exit(bool(errors))
