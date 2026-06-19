---
title: "PRD Addendum: Bookit MCP Server (Phase 2)"
created: 2026-06-19
status: draft
version: 0.1
---

# PRD Addendum: Bookit MCP Server (Phase 2)

## 0. Document Purpose

This addendum extends the Bookit v2 PRD (`docs/PRD.md`) to define the MCP server delivery target. All core pipeline requirements (FR-1 through FR-24) remain unchanged. This document covers the MCP shell only — the new interface layer that exposes the existing `@bookit/core` pipeline as an MCP tool callable from Claude Desktop, Cursor, and any MCP-compatible host.

The upstream decision to build this in a monorepo (`ADR-001`, ARCHITECTURE.md §Decision 2 Addendum) was made specifically to enable this path without a rewrite.

---

## 1. Vision

The MCP server makes the Bookit pipeline callable from within AI assistant environments — Claude Desktop, Cursor, or any MCP-compatible host. Instead of opening the Electron app, the user can say:

> "Bookit this YouTube video: [URL]" or "Transform this article into a reading artifact"

...and the assistant invokes the `bookit_transform` MCP tool, runs the full pipeline, and returns the saved PDF path.

This is Jason's **primary day-to-day use case**. The Electron app is the portfolio piece. The MCP server is the daily driver.

---

## 2. Target User

Same single user — Jason. The tool is not multi-user. The MCP server simply provides a different invocation surface for the same pipeline.

**Primary trigger context:** Jason is working inside Claude Desktop or Cursor, encounters content he wants to read later (a YouTube link, a pasted article, a file), and invokes `bookit_transform` without switching applications.

---

## 3. New Feature: MCP Tool Interface

### Feature MCP-1: `bookit_transform` MCP Tool

**Description:** A single MCP tool that accepts source content (text, file path, or YouTube URL), runs the full Bookit pipeline, saves the PDF to a specified or default output directory, and returns the saved file path to the calling MCP host.

**Functional Requirements:**

#### MCP-FR-001: Tool inputs
The `bookit_transform` tool accepts the following inputs:

| Parameter | Type | Required | Description |
|---|---|---|---|
| `content` | `string` | Yes | Raw text, markdown, or a YouTube URL. Mutually exclusive with `filePath`. |
| `filePath` | `string` | No | Absolute path to a `.md` or `.txt` file. Mutually exclusive with `content`. |
| `style` | `string` | No | Visual style: `orbital-light` (default) or `orbital-night`. |
| `title` | `string` | No | Document title. Derived from content if not provided. |
| `outputDir` | `string` | No | Directory to save the PDF. Defaults to `BOOKIT_OUTPUT_DIR` env var or `~/Documents/Bookit/`. |

**Consequences (testable):**
- Tool accepts plain text, YouTube URLs, and file paths as content source
- If both `content` and `filePath` are provided, tool returns an error
- If neither is provided, tool returns an error
- Unknown `style` values return a validation error before the pipeline starts

#### MCP-FR-002: API key configuration
The MCP server reads AI provider credentials from environment variables — not from the Electron keytar store (which is unavailable outside Electron).

| Environment Variable | Purpose |
|---|---|
| `BOOKIT_ANTHROPIC_KEY` | Anthropic API key (transformation + validation) |
| `BOOKIT_GOOGLE_KEY` | Google API key (alternative) |
| `BOOKIT_OLLAMA_URL` | Ollama base URL (local model, optional) |
| `BOOKIT_TRANSFORM_PROVIDER` | `anthropic` / `google` / `ollama` (default: `anthropic`) |
| `BOOKIT_TRANSFORM_MODEL` | Model name for transformation slot |
| `BOOKIT_VALIDATE_PROVIDER` | Provider for validation slot (default: same as transform) |
| `BOOKIT_VALIDATE_MODEL` | Model name for validation slot |

**Consequences (testable):**
- If no valid API key is present for the configured provider, tool returns a clear error before the pipeline starts
- All env vars are read at tool invocation, not at server startup (supports hot env updates)

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
- PDF is saved to `BOOKIT_OUTPUT_DIR` if set; otherwise to `~/Documents/Bookit/`
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
Every `bookit_transform` call appends to the same `bookit-token-log.jsonl` file used by the Electron app.

**Consequences (testable):**
- Log entry includes `inputType: "mcp"` to distinguish MCP-sourced runs from Electron-sourced runs
- Log schema is identical to the Electron log (same file, same format)
- Log file path: `~/Documents/Bookit/bookit-token-log.jsonl` (overrides Electron's userData path since userData is not available in MCP context)

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

**This is a thin shell around `@bookit/core`.**

```
packages/mcp-server/
  src/
    index.ts        ← MCP server entry point (stdio transport)
    server.ts       ← McpServer instance, tool registration
    tools/
      bookit-transform.ts  ← tool handler: reads env vars, calls PipelineOrchestrator
    config/
      env-config.ts        ← reads/validates all BOOKIT_* env vars
```

`PipelineOrchestrator` is imported from `@bookit/core` exactly as the Electron app imports it. The shell subscribes to its EventEmitter events, collects timing data, and resolves when `pipeline:complete` fires.

**Key constraint:** `packages/mcp-server` must have zero Electron dependencies, just like `packages/core`. The MCP server is a pure Node.js process.

**MCP SDK:** `@modelcontextprotocol/sdk` (official MCP TypeScript SDK). Stdio transport. No HTTP.

**Playwright / Chromium:** The MCP server needs the Playwright Chromium binary. The server's `package.json` will include a `postinstall` script: `playwright install chromium`.

---

## 6. Success Criteria

- `bookit_transform` can be called from Claude Desktop or Cursor and produces a real PDF
- All existing `@bookit/core` tests still pass (no changes to core)
- The MCP server starts without error when configured with a valid API key
- A run that calls `bookit_transform` with a YouTube URL and `style: "orbital-night"` produces a dark-theme PDF in the configured output directory
