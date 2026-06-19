# Feature Spec: FEAT-006 — Output Delivery

## Metadata

- **Feature ID:** `FEAT-006`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.6, `BMAD-SRC-006` Epic 8
- **Related requirements:** `FR-007`, `FR-022`, `FR-023`, `FR-024`, `NFR-007`, `INT-005`

## Problem statement

After a successful pipeline, the user needs to choose where the PDF lands and receive confirmation it was saved. The file must only be written after explicit user confirmation. The output must be immediately openable from the app.

## Goals

- `GOAL-001`: User controls save location via native Windows dialog
- `GOAL-002`: PDF is never written without explicit confirmation
- `GOAL-003`: User receives clear confirmation with save path and one-click open

## Non-goals

- `NG-001`: Auto-save to a fixed location — user must always confirm
- `NG-002`: Document history or previously-saved artifact management

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-8.1` | P0 | As Jason, I want a native Windows save dialog and clear confirmation when the PDF is saved | `FR-023`, `FR-024`, `NFR-007`, `INT-005` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-007` | PDF only written on full pipeline success |
| `FR-022` | PDF filename derived from document title |
| `FR-023` | Native Windows save dialog; file written only after confirm |
| `FR-024` | Save confirmation with path; Open File button |
| `NFR-007` | Opens in system default PDF viewer |
| `INT-005` | `dialog.showSaveDialog` + `shell.openPath` |

## Acceptance criteria

See `02-requirements-registry.md` AC-053 through AC-057.

## Edge cases

- `AC-055`: User cancels dialog → no file written; pipeline result (PDF buffer) remains in memory for session; option to retry save dialog
- `AC-053`: Default filename derived from document title (sanitized for filesystem)
- Default save path: last-used save directory (persisted in settings-store), fallback to user's Documents folder

## UX and design notes

- Linked UX requirements: `UX-DR6` (SuccessScreen: "Reading Artifact Saved" heading, save path, "Open File" button, "Process Another" button)
- "Process Another" returns to InputScreen, clears all state
- `AC-057`: "Open File" calls `shell.openPath(savedPath)` — opens in system default PDF viewer
- SuccessScreen wording: "Reading Artifact Saved" (not "Done" or "Complete")

## Technical notes

- `dialog.showSaveDialog` called from Electron main process, triggered by `pipeline:complete` event in `ipc-bridge.ts`
- File write: `fs.writeFileSync(confirmedPath, pdfBuffer)`
- Last-used save directory persisted via `settings-store.ts`
- `shell.openPath` called from main process via IPC handler

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-018` | `FR-023`, `INT-005` | `ipc-bridge.ts`: on `pipeline:complete`, call `dialog.showSaveDialog`, write file, persist last-used path | todo |
| `TASK-019` | `FR-024`, `NFR-007` | `SuccessScreen.tsx`: save path display, Open File button, Process Another button | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-019` | `FR-023`, `AC-053–055` | unit | save dialog: confirm → file written; cancel → no file written |
| `TEST-020` | `FR-024`, `AC-056–057` | manual | SuccessScreen: path shown, Open File opens PDF in default viewer |

## Open questions

None.
