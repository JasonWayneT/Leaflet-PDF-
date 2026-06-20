# CR-023: End-to-End Integration & Distribution

## Type
Integration / Distribution

## Description
Implements Epic 9: Story 9.1 (Full Pipeline Integration) and Story 9.2 (Windows Executable Distribution).

Story 9.1 adds a vitest `test` script to `@leafletpdf/core` and converts the compile-only `pipeline-orchestrator.test.ts` into real runtime tests covering: happy path, fidelity retry (fail → retry → pass), 3-failure halt, and module error halt. CI is updated to run tests.

Story 9.2 moves the `ORBITAL-LIGHT.md` and `ORBITAL-NIGHT.md` style spec files from `docs/spec/04-design-specs/` into `packages/core/src/modules/renderer/templates/` so they are naturally bundled inside the ASAR. `style-registry.ts` is updated to reference the new paths. A `make` script is added to the root and a CI make job (main branch only) produces the Windows installer.

## Requirement IDs
- NFR-001, NFR-002, NFR-003 (Story 9.1 — integration confidence)
- NFR-005 (Story 9.2 — self-contained Windows app)

## Status
In progress
