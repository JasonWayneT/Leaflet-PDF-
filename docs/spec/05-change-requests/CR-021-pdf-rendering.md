# CR-021: PDF Rendering (Epic 7)

## Background

Epic 7 introduces the PDF Rendering phase. Transformed and validated content is fed into HTML templates styled via CSS tokens. Playwright headless Chromium is used to generate A4 portrait PDFs that are readable on tablets. Both Orbital Light and Orbital Night styles are implemented.

## Affected Requirements

- `FR-019`: Transformed content rendered using active Visual Style to produce a Reading Artifact (PDF)
- `FR-020`: Both Orbital Light (default) and Orbital Night ship in v2; user selects at submission
- `FR-021`: Adding a new Visual Style requires only new spec + HTML template — no pipeline changes
- `FR-022`: Output is a valid PDF, portrait orientation, formatted for tablet reading
- `AC-044`–`AC-052`: Acceptance Criteria for Rendering

## Implementation tasks

- [x] TASK-S71-01: Create Visual Style specs (`ORBITAL-LIGHT.md`, `ORBITAL-NIGHT.md`)
- [x] TASK-S71-02: Create HTML templates for both styles
- [x] TASK-S72-01: Implement `style-registry.ts`
- [x] TASK-S72-02: Implement `Renderer` module using Playwright
- [x] TASK-S72-03: Update Traceability Matrix with Epic 7 stories

## Status

`complete`
