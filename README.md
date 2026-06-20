# Leaflet PDF

> A personal tool that transforms text, files, and YouTube videos into structured, designed PDF reading artifacts using an AI pipeline with built-in fact validation.

---

## What This Is

Learning content arrives in formats optimized for platforms — infinite scroll, autoplay, dense walls of text. Leaflet PDF takes that content and restructures it for deep reading: applying pedagogical techniques (BLUF, mental buckets, teach-not-label headings), extracting a 60-second cheat sheet, and rendering the result as a clean, tablet-friendly PDF.

It runs as a Windows desktop app and as an MCP server callable from Claude Desktop or Cursor.

**What this is not:**
- A general-purpose document formatter — it restructures for learning, not just visual polish
- A multi-user or hosted tool — single-user, local-first, no server required
- A summarizer — it preserves all factual claims from the source and validates this automatically

---

## Status

| Field | Value |
|---|---|
| **Phase** | Dogfood |
| **Stability** | Stable |
| **Last updated** | June 2026 |

---

## How It Works

Source content enters the pipeline as raw text, a `.md`/`.txt` file, or a YouTube URL. A four-stage pipeline runs:

1. **Intake** — extracts plain text from the source; fetches transcripts for YouTube URLs
2. **Transform** — a deterministic technique selector chooses which learning frameworks to apply (BLUF, mental buckets, jargon translation, etc.); an AI model restructures the content using those techniques
3. **Validate** — the AI extracts factual claims from the source; a second AI call checks that every claim is preserved in the transformed output. If any are missing, the pipeline retries transformation up to 3 times
4. **Render** — Playwright renders the structured content into a styled PDF using a pre-designed HTML/CSS template

The PDF is saved locally. No data leaves your machine except the AI inference calls.

---

## Installation

### Requirements

- Node.js 18+
- Windows 11 (Electron app)
- One of the following for AI inference:
  - Claude Desktop or Cursor subscription (MCP Sampling — no API key needed)
  - Anthropic, Google, or Ollama API key (Direct API mode)

### Setup

```bash
git clone https://github.com/[your-username]/Leaflet PDF-v2.git
cd Leaflet PDF-v2
npm install
```

### Build the MCP server

```bash
npm run build --workspace=packages/mcp-server
```

### Run the Electron app

```bash
npm start --workspace=packages/electron-app
```

---

## Usage

### As an MCP tool (Claude Desktop or Cursor)

Add to your MCP client config — no API key required if you have a Claude Desktop or Cursor subscription:

```json
{
  "mcpServers": {
    "Leaflet PDF": {
      "command": "node",
      "args": ["/absolute/path/to/Leaflet PDF-v2/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Then ask your assistant:

```
Leaflet PDF this article: [paste text]
Transform this file into a reading artifact: /path/to/notes.md
Leaflet PDF this YouTube video: https://youtube.com/watch?v=...
```

See [docs/MCP-SETUP.md](./docs/MCP-SETUP.md) for Cursor setup and Direct API configuration.

### As a desktop app

Launch the Electron app, paste content or drop a file, choose a visual style, and click Transform. The pipeline runs with real-time stage progress. A native save dialog opens when the PDF is ready.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop UI | Electron + React + TypeScript (electron-forge / Vite) |
| Pipeline | Node.js + TypeScript (`@leafletpdf/core` shared package) |
| AI inference | Vercel AI SDK — Anthropic, Google, Ollama, MCP Sampling |
| PDF rendering | Playwright Chromium (HTML/CSS → PDF) |
| MCP integration | `@modelcontextprotocol/sdk` (stdio transport) |
| Testing | Vitest |
| Monorepo | npm workspaces |

---

## Project Structure

```
Leaflet PDF-v2/
├── packages/
│   ├── core/               # Shared pipeline logic — zero Electron dependencies
│   │   └── src/
│   │       ├── modules/    # Intake, Technique Selector, Claim Extractor, Transformer, Validator, Renderer
│   │       ├── services/   # AI client (multi-provider abstraction)
│   │       ├── orchestrator/  # Pipeline controller + retry logic
│   │       └── types/      # Canonical handoff contracts
│   ├── electron-app/       # Windows desktop app (imports from core)
│   └── mcp-server/         # MCP stdio server (imports from core)
├── docs/
│   ├── ARCHITECTURE.md     # Architecture decisions (ADRs)
│   ├── PRD.md              # Product requirements (FR-1 through FR-24)
│   ├── PRD-MCP-addendum.md # MCP server requirements (MCP-FR-001 through MCP-FR-007)
│   ├── MCP-SETUP.md        # MCP configuration guide
│   └── .decision-log.md    # All product and architecture decisions with rationale
├── AGENTS.md               # Agent operating rules and methodology context
├── PRODUCT_CAPABILITIES_AND_RELEASE_NOTES.md
└── README.md               # This file
```

---

## Documentation

| Document | Purpose |
|---|---|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Architecture decisions — tech stack, pipeline design, provider model |
| [docs/PRD.md](./docs/PRD.md) | Full product requirements with testable consequences |
| [docs/PRD-MCP-addendum.md](./docs/PRD-MCP-addendum.md) | MCP server requirements and sampling mode spec |
| [docs/MCP-SETUP.md](./docs/MCP-SETUP.md) | Step-by-step MCP setup for Claude Desktop and Cursor |
| [docs/.decision-log.md](./docs/.decision-log.md) | Every product and architecture decision with context and rationale |
| [PRODUCT_CAPABILITIES_AND_RELEASE_NOTES.md](./PRODUCT_CAPABILITIES_AND_RELEASE_NOTES.md) | Release history and capability changelog |

---

## How This Was Built

This project followed a full PM-led development process using the BMAD methodology before a line of code was written. The sequence was: idea validation → product brief → PRD → UX spec → architecture decisions → epics and stories → implementation. Every major decision is recorded in `docs/.decision-log.md` with its rationale.

The monorepo structure (`packages/core`, `packages/electron-app`, `packages/mcp-server`) was an explicit architecture decision made before implementation began — `core` was designed with zero Electron dependencies specifically so it could serve as the foundation for both the desktop app and the MCP server without a rewrite.

---

## License

Private
