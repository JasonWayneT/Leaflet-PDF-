# Change Request: CR-003 Shared Type Definitions

## Metadata

- Change request ID: `CR-003`
- Type: architecture
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Implement Story 1.3 by defining the shared pipeline handoff contract types once in `packages/core/src/types/index.ts`, then re-exporting them from `packages/core/src/index.ts` so downstream packages import from `@leafletpdf/core`.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `ARCH-004` | implements | Establishes `core/src/types/index.ts` as the shared handoff contract source |
| `ARCH-002` | supports | Defines the shared `Result<T>` and `PipelineError` error contract |

## Documentation updates required before code

- [x] Change request created
- [x] Traceability matrix updated with Story 1.3 tasks and test
- [x] Test spec added for shared type exports

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S13-01` | `ARCH-004` | Create `packages/core/src/types/index.ts` with Story 1.3 pipeline handoff contract types | completed |
| `TASK-S13-02` | `ARCH-004` | Re-export shared types from `packages/core/src/index.ts` | completed |
| `TASK-S13-03` | `ARCH-004`, `ARCH-002` | Add a co-located type-surface compile test for exported contracts | completed |
| `TASK-S13-04` | `ARCH-004` | Verify `@leafletpdf/core` imports compile in the electron-app workspace | blocked by `BUG-002` for direct electron-app `tsc`; Forge Vite bundle step completed before packaging failure |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `TEST-002` | Shared contract types are exported from `@leafletpdf/core` and usable without local redefinition | passed after red/green cycle |
| `VERIFY-S13-01` | `@leafletpdf/core` TypeScript compile passes | passed |
| `VERIFY-S13-02` | Workspace TypeScript builds pass where build scripts exist | partial: `@leafletpdf/core` and `@leafletpdf/mcp-server` passed; `@leafletpdf/electron-app` packaging blocked by `BUG-002` |

## Final notes

- Implementation summary: Added Story 1.3 shared handoff contracts to `packages/core/src/types/index.ts` and re-exported them from `packages/core/src/index.ts`. Added compile-time coverage importing the public type surface from `@leafletpdf/core`. No local type redefinitions were found outside `core/src/types/index.ts`.
- Tests run: `npm run build --workspace=@leafletpdf/core` failed before implementation with missing exports, then passed after implementation; `npm run build --workspace=@leafletpdf/mcp-server` passed; `npm run build --workspaces --if-present` partially passed but is blocked by `BUG-002`.
- Open risks: `BUG-002` blocks workspace-level Electron package verification and direct electron-app `tsc`.
