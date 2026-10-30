# Material 3 Expressive MCP Server

A standard [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server exposing the Material 3 Expressive knowledge base to AI assistants, coding agents, and IDEs (Cursor, Claude Desktop, Antigravity, VS Code, Windsurf).

---

## Capabilities & Tools

The MCP server provides zero-hallucination, low-latency access to 36 component specifications, 8,897 tokens, and platform support realities:

| Tool | Purpose | Example Input |
|---|---|---|
| `search_guidelines` | Real-time offline search across all guides and extracted text | `{"query": "button group"}` |
| `get_component_specs` | Detailed specs, Expressive variants, deprecations, and a11y criteria | `{"component_name": "button-groups"}` |
| `query_design_tokens` | Searches the 8,897-token database by role or name | `{"token_name": "primary-container"}` |
| `get_color_roles` | Returns semantic color role pairings and container hierarchy | `{}` |
| `get_shape_scale` | Returns the 35 Expressive shapes and 7-tier corner scale | `{}` |
| `get_platform_compatibility`| Reality check for Compose, Views, Flutter, Web, and iOS | `{"platform": "flutter"}` |

### Resources & Prompts
- **Resource `m3://llms.txt`:** Core prompt invariants and rules.
- **Resource `m3://guidelines/{topic}`:** Full markdown text for any topic (e.g. `foundations`, `components`, `color`).
- **Prompt `implement_expressive_ui`:** Ready-to-use template for generating accessible, spec-compliant UI.

---

## How to Configure in Your AI Tools

### 1. Claude Desktop
Add this to your `claude_desktop_config.json` (`%APPDATA%\Claude\claude_desktop_config.json` on Windows or `~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "material-3-expressive": {
      "command": "python",
      "args": [
        "c:/Documents/Material-Expressive/knowledge-base/mcp_server.py"
      ]
    }
  }
}
```

### 2. Cursor IDE
In Cursor **Settings > Features > MCP Servers > Add New MCP Server**:
* **Name:** `material-3-expressive`
* **Type:** `command`
* **Command:** `python c:/Documents/Material-Expressive/knowledge-base/mcp_server.py`

### 3. Antigravity / Gemini Code Assist
Add to your project's workspace MCP configuration or plugin manifest:
```json
{
  "material-3-expressive": {
    "command": "python",
    "args": ["${workspaceFolder}/knowledge-base/mcp_server.py"]
  }
}
```

---

## Running Standalone

To run the server in standard stdio mode:

```powershell
python mcp_server.py
```

