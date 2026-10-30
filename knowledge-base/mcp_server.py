"""
Material 3 Expressive MCP Server
--------------------------------
A standard Model Context Protocol (MCP) server providing AI coding assistants
with real-time, low-overhead access to Material 3 Expressive design specifications,
design tokens, component guidelines, and platform compatibility realities.
"""

import json
import pathlib
import re
from typing import Any, Dict, List, Optional
from mcp.server.mcpserver import MCPServer

ROOT = pathlib.Path(__file__).resolve().parent
EVIDENCE = ROOT / "evidence"
PAGE_DATA = EVIDENCE / "page-data"

server = MCPServer("material-3-expressive")

# Lazy caches
_TOKEN_CATALOG_CACHE: Optional[Dict[str, Any]] = None
_SEARCH_CORPUS_CACHE: Optional[List[tuple]] = None


def _get_token_catalog() -> Dict[str, Any]:
    global _TOKEN_CATALOG_CACHE
    if _TOKEN_CATALOG_CACHE is None:
        catalog_path = EVIDENCE / "token-catalog.json"
        if catalog_path.exists():
            _TOKEN_CATALOG_CACHE = json.loads(catalog_path.read_text(encoding="utf-8"))
        else:
            _TOKEN_CATALOG_CACHE = {"occurrences": [], "modules": []}
    return _TOKEN_CATALOG_CACHE


def _get_search_corpus() -> List[tuple]:
    global _SEARCH_CORPUS_CACHE
    if _SEARCH_CORPUS_CACHE is None:
        corpus = []
        files = list(ROOT.glob("*.md")) + list((EVIDENCE / "page-text").glob("*.txt"))
        for file_path in files:
            try:
                for line_no, line in enumerate(file_path.read_text(encoding="utf-8").splitlines(), 1):
                    cleaned = re.sub(r"\s+", " ", line).strip()
                    if cleaned:
                        corpus.append((file_path.name, line_no, cleaned))
            except Exception:
                continue
        _SEARCH_CORPUS_CACHE = corpus
    return _SEARCH_CORPUS_CACHE


# ---------------------------------------------------------------------------
# MCP Tools
# ---------------------------------------------------------------------------

@server.tool()
def search_guidelines(query: str, limit: int = 8) -> str:
    """
    Search the local Material 3 Expressive guides and extracted source text.

    Args:
        query: Space-separated search terms (e.g., 'button group', 'focus indicator', 'dynamic color').
        limit: Maximum number of matching lines to return (default: 8).
    """
    terms = query.casefold().split()
    if not terms:
        return "Please provide at least one search keyword."

    corpus = _get_search_corpus()
    matches = []
    for filename, line_no, text in corpus:
        text_lower = text.casefold()
        if all(term in text_lower for term in terms):
            matches.append(f"[{filename}:{line_no}] {text}")
            if len(matches) >= limit:
                break

    if not matches:
        return f"No matches found for query: '{query}'."

    return "\n".join(matches)


@server.tool()
def get_component_specs(component_name: str) -> Dict[str, Any]:
    """
    Retrieve design specifications, modern Expressive variants, and accessibility
    guidance for a specific Material 3 component family.

    Args:
        component_name: Name of the component family (e.g., 'buttons', 'button-groups',
                       'floating-action-button', 'navigation-rail', 'cards', 'dialogs',
                       'tabs', 'lists', 'menus', 'switch', 'checkbox', 'text-fields').
    """
    normalized = component_name.lower().strip().replace(" ", "-")

    # Map common aliases to canonical keys
    aliases = {
        "fab": "floating-action-button",
        "extended-fab": "extended-fab",
        "fab-menu": "fab-menu",
        "segmented-button": "segmented-buttons",
        "segmented-buttons": "segmented-buttons",
        "button": "buttons",
        "button-group": "button-groups",
        "nav-rail": "navigation-rail",
        "nav-bar": "navigation-bar",
        "app-bar": "app-bars",
        "textfield": "text-fields",
        "text-field": "text-fields",
    }
    canonical = aliases.get(normalized, normalized)

    # 1. Check components.md for synthesized rules
    guide_text = (ROOT / "components.md").read_text(encoding="utf-8")
    summary = ""
    for line in guide_text.splitlines():
        if f"/{canonical}/" in line or f"[{canonical}]" in line.lower() or f"[{component_name}]" in line.lower():
            summary = line
            break

    # 2. Look for retrieved page data JSONs
    specs_file = PAGE_DATA / f"components__{canonical}__specs.json"
    overview_file = PAGE_DATA / f"components__{canonical}__overview.json"
    a11y_file = PAGE_DATA / f"components__{canonical}__accessibility.json"

    available_data = {}
    if overview_file.exists():
        data = json.loads(overview_file.read_text(encoding="utf-8"))
        available_data["title"] = data.get("title", canonical.title())
        available_data["description"] = data.get("description", "")
        available_data["sections"] = [s.get("title") for s in data.get("sections", []) if isinstance(s, dict)]
    if specs_file.exists():
        available_data["has_specs"] = True
    if a11y_file.exists():
        available_data["has_accessibility_tab"] = True

    # Important Expressive replacements
    expressive_notes = {
        "segmented-buttons": "DEPRECATED in Expressive: Replaced by Connected Button Groups.",
        "button-groups": "EXPRESSIVE: Replaces segmented buttons. Supports single/multi-selection with connected visual containers.",
        "floating-action-button": "EXPRESSIVE: Small FAB and surface-color FABs are deprecated. Standard, medium, and large FABs remain recommended.",
        "fab-menu": "EXPRESSIVE: Replaces speed-dial and stacked small FABs for 2-6 related actions.",
        "navigation-drawer": "EXPRESSIVE: Replaced by the expanded Navigation Rail on large/expanded windows.",
        "navigation-rail": "EXPRESSIVE: Collapsed and expanded forms replace baseline rail and navigation drawer."
    }

    return {
        "component": canonical,
        "summary": summary if summary else "See components.md for full synthesized table.",
        "expressive_guidance": expressive_notes.get(canonical, "Standard M3 component with Expressive styling."),
        "touch_target_minimum": "48x48 dp / CSS px (mandatory)",
        "available_endpoints": available_data
    }


@server.tool()
def query_design_tokens(token_name: str, limit: int = 15) -> List[Dict[str, Any]]:
    """
    Search the 8,897 Material Design token catalog by name or role.

    Args:
        token_name: Token name substring (e.g., 'primary', 'container', 'corner',
                    'spring', 'elevation', 'title-large', 'motion').
        limit: Maximum results to return (default: 15).
    """
    catalog = _get_token_catalog()
    query = token_name.lower().strip()

    results = []
    for occ in catalog.get("occurrences", []):
        t_name = occ.get("token_name", "")
        t_id = occ.get("token_identity", "")
        if query in t_name.lower() or query in t_id.lower():
            results.append({
                "token_name": t_name,
                "token_identity": t_id,
                "module": occ.get("module"),
                "token_set": occ.get("token_set"),
                "values": occ.get("value_declarations", [])[:2]
            })
            if len(results) >= limit:
                break

    return results


@server.tool()
def get_color_roles() -> Dict[str, Any]:
    """
    Retrieve the Material 3 semantic color system roles, container pairings,
    and contrast rules.
    """
    return {
        "primary_roles": {
            "primary": "High-emphasis actions and key components",
            "on_primary": "Text/icons on primary",
            "primary_container": "Tonal container with lower emphasis than primary",
            "on_primary_container": "Text/icons on primary container"
        },
        "secondary_roles": {
            "secondary": "Less prominent components (chips, filter bars)",
            "on_secondary": "Text/icons on secondary",
            "secondary_container": "Subdued containers",
            "on_secondary_container": "Text/icons on secondary container"
        },
        "tertiary_roles": {
            "tertiary": "Contrasting accent role for balance and distinct elements",
            "on_tertiary": "Text/icons on tertiary",
            "tertiary_container": "Tertiary container fill",
            "on_tertiary_container": "Text/icons on tertiary container"
        },
        "surface_and_background": {
            "surface": "Default background for components and content",
            "surface_dim": "Dimmed background for contrast layers",
            "surface_bright": "Brightened background",
            "surface_container_lowest": "Lowest tier container (clean flat background)",
            "surface_container_low": "Cards, lowest elevation surfaces",
            "surface_container": "Standard card and dialog container",
            "surface_container_high": "Floating sheets, toolbars",
            "surface_container_highest": "Modal dialogs, popovers"
        },
        "outline_and_error": {
            "outline": "High-contrast borders and dividers",
            "outline_variant": "Low-contrast decorative dividers",
            "error": "Error indicators and alerts",
            "on_error": "Text/icons on error"
        },
        "contrast_rule": "Maintain 4.5:1 minimum contrast for normal text and 3:1 for large text/icons against their paired container."
    }


@server.tool()
def get_shape_scale() -> Dict[str, Any]:
    """
    Retrieve the Material 3 Expressive 35-shape family and corner radius scale.
    """
    return {
        "corner_radius_scale": {
            "none": "0 dp",
            "extra_small": "4 dp (e.g. snackbars, small chips)",
            "small": "8 dp (e.g. chips, small cards)",
            "medium": "12 dp (e.g. cards, small dialogs)",
            "large": "16 dp (e.g. dialogs, navigation rails)",
            "extra_large": "28 dp (e.g. floating action buttons, large cards)",
            "full": "Circular / pill (e.g. standard buttons, badge)"
        },
        "expressive_shapes": {
            "count": 35,
            "capabilities": "Supports smooth morphing and physical spring transitions.",
            "families": ["Pill", "Clover", "Burst", "Slanted", "Curved", "Scallop", "Diamond"],
            "guidance": "Use expressive shapes to guide visual attention on hero actions; keep high-frequency controls familiar and recognizable."
        }
    }


@server.tool()
def get_platform_compatibility(platform: str) -> Dict[str, str]:
    """
    Check the official support and library status for Material 3 and M3 Expressive
    on a given platform.

    Args:
        platform: Platform name ('compose', 'views', 'flutter', 'web', 'ios').
    """
    plat = platform.lower().strip()
    matrix = {
        "compose": {
            "platform": "Android (Jetpack Compose)",
            "status": "Primary / Compose-first",
            "library": "androidx.compose.material3:material3",
            "expressive_support": "Full support. Receives Expressive components, dynamic color, and tokens first.",
            "action": "Use for all new Android development."
        },
        "views": {
            "platform": "Android Views (MDC-Android)",
            "status": "Maintenance Mode",
            "library": "com.google.android.material:material",
            "expressive_support": "Critical bug and security fixes only. Selected styles present, but future feature work paused.",
            "action": "Maintain existing apps; plan migration to Jetpack Compose."
        },
        "flutter": {
            "platform": "Flutter",
            "status": "Active (Baseline M3 only)",
            "library": "package:flutter/material.jar",
            "expressive_support": "M3 Expressive is NOT officially implemented on Flutter (explicitly documented on m3.material.io).",
            "action": "Use baseline ThemeData(useMaterial3: true); do not hallucinate official Expressive Flutter APIs."
        },
        "web": {
            "platform": "Web (@material/web)",
            "status": "Maintenance Mode",
            "library": "@material/web",
            "expressive_support": "Maintenance mode; no current updates being made and Expressive is not implemented.",
            "action": "Use Angular Material for Angular, or custom Web Components / CSS tokens."
        },
        "ios": {
            "platform": "Native iOS (material-components-ios)",
            "status": "Archived (Read-Only)",
            "library": "material-components-ios",
            "expressive_support": "Repository was archived on December 11, 2025. No M3 Expressive support.",
            "action": "Use SwiftUI with custom Material Design tokens or Flutter."
        }
    }

    return matrix.get(plat, {
        "error": f"Unknown platform '{platform}'. Choose from: 'compose', 'views', 'flutter', 'web', 'ios'."
    })


# ---------------------------------------------------------------------------
# MCP Resources
# ---------------------------------------------------------------------------

@server.resource("m3://llms.txt")
def get_llms_txt() -> str:
    """The master AI prompt index and invariants document."""
    path = ROOT / "llms.txt"
    return path.read_text(encoding="utf-8") if path.exists() else "llms.txt not found"


@server.resource("m3://guidelines/{topic}")
def get_topic_guide(topic: str) -> str:
    """Read any complete authored topic guide (e.g., 'foundations', 'components', 'color', 'typography')."""
    path = ROOT / f"{topic}.md"
    if path.exists():
        return path.read_text(encoding="utf-8")
    return f"Guide '{topic}.md' not found."


# ---------------------------------------------------------------------------
# MCP Prompts
# ---------------------------------------------------------------------------

@server.prompt("implement_expressive_ui")
def implement_ui_prompt(component_name: str, platform: str = "compose") -> str:
    """
    Template prompt instructing an AI on how to implement an Expressive component
    with all invariants.
    """
    return (
        f"You are implementing the '{component_name}' component following Material 3 Expressive guidelines "
        f"for platform '{platform}'.\n\n"
        "Critical Rules to Follow:\n"
        "1. Touch targets must be at least 48x48 dp / CSS px.\n"
        "2. Segmented buttons are deprecated in Expressive; use Connected Button Groups.\n"
        "3. Small FAB and surface FAB are deprecated; use standard/medium/large FABs or FAB Menus.\n"
        "4. Pair semantic color roles correctly (e.g. on_primary on primary, on_surface on surface).\n"
        "5. If building for Flutter or Web, remember M3 Expressive is not natively implemented; build custom styling."
    )


# ---------------------------------------------------------------------------
# Server Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    server.run(transport="stdio")
