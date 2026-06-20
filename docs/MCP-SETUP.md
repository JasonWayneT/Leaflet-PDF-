# Leaflet PDF: MCP Server Setup

The Leaflet PDF MCP Server allows you to use the Leaflet PDF pipeline directly from Claude Desktop, Cursor, or any MCP-compatible AI assistant without leaving your editor.

## Requirements

- Node.js 18+
- A compatible MCP host: Claude Desktop, Cursor, or any host that supports MCP Sampling

---

## Inference Modes

Leaflet PDF supports two ways to run AI inference. You do not need to choose — it auto-detects based on your configuration.

| Mode | When it activates | What it uses |
|---|---|---|
| **MCP Sampling** (default) | No API key configured | Your Claude Desktop or Cursor subscription |
| **Direct API** | API key present in env | Anthropic, Google, or Ollama |

Most users should start with MCP Sampling — no API key, no extra cost.

---

## Claude Desktop Setup

### Option A: MCP Sampling (no API key required)

Open your Claude Desktop configuration file:
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

Add the following to the `mcpServers` object:

```json
{
  "mcpServers": {
    "Leaflet PDF": {
      "command": "node",
      "args": ["<PATH_TO_Leaflet PDF>/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Replace `<PATH_TO_Leaflet PDF>` with the absolute path to your Leaflet PDF folder. No `env` block needed — Leaflet PDF detects sampling mode automatically.

### Option B: Direct API (Anthropic, Google, or Ollama)

Use this if you want to specify a particular model or provider.

```json
{
  "mcpServers": {
    "Leaflet PDF": {
      "command": "node",
      "args": ["<PATH_TO_Leaflet PDF>/packages/mcp-server/dist/index.js"],
      "env": {
        "LEAFLETPDF_ANTHROPIC_KEY": "sk-ant-your-key-here"
      }
    }
  }
}
```

Restart Claude Desktop after editing. Confirm the tool loaded by clicking the hammer (🔨) icon — `leafletpdf_transform` should appear.

---

## Cursor Setup

1. Go to **Settings → Features → MCP Servers**
2. Click **+ Add new MCP server**
3. Set:
   - **Name:** `Leaflet PDF`
   - **Type:** `command`
   - **Command:** `node <PATH_TO_Leaflet PDF>/packages/mcp-server/dist/index.js`
4. Leave the environment block empty to use MCP Sampling, or add your API key if using Direct API mode.

---

## Environment Variables (Direct API mode)

| Variable | Purpose | Default |
|---|---|---|
| `LEAFLETPDF_ANTHROPIC_KEY` | Anthropic API key | — |
| `LEAFLETPDF_GOOGLE_KEY` | Google API key | — |
| `LEAFLETPDF_OLLAMA_URL` | Ollama base URL | `http://localhost:11434` |
| `LEAFLETPDF_TRANSFORM_PROVIDER` | `anthropic` / `google` / `ollama` / `mcp-sampling` | auto-detect |
| `LEAFLETPDF_TRANSFORM_MODEL` | Model for transformation slot | `claude-3-5-sonnet-20241022` |
| `LEAFLETPDF_VALIDATE_PROVIDER` | Provider for validation slot | same as transform |
| `LEAFLETPDF_VALIDATE_MODEL` | Model for validation slot | `claude-3-haiku-20240307` |
| `LEAFLETPDF_OUTPUT_DIR` | Where PDFs are saved | `~/Documents/LeafletPDF/` |

---

## Usage

Once configured, ask your assistant naturally:

- *"Leaflet PDF this article: [paste text]"*
- *"Transform this file into a reading artifact: C:\path\to\notes.md"*
- *"Leaflet PDF this YouTube video: https://youtube.com/..."*

The tool runs the full pipeline and saves a PDF to `~/Documents/LeafletPDF/` (or your configured output directory). It returns the saved file path when complete.

---

## Troubleshooting

**Tool loads but returns a sampling error:**
Your MCP host may not support the `sampling/createMessage` protocol. Add an API key to switch to Direct API mode (see Option B above).

**Playwright / PDF rendering errors:**
The server needs Chromium. Run the following in the `packages/mcp-server` directory:
```
npx playwright install chromium
```

**Token log:**
All runs are logged to `~/Documents/LeafletPDF/leafletpdf-token-log.jsonl`. In MCP Sampling mode, token counts will show `0` — this is expected, as the sampling protocol does not return token usage.
