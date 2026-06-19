# Feature Spec: FEAT-002 — Processing Pipeline

## Metadata

- **Feature ID:** `FEAT-002`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.2, `BMAD-SRC-003` §Decision 2, `BMAD-SRC-006` Epic 4
- **Related requirements:** `FR-005`, `FR-006`, `FR-007`, `FR-017`, `ARCH-001`, `ARCH-002`, `ARCH-003`, `ARCH-005`

## Problem statement

After submission, the user must be able to see what the app is doing at all times. If processing fails, they need to know exactly which stage failed and why — not a generic error. The pipeline itself must be fully decoupled from the UI and Electron so it can run identically in a future MCP server host.

## Goals

- `GOAL-001`: Real-time stage visibility throughout processing — no silent processing
- `GOAL-002`: Stage-level error attribution — always name the failed stage and cause
- `GOAL-003`: No partial output ever — PDF only on full pipeline success
- `GOAL-004`: Pipeline fully decoupled from Electron (runs in `core`, bridges via EventEmitter → IPC)

## Non-goals

- `NG-001`: Pause/resume pipeline — not in scope for v2
- `NG-002`: Background processing while user does other things — single active pipeline per session

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-4.1` | P0 | As a developer, I want a stateless Pipeline Orchestrator in `core` that sequences modules and owns retry logic | `FR-005–007`, `FR-017`, `ARCH-001–005` |
| `STORY-4.2` | P0 | As a developer, I want the IPC bridge to subscribe to Orchestrator events and forward them to the renderer | `ARCH-003`, `ARCH-005` |
| `STORY-4.3` | P0 | As Jason, I want to see the active pipeline stage update in real time while content is being processed | `FR-005` |
| `STORY-4.4` | P0 | As Jason, I want to see exactly which stage failed and why if processing fails | `FR-006`, `FR-007` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-005` | Real-time stage display |
| `FR-006` | Stage-level failure reporting |
| `FR-007` | No partial output on failure |
| `FR-017` | Automatic retry with stage display update |
| `ARCH-001` | Monorepo — Orchestrator lives in `core` |
| `ARCH-002` | All modules return `Result<T>` |
| `ARCH-003` | IPC boundary: `ipc-bridge.ts` only |
| `ARCH-005` | EventEmitter abstraction |

## Acceptance criteria

See `02-requirements-registry.md` AC-012 through AC-018.

## Edge cases

- `AC-015`: Pipeline halts immediately on any stage failure — subsequent stages do not run
- `AC-017`: No PDF written if any stage errors
- `AC-018`: If app closed mid-pipeline, no partial output persists
- Retry display: "Retrying transformation — attempt 2 of 3" / "attempt 3 of 3" shown during retry cycles

## UX and design notes

- Linked UX requirements: `UX-DR4` (ProcessingScreen, stage label, retry label), `UX-DR5` (ErrorScreen, stage name, cause, Start Over)
- Stage sequence displayed: Extracting → Transforming → Validating → Rendering
- Error messages are direct — no apologetic language (`AC-016`)
- "Start Over" button returns user to InputScreen, clears all state

## Technical notes

- **Orchestrator:** `packages/core/src/orchestrator/pipeline-orchestrator.ts`
- **IPC bridge:** `packages/electron-app/src/main/ipc-bridge.ts` (ONLY file that imports `ipcMain`)
- **Events emitted (Node EventEmitter):**
  - `pipeline:stage-update` → `{ stage: StageName }`
  - `pipeline:retry` → `{ attempt: number; max: number }`
  - `pipeline:complete` → `{ pdfBuffer: Buffer; title: string }`
  - `pipeline:error` → `{ stage: StageName; cause: string }`
- **Renderer subscription:** `use-pipeline.ts` hook subscribes via `ipcRenderer.on()`
- `core` never imports from Electron; IPC bridge subscribes to EventEmitter and bridges to Electron IPC
- Module execution sequence: `deriveTitle` → `extractClaims` → `selectTechniques` → `transform` → `validate` → (retry loop) → `render`

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-006` | `FR-005–007`, `FR-017`, `ARCH-002` | `pipeline-orchestrator.ts`: sequence, retry loop, EventEmitter events | todo |
| `TASK-007` | `ARCH-003`, `ARCH-005` | `ipc-bridge.ts`: subscribe to EventEmitter, forward to renderer IPC | todo |
| `TASK-008` | `FR-005` | `ProcessingScreen.tsx` + `StageProgress.tsx`: real-time stage display + retry label | todo |
| `TASK-009` | `FR-006`, `FR-007` | `ErrorScreen.tsx`: stage name, cause, Start Over button | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-006` | `FR-005–007`, `AC-012–018` | unit | Orchestrator: happy path, fidelity fail→retry→success, 3 failures→halt |
| `TEST-007` | `FR-006`, `AC-014` | unit | Orchestrator emits correct stage name on each module failure |
| `TEST-008` | `FR-017`, `AC-039–041` | unit | Orchestrator retries with original SourceContent; caps at 3 attempts |

## Open questions

None.
