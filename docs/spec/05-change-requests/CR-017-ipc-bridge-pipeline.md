# CR-017 — IPC Bridge for Pipeline (Story 4.2)

## Summary

Update the IPC bridge to instantiate the `PipelineOrchestrator` and forward its events to the renderer, and expose a typed API over the preload script to run the pipeline and subscribe to events.

## Change type

Feature — Electron IPC boundary.

## Requirements addressed

- `FR-005`, `FR-006`, `FR-007`: Allows renderer to trigger and monitor pipeline progress.
- `INT-005`: Save file dialogue is integrated when pipeline completes.

## Design

- Modified `registerIpcBridge` to accept `PipelineOrchestrator` and `webContents`.
- Instantiated `PipelineOrchestrator` in `main/index.ts` and passed it down.
- Added `pipeline:run` handle that accepts `PipelineInput` and calls `orchestrator.runPipeline`.
- Hooked up `pipeline:stage-update`, `pipeline:retry`, `pipeline:complete`, and `pipeline:error` to `webContents.send`.
- On `pipeline:complete`, trigger `dialog.showSaveDialog`, save the PDF buffer directly via Node `fs`, and then send the completed filepath to the renderer so it can display the success UI.
- Updated `preload.ts` and `preload-api.ts` to expose `window.Leaflet PDF.pipeline.run`, `onStageUpdate`, `onRetry`, `onError`, and `onComplete`.

## Files affected

### Modified
- `packages/electron-app/src/main/index.ts`
- `packages/electron-app/src/main/ipc-bridge.ts`
- `packages/electron-app/src/preload.ts`
- `packages/electron-app/src/renderer/types/ipc.ts`
- `packages/electron-app/src/renderer/types/preload-api.ts`

## Implementation tasks

- [x] TASK-S42-01: Create CR-017 document
- [x] TASK-S42-02: Add PIPELINE_* channels to `ipc.ts`
- [x] TASK-S42-03: Add `pipeline` API to `preload-api.ts`
- [x] TASK-S42-04: Implement `pipeline` API in `preload.ts`
- [x] TASK-S42-05: Modify `registerIpcBridge` to take orchestrator and webContents
- [x] TASK-S42-06: Wire Orchestrator events to `webContents.send`
- [x] TASK-S42-07: Implement native save dialog on `pipeline:complete`
- [x] TASK-S42-08: Instantiate Orchestrator in `main/index.ts`
- [x] TASK-S42-09: Update traceability matrix

## Verification

- Full workspace builds successfully.
- Events map correctly through type boundaries.

## Status

`complete`
