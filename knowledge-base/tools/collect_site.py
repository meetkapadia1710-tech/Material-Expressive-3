"""Retrieve public page JSON from the route map observed in Material 3's JS.
Run from any directory. Uses only Python's standard library. No target JS runs.
"""
import concurrent.futures
import datetime
import hashlib
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence"
VERSION = "2026-10-13_06-10-19"
ORIGIN = "https://m3.material.io"

def collect(route):
    slug = route["slug"]
    endpoint = f"{ORIGIN}/_dsm/content/m3/{VERSION}/{route['exportedCarbonFileId']}"
    result = {"url": f"{ORIGIN}/{slug}", "slug": slug, "endpoint": endpoint,
              "method": "public HTTP GET; mapping from observed shipped JavaScript",
              "retrieved_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
              "tabs_declared": route.get("tabs", []), "status": "failed"}
    try:
        with urllib.request.urlopen(endpoint, timeout=35) as response:
            body = response.read()
            result.update(http_status=response.status, content_type=response.headers.get("Content-Type"))
        data = json.loads(body)
        dest = EVIDENCE / "page-data" / ((slug.replace("/", "__") or "home") + ".json")
        dest.write_bytes(body)
        result.update(status="retrieved", title=data.get("title"), bytes=len(body),
                      sha256=hashlib.sha256(body).hexdigest(),
                      updated_timestamp=data.get("updatedTimestamp"),
                      page_canon_id=data.get("pageCanonId"),
                      visible_sections=[s.get("name") for s in data.get("sections", []) if s.get("isVisible", True)],
                      local_file=str(dest.relative_to(ROOT)).replace("\\", "/"),
                      limitations=["Published JSON; not every tab or interaction rendered.", "Media URLs inventoried, not downloaded or visually audited."])
    except Exception as error:
        result["error"] = f"{type(error).__name__}: {error}"
    return result

if __name__ == "__main__":
    (EVIDENCE / "page-data").mkdir(exist_ok=True)
    routes = json.loads((EVIDENCE / "route-map.json").read_text(encoding="utf-8"))["v"]
    selected = [r for r in routes if r.get("exportedCarbonFileId")]
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(collect, selected))
    (EVIDENCE / "page-data-manifest.json").write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps({"route_entries": len(routes), "retrieved": sum(r["status"] == "retrieved" for r in rows), "failed": [r for r in rows if r["status"] != "retrieved"]}, indent=2))
