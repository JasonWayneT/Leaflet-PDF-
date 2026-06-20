---
title: "PRD Addendum: Leaflet PDF MCP Server (Phase 2)"
created: 2026-06-19
status: draft
version: 0.1
---

# PRD Addendum: Leaflet PDF MCP Server (Phase 2)

## 0. Document Purpose

This addendum extends the Leaflet PDF PRD (`docs/PRD.md`) to define the MCP server delivery target. All core pipeline requirements (FR-1 through FR-24) remain unchanged. This document covers the MCP shell only — the new interface layer that exposes the existing `@leafletpdf/core` pipeline as an MCP tool callable from Claude Desktop, Cursor, and any MCP-compatible host.

The upstream decision to build this in a monorepo (`ADR-001`, ARCHITECTURE.md §Decision 2 Addendum) was made specifically to enable this path without a rewrite.

---

## 1. Vision

The MCP server makes the Leaflet PDF pipeline callable from within AI assistant environments — Claude Desktop, Cursor, or any MCP-compatible host. Instead of opening the Electron app, the user can say:

> "Leaflet PDF this YouTube video: [URL]" or "Transform this article into a reading artifact"

...and the assistant invokes the `leafletpdf_transform` MCP tool, runs the full pipeline, and returns the saved PDF path.

This is Jason's **primary day-to-day use case**. The Electron app is the portfolio piece. The MCP server is the daily driver.

---

## 2. Target User

Same single user — Jason. The tool is not multi-user. The MCP server simply provides a different invocation surface for the same pipeline.

**Primary trigger context:** Jason is working inside Claude Desktop or Cursor, encounters content he wants to read later (a YouTube link, a pasted article, a file), and invokes `leafletpdf_transform` without switching applications.

---

## 3. New Feature: MCP Tool Interface

### Feature MCP-1: `leafletpdf_transform` MCP Tool

**Description:** A single MCP tool that accepts source content (text, file path, or YouTube URL), runs the full Leaflet PDF pipeline, saves the PDF to a specified or default output directory, and returns the saved file path to the calling MCP host.

**Functional Requirements:**

#### MCP-FR-001: Tool inputs
The `leafletpdf_transform` tool accepts the following inputs:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `content` | `string` | Yes | Raw text, markdown, or a YouTube URL. Mutually exclusive with `filePath`. |
| `filePath` | `string` | No | Absolute path to a `.md` or `.txt` file. Mutually exclusive with `content`. |
| `style` | `string` | No | Visual style: `orbital-light` (default) or `orbital-night`. |
| `title` | `string` | No | Document title. Derived from content if not provided. |
| `outputDir` | `string` | No | Directory to save the PDF. Defaults to `LEAFLETPDF_OUTPUT_DIR` env var or `~/Documents/LeafletPDF/`. |

**Consequences (testable):**
- Tool accepts plain text, YouTube URLs, and file paths as content source
- If both `content` and `filePath` are provided, tool returns an error
- If neither is provided, tool returns an error
- Unknown `style` values return a validation error before the pipeline starts

#### MCP-FR-002: Provider configuration
The MCP server reads AI provider credentials from environment variables — not from the Electron keytar store (which is unavailable outside Electron). An API key is not required when using MCP Sampling mode (see MCP-FR-007).

| Environment Variable | Purpose |
|---|---|
| `LEAFLETPDF_ANTHROPIC_KEY` | Anthropic API key (optional — not needed in sampling mode) |
| `LEAFLETPDF_GOOGLE_KEY` | Google API key (optional alternative) |
| `LEAFLETPDF_OLLAMA_URL` | Ollama base URL (local model, optional) |
| `LEAFLETPDF_TRANSFORM_PROVIDER` | `anthropic` / `google` / `ollama` / `mcp-sampling` (default: auto-detect) |
| `LEAFLETPDF_TRANSFORM_MODEL` | Model name for transformation slot (ignored in sampling mode) |
| `LEAFLETPDF_VALIDATE_PROVIDER` | Provider for validation slot (default: same as transform) |
| `LEAFLETPDF_VALIDATE_MODEL` | Model name for validation slot (ignored in sampling mode) |
| `LEAFLETPDF_OUTPUT_DIR` | Directory to save PDFs (default: `~/Documents/LeafletPDF/`) |

**Provider auto-detection logic:**
- No API key and no Ollama URL → MCP Sampling (host-delegated inference)
- `LEAFLETPDF_ANTHROPIC_KEY` present → Anthropic
- `LEAFLETPDF_GOOGLE_KEY` present → Google
- `LEAFLETPDF_OLLAMA_URL` present → Ollama
- Explicit override: set `LEAFLETPDF_TRANSFORM_PROVIDER` to any of the above

**Consequences (testable):**
- If no valid API key and no Ollama URL are present, the server enters sampling mode rather than erroring
- If a provider is explicitly configured but its required credential is absent, the tool returns a clear error before the pipeline starts
- All env vars are read at server startup

#### MCP-FR-003: Tool output
On success, the tool returns a structured response containing:
- `filePath` — absolute path to the saved PDF
- `title` — derived or provided document title
- `style` — applied visual style
- `attempts` — number of transformation/validation cycles (1–3)
- `tokenSummary` — total input and output tokens used

On failure, the tool returns:
- `error.stage` — which pipeline stage failed
- `error.cause` — human-readable reason
- `error.retryable` — whether the user can try again (e.g., transient API error vs. unsupported input)

**Consequences (testable):**
- Success response includes the file path the PDF was saved to
- Failure response identifies the failed stage by name (same stage names as the Electron UI)
- Token summary is always included, even on partial failure

#### MCP-FR-004: Output directory management
The server writes PDFs to a deterministic location without prompting the user (there is no native dialog in MCP context).

**Consequences (testable):**
- PDF is saved to `LEAFLETPDF_OUTPUT_DIR` if set; otherwise to `~/Documents/LeafletPDF/`
- Output directory is created if it does not exist
- Filename is derived from the document title, sanitized for filesystem safety
- If a file with the same name already exists, a numeric suffix is appended (`Title (2).pdf`)

#### MCP-FR-005: Pipeline progress in tool output
The tool does not stream intermediate progress (MCP tools are request/response). It runs the full pipeline synchronously and returns the final result.

A `verbose` boolean parameter (optional, default `false`) causes the tool to include pipeline stage timing in the response:
```json
{
  "stages": {
    "extracting": "1.2s",
    "transforming": "18.4s",
    "validating": "3.1s",
    "rendering": "4.7s"
  }
}
```

**Consequences (testable):**
- `verbose: false` returns only the summary fields
- `verbose: true` includes stage timings in the response

#### MCP-FR-006: Token logging
Every `leafletpdf_transform` call appends to the same `leafletpdf-token-log.jsonl` file used by the Electron app.

**Consequences (testable):**
- Log entry includes `inputType: "mcp"` to distinguish MCP-sourced runs from Electron-sourced runs
- Log schema is identical to the Electron log (same file, same format)
- Log file path: `~/Documents/LeafletPDF/leafletpdf-token-log.jsonl` (overrides Electron's userData path since userData is not available in MCP context)

#### MCP-FR-007: MCP Sampling mode (host-delegated inference)
When no direct API key or Ollama URL is configured, the MCP server delegates all AI inference to the MCP host via the `sampling/createMessage` protocol. This allows users with a Claude Desktop or Cursor subscription to run the full Leaflet PDF pipeline without a separate API key.

**Consequences (testable):**
- Server starts and operates normally with no API key in the environment
- All three AI stages (claim extraction, transformation, validation) complete successfully via sampling
- A valid PDF is produced and saved to the output directory
- The tool response `tokenSummary` reports `{ input: 0, output: 0 }` in sampling mode (token counts are not returned by the MCP sampling protocol)
- If the MCP host does not support sampling, the tool returns a clear error identifying the cause

---

## 4. Non-Goals (MCP Phase 2)

- **No streaming progress** — MCP tool is request/response; progress updates are not supported in Phase 2
- **No interactive prompts** — the server never waits for user input during a tool call
- **No web server** — the MCP server runs as a stdio process, not an HTTP server
- **No multi-document batching** — one call, one document
- **No GUI** — the MCP server is headless; the Electron app continues to serve the GUI use case
- **No cross-user key sharing** — API keys are per-user environment variables

---

## 5. Architecture Notes

**This is a thin shell around `@leafletpdf/core`.**

```
packages/mcp-server/
  src/
    index.ts        ← MCP server entry point (stdio transport)
    server.ts       ← McpServer instance, tool registration
    tools/
      leafletpdf-transform.ts  ← tool handler: reads env vars, calls PipelineOrchestrator
    config/
      env-config.ts        ← reads/validates all LEAFLETPDF_* env vars
```

`PipelineOrchestrator` is imported from `@leafletpdf/core` exactly as the Electron app imports it. The shell subscribes to its EventEmitter events, collects timing data, and resolves when `pipeline:complete` fires.

**Key constraint:** `packages/mcp-server` must have zero Electron dependencies, just like `packages/core`. The MCP server is a pure Node.js process.

**MCP SDK:** `@modelcontextprotocol/sdk` (official MCP TypeScript SDK). Stdio transport. No HTTP.

**Playwright / Chromium:** The MCP server needs the Playwright Chromium binary. The server's `package.json` will include a `postinstall` script: `playwright install chromium`.

---

## 6. Success Criteria

- `leafletpdf_transform` can be called from Claude Desktop or Cursor and produces a real PDF
- All existing `@leafletpdf/core` tests still pass (no changes to core)
- The MCP server starts without error when configured with a valid API key
- A run that calls `leafletpdf_transform` with a YouTube URL and `style: "orbital-night"` produces a dark-theme PDF in the configured output directory
