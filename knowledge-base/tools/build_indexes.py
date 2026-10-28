"""Build offline text extracts and evidence inventories; does not access network."""
import collections
import csv
import hashlib
from html.parser import HTMLParser
import json
import pathlib
import re
import xml.etree.ElementTree as ET

ROOT = pathlib.Path(__file__).resolve().parents[1]
E = ROOT / "evidence"

class Text(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.links = []
    def handle_starttag(self, tag, attrs):
        if tag in ("p", "div", "ul", "ol", "li", "br", "tr", "h1", "h2", "h3", "h4", "h5", "h6"):
            self.parts.append("\n")
        if tag in ("td", "th"): self.parts.append(" | ")
        if tag == "li": self.parts.append("- ")
        if tag == "a":
            href = dict(attrs).get("href")
            if href: self.links.append(href)
    def handle_endtag(self, tag):
        if tag in ("p", "div", "li", "tr", "h1", "h2", "h3", "h4", "h5", "h6"): self.parts.append("\n")
    def handle_data(self, data): self.parts.append(data)
    def value(self): return re.sub(r"\n\s*\n+", "\n\n", "".join(self.parts)).strip()

def plain(value):
    parser = Text(); parser.feed(value or ""); return parser.value(), parser.links

def write_csv(path, rows, fields):
    with path.open("w", encoding="utf-8-sig", newline="") as f:
        out = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore"); out.writeheader(); out.writerows(rows)

def main():
    text_dir = E / "page-text"; text_dir.mkdir(exist_ok=True)
    rendered_dir = E / "rendered"; rendered_dir.mkdir(exist_ok=True)
    manifest = json.loads((E / "page-data-manifest.json").read_text(encoding="utf-8"))
    modules = []; media = []; hidden = []; inventory = []; evidence_records = {}; snapshots = []
    for bundle in sorted(E.glob("rea-*.json")):
        for record in json.loads(bundle.read_text(encoding="utf-8")).get("records", []):
            evidence_records[record["evidence_id"]] = record
    for record in evidence_records.values():
        for step in record["normalized_result"].get("steps", []):
            if not (step["step_id"].startswith("ready_") or step["step_id"] == "home_ready"): continue
            artifact = step["artifacts"].get("accessibility", {})
            if artifact.get("state") != "captured": continue
            url = step["after_url"]["url"]
            dest = rendered_dir / ((url.split("m3.material.io/")[-1].replace("/", "__") or "home") + ".txt")
            dest.write_text(f"URL: {url}\nREA evidence: {record['evidence_id']}\nStep: {step['step_id']}\n\n{artifact['value']['text']}", encoding="utf-8")
            snapshots.append({"url": url, "evidence_id": record["evidence_id"], "step": step["step_id"],
                              "artifact_sha256": artifact["value"]["sha256"], "file": str(dest.relative_to(ROOT)).replace("\\", "/"),
                              "page_not_found": 'heading "This page cannot be found"' in artifact["value"]["text"]})
    for i, row in enumerate(manifest, 1):
        if row["status"] != "retrieved": continue
        data = json.loads((ROOT / row["local_file"]).read_text(encoding="utf-8"))
        source_id = f"P{i:03}"
        lines = [f"# {data.get('title')}", f"Source ID: {source_id}", f"Public page: {row['url']}",
                 f"Endpoint: {row['endpoint']}", f"Retrieved: {row['retrieved_at']}", f"Source SHA-256: {row['sha256']}",
                 "Machine extraction of published page data, not an authored summary. Hidden sections/blocks omitted.",
                 "Dynamic RESOURCE modules are references only; images/video are represented by text metadata, not visual verification.",
                 plain(data.get("description"))[0]]
        links = []; visible = 0
        for section in data.get("sections", []):
            if not section.get("isVisible", True):
                hidden.append({"source_id": source_id, "section": section.get("name"), "kind": "section"}); continue
            visible += 1
            lines.extend(["", "## " + section.get("name", "Unnamed section")])
            for block in section.get("contentBlocks", []):
                if block.get("isHidden"):
                    hidden.append({"source_id": source_id, "section": section.get("name"), "kind": "block"}); continue
                if block.get("title"): lines.extend(["", "### " + plain(block["title"])[0]])
                for chunk in block.get("contentChunks", []):
                    for field in ("htmlValue", "footer"):
                        text, hrefs = plain(chunk.get(field)); links.extend(hrefs)
                        if text: lines.extend(["", text])
                    if chunk.get("snippetCode"): lines.extend(["", "Code snippet:", chunk["snippetCode"]])
                    for field in ("imageUrl", "videoUrl", "codeUrl", "prototypeUrl", "linkUrl"):
                        if chunk.get(field):
                            media.append({"source_id": source_id, "page_url": row["url"], "section": section.get("name"), "type": field, "url": chunk[field], "alt_text": chunk.get("altText", "")})
                    if chunk.get("altText"): lines.append("Media alternative text: " + chunk["altText"])
                    if chunk.get("libraryModuleType"):
                        module = {"source_id": source_id, "page_url": row["url"], "section": section.get("name"), "type": chunk["libraryModuleType"], "resource": chunk.get("resourceName"), "configuration": chunk.get("moduleConfigurationOverrides")}
                        modules.append(module); lines.append("Dynamic module reference: " + json.dumps(module, ensure_ascii=False))
        lines.extend(["", "## Links embedded in visible content"] + sorted(set(links)))
        dest = text_dir / (pathlib.Path(row["local_file"]).stem + ".txt")
        dest.write_text("\n".join(lines) + "\n", encoding="utf-8")
        inventory.append({"source_id": source_id, **row, "text_file": str(dest.relative_to(ROOT)).replace("\\", "/"), "visible_section_count": visible})
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    urls = [x.find("s:loc", ns).text for x in ET.parse(E / "sitemap.xml").getroot().findall("s:url", ns)]
    coverage = []
    for url in urls:
        def matches_route(r):
            if url.rstrip("/") == r["url"].rstrip("/"): return True
            for tab in r.get("tabs_declared", []):
                tab_slug = re.sub(r"[^a-z0-9]+", "-", tab["label"].lower()).strip("-")
                suffixes = [tab_slug] + tab.get("alternateSlugs", [])
                if any(url.rstrip("/") == r["url"].rstrip("/") + "/" + s for s in suffixes): return True
            return False
        matches = [r for r in inventory if matches_route(r)]
        row = max(matches, key=lambda r: len(r["url"])) if matches else None
        snapshot = next((s for s in snapshots if s["url"].rstrip("/") == url.rstrip("/")), None)
        coverage.append({"url": url, "category": url.split("m3.material.io/")[-1].split("/")[0] or "home",
                         "status": "rendered-not-found" if snapshot and snapshot["page_not_found"] else "rendered-and-data-retrieved" if snapshot and row else "parent-data-retrieved" if row else "rendered" if snapshot else "not-retrieved",
                         "source_id": row["source_id"] if row else "", "text_file": row["text_file"] if row else "",
                         "rendered_evidence_id": snapshot["evidence_id"] if snapshot else "",
                         "limitation": "Matched exact route or declared tab; not proof every module or media item was loaded." if row else "Sitemap inventory only; body not retrieved in this corpus."})
    for name, value in [("source-inventory.json", inventory), ("rendered-manifest.json", snapshots), ("dynamic-modules.json", modules), ("media-inventory.json", media), ("hidden-content-excluded.json", hidden), ("sitemap-coverage.json", coverage)]:
        (E / name).write_text(json.dumps(value, indent=2, ensure_ascii=False), encoding="utf-8")
    write_csv(E / "source-inventory.csv", inventory, ["source_id", "url", "title", "status", "visible_section_count", "retrieved_at", "sha256", "local_file", "text_file"])
    write_csv(E / "sitemap-coverage.csv", coverage, ["url", "category", "status", "source_id", "text_file", "rendered_evidence_id", "limitation"])
    stats = {"data_documents": len(inventory), "visible_sections": sum(r["visible_section_count"] for r in inventory), "sitemap_urls": len(urls),
             "sitemap_statuses": dict(collections.Counter(r["status"] for r in coverage)), "dynamic_modules": len(modules), "module_types": dict(collections.Counter(r["type"] for r in modules)),
             "media_references": len(media), "hidden_items_excluded": len(hidden), "rea_records": len(evidence_records), "rendered_snapshots": len(snapshots)}
    (E / "coverage-statistics.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")
    print(json.dumps(stats, indent=2))

if __name__ == "__main__": main()
