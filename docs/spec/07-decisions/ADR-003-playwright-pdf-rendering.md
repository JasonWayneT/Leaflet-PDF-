# ADR-003 — Playwright for PDF Rendering (HTML/CSS → PDF)

## Status

accepted

## Context

The Reading Artifact must conform to a detailed Visual Style spec (Orbital Light / Orbital Night) with custom typography (Anton, Hanken Grotesk, JetBrains Mono), a CSS-like token system, and precise layout components (corner brackets, thick borders, barcode strips). The rendering approach must handle the full CSS spec and custom fonts, and must produce a valid PDF.

## Decision

Playwright headless Chromium renders HTML templates to PDF in the Electron main process. The style spec's YAML frontmatter is parsed into CSS variables, injected into the HTML template, and Playwright calls `page.pdf()` with A4 portrait settings.

## Requirement links

- `INT-003`
- `FR-021`
- `FR-022`
- `NFR-007`

## Consequences

### Positive

- Full CSS support including custom fonts, CSS variables, grid/flex layouts, print-background
- ORBITAL-LIGHT.md CSS-like spec maps directly to CSS implementation — no translation layer
- New Visual Style = new HTML template + new spec; no renderer code changes
- Playwright is already a well-maintained npm package; no subprocess bridge required

### Negative

- Playwright bundles Chromium (~150MB) — increases distributable size
- Playwright must be explicitly packaged in the electron-builder config to ship with the `.exe`
- Runs in main process — PDF generation blocks the main thread during rendering

### Neutral

- Playwright runs in the Electron main process (not renderer); fonts loaded via `@font-face` pointing to local bundled paths

## Alternatives considered

| Option | Why rejected |
|---|---|
| PDFKit / jsPDF | No support for complex CSS layouts, custom fonts at the spec's level of fidelity |
| Puppeteer | Playwright is functionally equivalent; Playwright is preferred in current ecosystem |
| wkhtmltopdf | Subprocess dependency; limited CSS support; not npm-native |
| WeasyPrint (Python) | Requires Python subprocess bridge; wrong language for a Node/TypeScript project |
