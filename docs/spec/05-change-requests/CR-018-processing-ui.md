# CR-018 — Processing UI (Story 4.3, 4.4, 4.5)

## Summary

Implement the UI components for the active processing state, success, and error outcomes, and wire them up to the pipeline IPC endpoints.

## Change type

Feature — Frontend components and state machine logic for the rendering portion of the pipeline.

## Requirements addressed

- `UX-DR4`: ProcessingScreen shows stage label updating in real time, with retry counts.
- `UX-DR5`: ErrorScreen names the failed stage and cause explicitly, with "Start Over".
- `UX-DR6`: SuccessScreen shows save path, "Open File" button, and "Process Another".
- `FR-5`: Display active pipeline stage.
- `FR-6`: Naming failed stages.

## Design

- `App.tsx` will manage the overall pipeline state: `input` -> `processing` -> `success` | `error`.
- `InputScreen` uses `window.Leaflet PDF.pipeline.run` to trigger the pipeline and transitions to `ProcessingScreen`.
- `ProcessingScreen` listens to `onStageUpdate`, `onRetry`, `onComplete`, and `onError` using `useEffect` hooks.
- `ProcessingScreen` has a `StageProgress` component that displays the text mapping:
  - Extracting -> "Reading and extracting facts..."
  - Transforming -> "Structuring and formatting..."
  - Validating -> "Fidelity check in progress..."
  - Rendering -> "Generating PDF artifact..."
- Retry appends " (Retry attempt 2 of 3)" to the validation text.
- `SuccessScreen` takes the `filePath` and displays it, with an option to open the file (which can be done via Electron `shell.openPath` via a new IPC handler, or just show the path for now—wait, UX-DR6 says "Open File" button (system default PDF viewer), so we need a new IPC handler to open the path, or use native shell).
- `ErrorScreen` shows `stage` and `cause` and a Start Over button.

## Files affected

### New
- `packages/electron-app/src/renderer/ProcessingScreen/ProcessingScreen.tsx`
- `packages/electron-app/src/renderer/ProcessingScreen/ErrorScreen.tsx`
- `packages/electron-app/src/renderer/ProcessingScreen/SuccessScreen.tsx`

### Modified
- `packages/electron-app/src/renderer/App.tsx`
- `packages/electron-app/src/renderer/InputScreen/InputScreen.tsx`
- `packages/electron-app/src/main/ipc-bridge.ts` (add `shell.openPath` support)
- `packages/electron-app/src/preload.ts`
- `packages/electron-app/src/renderer/types/preload-api.ts`
- `packages/electron-app/src/renderer/types/ipc.ts`

## Implementation tasks

- [x] TASK-S43-01: Create CR-018 document
- [x] TASK-S43-02: Add `files.openExternal` to IPC boundary
- [x] TASK-S43-03: Implement `ProcessingScreen`, `ErrorScreen`, and `SuccessScreen`
- [x] TASK-S43-04: Wire `InputScreen` submit logic
- [x] TASK-S43-05: Update `App.tsx` to handle screen transitions based on pipeline state
- [x] TASK-S43-06: Update Traceability Matrix

## Verification

- Full workspace builds successfully.
- UI transitions smoothly between input, processing, and success/error states based on mock or stubbed pipeline runs.

## Status

`complete`
