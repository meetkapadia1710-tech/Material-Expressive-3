"""Index retained public token modules without evaluating aliases or contexts.

Inputs: evidence/module-data-manifest.json and its local files.
Outputs: evidence/token-catalog.json and evidence/token-catalog.csv.
Uses a field allowlist; author/account metadata is never copied to outputs.
"""
from __future__ import annotations

import collections
import csv
import hashlib
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / "evidence"
VALUE_METADATA = {
    "name", "revisionId", "revisionCreateTime", "state", "contextTags",
    "specificityScore", "createTime", "tokenName",
}


def pointer_part(value):
    return str(value).replace("~", "~0").replace("/", "~1")


def reference_names(value):
    """Reference fields actually present, not inferred from arbitrary strings."""
    found = set()
    if isinstance(value, dict):
        for key, child in value.items():
            if (key == "tokenName" or key.endswith("TokenName")) and isinstance(child, str):
                found.add(child)
            elif isinstance(child, (dict, list)):
                found.update(reference_names(child))
    elif isinstance(value, list):
        for child in value:
            found.update(reference_names(child))
    return found


def main():
    manifest = json.loads((EVIDENCE / "module-data-manifest.json").read_text(encoding="utf-8"))
    modules, occurrences, problems = [], [], []
    unique_names = collections.defaultdict(list)
    # Some modules include dependency tokens without their token-set declarations.
    # Join only exact resource identities in the same declared system revision.
    set_registry = collections.defaultdict(list)
    for source in manifest:
        if source.get("status") != "retrieved":
            continue
        system = json.loads((ROOT / source["local_file"]).read_bytes())["system"]
        for i, token_set in enumerate(system.get("tokenSets", [])):
            key = (system.get("name"), system.get("revisionId"), token_set["name"])
            set_registry[key].append({
                "name": token_set.get("tokenSetName"), "display_name": token_set.get("displayName"),
                "type": token_set.get("tokenType"), "class": token_set.get("custom", {}).get("token_class"),
                "state": token_set.get("state"), "source_pointer": f"/system/tokenSets/{i}",
                "source_module": source["filename"],
            })
    for source in manifest:
        if source.get("status") != "retrieved":
            problems.append({"module": source.get("filename"), "problem": "not-retrieved"})
            continue
        local = ROOT / source["local_file"]
        body = local.read_bytes()
        digest = hashlib.sha256(body).hexdigest()
        if digest != source["sha256"]:
            raise ValueError("Source hash mismatch: " + source["filename"])
        system = json.loads(body)["system"]
        module_id = source["filename"]
        token_sets = {
            x["name"]: {
                "name": x.get("tokenSetName"), "display_name": x.get("displayName"),
                "type": x.get("tokenType"), "class": x.get("custom", {}).get("token_class"),
                "state": x.get("state"), "source_pointer": f"/system/tokenSets/{i}", "source_module": module_id,
            } for i, x in enumerate(system.get("tokenSets", []))
        }
        groups = {x["name"]: (i, x) for i, x in enumerate(system.get("contextTagGroups", []))}
        tags = {}
        for i, tag in enumerate(system.get("tags", [])):
            group_id = tag["name"].rsplit("/tags/", 1)[0]
            group_index, group = groups.get(group_id, (None, {}))
            tags[tag["name"]] = {
                "group": group.get("contextTagGroupName"), "tag": tag.get("tagName"),
                "display_name": tag.get("displayName"), "state": tag.get("state"),
                "is_declared_default": group.get("defaultTag") == tag["name"],
                "source_pointer": f"/system/tags/{i}",
                "group_pointer": f"/system/contextTagGroups/{group_index}" if group_index is not None else None,
            }

        def contexts(ids):
            labels = []
            for tag_id in ids:
                if tag_id in tags:
                    info = tags[tag_id]
                    labels.append(f"{info['group']}={info['tag']}")
                else:
                    labels.append("unresolved:" + tag_id)
            return sorted(labels)

        values = collections.defaultdict(list)
        for i, value in enumerate(system.get("values", [])):
            token_id = value.get("name", "").rsplit("/values/", 1)[0]
            values[token_id].append((i, value))
        tokens = system.get("tokens", [])
        token_ids = {t["name"] for t in tokens}
        orphan_ids = sorted(set(values) - token_ids)
        if orphan_ids:
            problems.append({"module": module_id, "problem": "values-without-token-declaration", "identities": orphan_ids})

        module = {
            "module": module_id, "source_url": source["url"], "local_file": source["local_file"],
            "sha256": digest, "retrieved_at": source["retrieved_at"], "used_by": source.get("used_by", []),
            "system_name": system.get("name"), "system_revision": system.get("revisionId"),
            "dsdb_version": system.get("dsdbVersion"), "declared_resolved_flag": system.get("_isResolved"),
            "token_count": len(tokens), "value_record_count": len(system.get("values", [])),
            "token_sets": list(token_sets.values()),
            "declared_context_tags": list(tags.values()),
            "context_groups": [
                {"name": g.get("contextTagGroupName"), "display_name": g.get("displayName"),
                 "specificity": g.get("specificity"), "state": g.get("state"),
                 "source_pointer": f"/system/contextTagGroups/{i}"}
                for i, g in enumerate(system.get("contextTagGroups", []))
            ],
        }
        modules.append(module)
        trees = system.get("contextualReferenceTrees", {})
        for i, token in enumerate(tokens):
            token_id = token["name"]
            token_set_id = token_id.rsplit("/tokens/", 1)[0]
            token_set = token_sets.get(token_set_id, {})
            set_resolution = "same-module"
            if not token_set:
                candidates = set_registry.get((system.get("name"), system.get("revisionId"), token_set_id), [])
                variants = {(x["name"], x["type"], x["class"], x["state"]) for x in candidates}
                if len(variants) == 1:
                    token_set = candidates[0]
                    set_resolution = "cross-module-exact-identity-agreement"
                else:
                    set_resolution = "missing" if not candidates else "ambiguous"
            declarations = []
            all_refs, declared_contexts, raw_kinds = set(), set(), set()
            direct_alias_count = undefined_count = literal_only_count = reference_value_count = 0
            for vi, value in values.get(token_id, []):
                refs = reference_names(value)
                kinds = sorted(set(value) - VALUE_METADATA)
                context_labels = contexts(value.get("contextTags", []))
                all_refs.update(refs)
                declared_contexts.update(context_labels)
                raw_kinds.update(kinds)
                direct_alias_count += isinstance(value.get("tokenName"), str)
                reference_value_count += bool(refs)
                undefined_count += value.get("undefined") is True
                literal_only_count += bool(kinds) and not refs and value.get("undefined") is not True
                declarations.append({
                    "pointer": f"/system/values/{vi}", "context_tags": context_labels,
                    "state": value.get("state"), "specificity_score": value.get("specificityScore"),
                    "payload_kinds": kinds, "reference_names": sorted(refs),
                    "explicitly_undefined": value.get("undefined") is True,
                })
            tree = trees.get(token_id, {})
            resolved = tree.get("contextualReferenceTree", [])
            resolved_kinds, resolved_contexts = set(), set()
            resolved_with_value = resolved_undefined = 0
            for item in resolved:
                value = item.get("resolvedValue")
                if isinstance(value, dict):
                    resolved_kinds.update(value)
                    resolved_with_value += 1
                    resolved_undefined += value.get("undefined") is True
                resolved_contexts.update(contexts(item.get("contextTags", [])))
            occurrence = {
                "module": module_id, "token_name": token.get("tokenName"), "token_identity": token_id,
                "token_pointer": f"/system/tokens/{i}", "token_type": token.get("tokenValueType"),
                "token_state": token.get("state"), "deprecation_declared": "deprecationMessage" in token,
                "token_set": token_set.get("name"), "token_class": token_set.get("class"),
                "token_set_pointer": token_set.get("source_pointer"),
                "token_set_source_module": token_set.get("source_module"), "token_set_resolution": set_resolution,
                "value_record_count": len(declarations), "direct_alias_record_count": direct_alias_count,
                "records_with_references": reference_value_count, "literal_only_record_count": literal_only_count,
                "explicitly_undefined_record_count": undefined_count,
                "declared_payload_kinds": sorted(raw_kinds), "referenced_token_names": sorted(all_refs),
                "declared_value_context_tags": sorted(declared_contexts), "value_declarations": declarations,
                "contextual_tree_pointer": "/system/contextualReferenceTrees/" + pointer_part(token_id) if token_id in trees else None,
                "contextual_tree_record_count": len(resolved), "records_with_resolved_value": resolved_with_value,
                "resolved_explicitly_undefined_count": resolved_undefined,
                "resolved_value_kinds": sorted(resolved_kinds), "resolved_context_tags": sorted(resolved_contexts),
            }
            unique_names[occurrence["token_name"]].append(len(occurrences))
            occurrences.append(occurrence)
    summary = {
        "modules": len(modules), "token_occurrences": len(occurrences), "unique_token_names": len(unique_names),
        "distinct_token_set_names": len({t["token_set"] for t in occurrences if t["token_set"]}),
        "distinct_context_group_names": sorted({g["name"] for m in modules for g in m["context_groups"]}),
        "names_in_multiple_occurrences": sum(len(v) > 1 for v in unique_names.values()),
        "deprecation_declared_occurrences": sum(t["deprecation_declared"] for t in occurrences),
        "value_records": sum(m["value_record_count"] for m in modules),
        "direct_alias_records": sum(t["direct_alias_record_count"] for t in occurrences),
        "records_with_references": sum(t["records_with_references"] for t in occurrences),
        "literal_only_records": sum(t["literal_only_record_count"] for t in occurrences),
        "explicitly_undefined_records": sum(t["explicitly_undefined_record_count"] for t in occurrences),
        "contextual_tree_records": sum(t["contextual_tree_record_count"] for t in occurrences),
        "resolved_explicitly_undefined_records": sum(t["resolved_explicitly_undefined_count"] for t in occurrences),
        "token_occurrences_by_type": dict(sorted(collections.Counter(t["token_type"] for t in occurrences).items())),
        "token_occurrences_by_class": dict(sorted(collections.Counter(str(t["token_class"]) for t in occurrences).items())),
        "token_set_resolution_counts": dict(sorted(collections.Counter(t["token_set_resolution"] for t in occurrences).items())),
        "integrity_problems": problems,
    }
    catalog = {
        "schema": "material3-research-token-index-1", "indexed_on": "2026-10-28",
        "timezone": "Asia/Calcutta", "source_manifest": "evidence/module-data-manifest.json",
        "method": "Local JSON inspection; hashes verified; no network, context evaluation, alias resolution, or theme generation.",
        "limitations": [
            "Counts include repeated declarations in different module payloads; occurrences are intentionally retained.",
            "Declared module contexts are not a claim that every token supports every context or that the UI selects it.",
            "Missing local token sets are joined across modules only by exact resource identity, system revision, and agreeing metadata; origin pointers remain explicit.",
            "Published resolvedValue records are indexed separately from declared aliases; this script did not calculate them.",
            "No literal values are flattened or normalized. Follow pointers into the hashed source for exact payloads and units.",
            "Inactive/deprecated/undefined records are retained; they are not automatically applicable to an implementation.",
            "Author and account metadata are omitted by allowlist.",
        ],
        "summary": summary, "modules": modules,
        "name_index": [{"token_name": k, "occurrence_indices": v} for k, v in sorted(unique_names.items())],
        "occurrences": occurrences,
    }
    (EVIDENCE / "token-catalog.json").write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    fields = ["module", "token_name", "token_type", "token_class", "token_set", "token_state", "deprecation_declared",
              "value_record_count", "direct_alias_record_count", "records_with_references", "literal_only_record_count",
              "explicitly_undefined_record_count", "contextual_tree_record_count", "resolved_explicitly_undefined_count",
              "declared_value_context_tags", "referenced_token_names", "token_pointer", "token_set_source_module",
              "token_set_pointer", "token_set_resolution", "contextual_tree_pointer"]
    with (EVIDENCE / "token-catalog.csv").open("w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for occurrence in occurrences:
            writer.writerow({key: " | ".join(occurrence[key]) if isinstance(occurrence[key], list) else occurrence[key] for key in fields})
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
