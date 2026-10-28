"""Retrieve public token data using URL construction observed in site-main.js.
STATUS_TABLE uses a different data path and is explicitly excluded here.
"""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
E = ROOT / "evidence"
VERSION = "2026-10-13_06-10-19"

def fetch(item):
    result = dict(item, retrieved_at=datetime.datetime.now(datetime.timezone.utc).isoformat(), status="failed")
    try:
        with urllib.request.urlopen(item["url"], timeout=30) as response:
            data = response.read(); result["http_status"] = response.status
        parsed = json.loads(data)
        dest = E / "module-data" / item["filename"]
        dest.write_bytes(data)
        result.update(status="retrieved", bytes=len(data), sha256=hashlib.sha256(data).hexdigest(), local_file=str(dest.relative_to(ROOT)).replace("\\", "/"), top_level_keys=list(parsed) if isinstance(parsed,dict) else None)
    except Exception as error: result["error"] = f"{type(error).__name__}: {error}"
    return result

if __name__ == "__main__":
    (E / "module-data").mkdir(exist_ok=True)
    modules = json.loads((E / "dynamic-modules.json").read_text(encoding="utf-8"))
    selected = {}
    for module in modules:
        if module["type"] == "STATUS_TABLE": continue
        resource_id = module["resource"].split("components/")[-1] if module["type"] == "TOKEN_TABLE" else module["resource"].split("/")[1]
        filename = module["type"] + "." + resource_id + ".json"
        selected.setdefault(filename, {"url": f"https://m3.material.io/_dsm/data/dsdb-m3/{VERSION}/{filename}", "filename": filename, "used_by": [], "derivation": "ngOnInit/fetchDsdbDataJSON URL construction in captured site-main.js"})["used_by"].append({"page": module["page_url"], "section": module["section"], "type": module["type"]})
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool: rows = list(pool.map(fetch, selected.values()))
    (E / "module-data-manifest.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"unique_endpoints": len(rows), "retrieved": sum(r["status"] == "retrieved" for r in rows), "failures": [r for r in rows if r["status"] != "retrieved"]}, indent=2))
