# Feature Spec: FEAT-005 — PDF Rendering

## Metadata

- **Feature ID:** `FEAT-005`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.5, `BMAD-SRC-003` §Decision 4, `BMAD-SRC-006` Epic 7
- **Related requirements:** `FR-019`, `FR-020`, `FR-021`, `FR-022`, `NFR-007`, `ARCH-002`, `ARCH-006`, `INT-003`

## Problem statement

Validated Transformed Content must be rendered into a designed PDF that looks and reads like a professional publication — not a formatted document. The rendering system must be driven by spec files, not hardcoded values, so new Visual Styles can be added without touching the pipeline.

## Goals

- `GOAL-001`: Render Transformed Content into a Reading Artifact using the active Visual Style
- `GOAL-002`: Both Orbital Light and Orbital Night produce fully-styled, valid PDFs
- `GOAL-003`: Style system is extensible — new style = new spec + new template + one registry entry
- `GOAL-004`: Renderer never alters text content

## Non-goals

- `NG-001`: Additional Visual Styles beyond Orbital Light and Orbital Night in v2 MVP — Phase 3
- `NG-002`: User-editable style parameters in v2
- `NG-003`: HTML/web output format — PDF only

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-7.1` | P0 | As a developer, I want both Orbital Light and Orbital Night HTML templates built from their specs | `FR-019–020`, `NFR-007` |
| `STORY-7.2` | P0 | As a developer, I want a Style Registry + Renderer that injects CSS tokens, populates template slots, and calls Playwright | `FR-019`, `FR-021`, `FR-022`, `INT-003`, `ARCH-002` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-019` | Apply Visual Style to Transformed Content → Reading Artifact |
| `FR-020` | Both Orbital Light (default) and Orbital Night in v2; user selects at submission |
| `FR-021` | New style = new spec + template + registry entry; no pipeline changes |
| `FR-022` | Valid PDF; A4 portrait; tablet-readable margins |
| `NFR-007` | Portrait; opens in system default PDF viewer |
| `INT-003` | Playwright headless Chromium renders HTML/CSS → PDF |

## Acceptance criteria

See `02-requirements-registry.md` AC-044 through AC-052.

## Edge cases

- `AC-045`: Renderer does not alter text content of Transformed output — visual presentation only
- `AC-049–050`: Adding new style modifies only 3 things (spec file, HTML template, registry entry)
- Orbital Light `accent-blue: #0052ff` — **verify against original design reference before HTML template implementation** (flagged in ARCHITECTURE.md §Decision 4 and `01-bmad-intake.md`)

## UX and design notes

- Orbital Light: white/off-white base, ink-black body (Hanken Grotesk), Anton display headings, JetBrains Mono labels, accent-blue for key terms, acid-yellow for action badges. Spec: `Projects/BookitV2/ORBITAL-LIGHT.md`
- Orbital Night: Terminal Black (#131313) base, acid-yellow + white accents, same typography and structural elements. Spec: `Projects/BookitV2/ORBITAL-NIGHT.md`
- Both styles: sharp corners, thick borders, corner bracket decorative elements
- PDF margins: tablet-reading margins (top/bottom 24mm, left/right 20mm per ARCHITECTURE.md)
- Fonts bundled: Anton-Regular.ttf, HankenGrotesk-Regular.ttf (+ weight variants), JetBrainsMono-Medium.ttf

## Technical notes

- **Renderer:** `packages/core/src/modules/renderer/renderer.ts`
- **Style Registry:** `packages/core/src/modules/renderer/style-registry.ts`
- **Templates:** `renderer/templates/orbital-light.html`, `renderer/templates/orbital-night.html`
- **Fonts:** `renderer/assets/fonts/`
- Renderer reads YAML frontmatter from spec → token object → injects as CSS variables
- Template slot markers (e.g. `{{BLUF_SECTION}}`, `{{BODY_SECTIONS}}`, `{{CHEAT_SHEET}}`) for content injection
- Playwright runs in Electron main process (not renderer)
- `page.pdf({ format: 'A4', printBackground: true, margin: { top: '24mm', right: '20mm', bottom: '24mm', left: '20mm' } })`
- Fonts loaded via `@font-face` pointing to local `assets/fonts/` paths (accessible to Playwright)

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-015` | `FR-019–020`, `NFR-007` | `orbital-light.html` + `orbital-night.html`: CSS variable templates, slot markers, font faces | todo |
| `TASK-016` | `FR-021` | `style-registry.ts`: map style names to spec + template paths | todo |
| `TASK-017` | `FR-019`, `FR-022`, `INT-003`, `ARCH-002` | `renderer.ts`: parse spec → inject tokens → populate slots → Playwright → PDF buffer | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-016` | `FR-019`, `FR-022`, `AC-044–045` | unit | render: orbital-light produces valid PDF buffer (mocked Playwright) |
| `TEST-017` | `FR-020`, `AC-048` | unit | render: orbital-night produces valid PDF buffer (mocked Playwright) |
| `TEST-018` | `FR-021`, `AC-049–050` | unit | style-registry: unknown style name → `Result<never>` with PipelineError |

## Open questions

| Question | Blocking? |
|---|---|
| Verify Orbital Light `accent-blue: #0052ff` against original design reference before HTML template build | Yes — confirm before TASK-015 |
