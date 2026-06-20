# Product Capabilities & Release Notes

## [2.0.0] — 2026-06-19
[DRAFT] This is the initial launch of Leaflet PDF! Leaflet PDF is a tool that transforms raw text, files, and YouTube videos into clean, structured, highly readable PDF study artifacts. It enforces fact-checking, extracts key points, and applies pedagogical formatting (like BLUF and mental buckets) to enhance learning. This release introduces the standalone Electron desktop app for Windows, as well as an MCP server for integrating Leaflet PDF directly into your AI assistants.

### New
- **Content Intake**: Support for pasting up to 100,000 characters of raw text, importing `.txt`/`.md` files, and automatically extracting transcripts from YouTube URLs.
- **AI Transformation Pipeline**: An orchestrator that transforms text by extracting factual claims, formatting the content with "teach-not-label" headings, applying BLUF (Bottom Line Up Front), generating 60-second cheat sheets, sorting into mental buckets, translating jargon, and turning facts into implications.
- **Fidelity Validation**: A self-healing validation stage that checks the AI's output against the original factual claims to prevent hallucinations. It auto-retries up to 3 times if facts are missed or invented.
- **Visual Styles**: Two curated PDF rendering styles: "Orbital Light" (the clean default) and "Orbital Night" (dark mode).
- **Electron Desktop App**: A self-contained Windows application featuring an intuitive intake screen, real-time pipeline progress monitoring, and native save dialogs.
- **MCP Server**: A headless Model Context Protocol integration (`leafletpdf_transform` tool) allowing you to run documents through the full pipeline directly from Cursor or Claude Desktop without leaving your editor. Supports two inference modes: MCP Sampling (uses your existing Claude Desktop or Cursor subscription — no API key required) and Direct API (Anthropic, Google, or Ollama with your own key).
- **Token Logging**: Comprehensive token usage tracking for all AI calls, recorded in `~/Documents/LeafletPDF/leafletpdf-token-log.jsonl`.

### Developer
- **[CR-016]**: Core monorepo setup (`@leafletpdf/core` and `@Leaflet PDF/desktop`).
- **[CR-018]**: Intake functions implemented with deterministic logic.
- **[CR-019]**: Transformer and Technique Selector implemented.
- **[CR-020]**: Factual Claim Extractor and Source Fidelity Validator implemented.
- **[CR-021]**: PDF Renderer and HTML template registry.
- **[CR-022]**: Electron UI built with React, Vite, and Tailwind CSS.
- **[CR-023]**: Automated test suite (Vitest), MakerSquirrel packager, and GitHub Actions CI workflow established.
- **[CR-024]**: Phase 2 MCP server (`@leafletpdf/mcp-server`) built and integrated.
- **[CR-003]**: MCP Sampling provider added. Zero-key inference mode for MCP server — delegates AI calls to the MCP host (Claude Desktop, Cursor) via `sampling/createMessage`. Auto-detected when no API key is configured.
