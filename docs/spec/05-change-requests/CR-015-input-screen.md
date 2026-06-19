# CR-015 — InputScreen UI (Story 3.5)

## Summary

Implement the InputScreen React UI and wire the `OPEN_FILE` IPC channel for native file picking. The screen presents three input methods (Paste Text, Import File, YouTube URL), an optional title field, and a style selector (Orbital Light vs. Orbital Night).

## Change type

Feature — builds out the UI layer for the core Intake module completed in Stories 3.1–3.4.

## Requirements addressed

- `UX-DR1`: InputScreen presents three mutually exclusive input modes.
- `UX-DR2`: StyleSelector shows Orbital Light and Orbital Night.
- `UX-DR3`: Submit button disabled until valid input is present.
- `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-020`: Covered via UI presentation.

## Design

### Components (`electron-app/src/renderer/InputScreen/`)
- **`InputScreen`**: Manages state for the active tab, the current input data (`SourceContent` partial or raw text/URL/file path), the optional title, and the selected style.
- **`TextInput`**: Renders a textarea. Uses `processTextInput` from `@bookit/core` to validate on blur or submit.
- **`FileInput`**: Renders an "Import File" button. Calls `window.electron.openFile()` which triggers the IPC handler.
- **`UrlInput`**: Renders a URL input field. Uses `processYouTubeInput` on blur or submit.
- **`StyleSelector`**: Renders a toggle between Orbital Light and Orbital Night.

### IPC Wiring
- `main/ipc-bridge.ts`: Handle `OPEN_FILE` using `dialog.showOpenDialog` restricting to `.md` and `.txt`. Calls `processFileInput` from core. Returns `Result<SourceContent | null>` (null if user cancelled dialog).

## Files affected

### Modified
- `packages/electron-app/src/main/ipc-bridge.ts` — implement `OPEN_FILE`
- `packages/electron-app/src/preload.ts` — expose `openFile`
- `packages/electron-app/src/renderer/types/preload-api.ts` — type `openFile`
- `packages/electron-app/src/renderer/App.tsx` — route to InputScreen when setup is complete

### New
- `packages/electron-app/src/renderer/InputScreen/InputScreen.tsx`
- `packages/electron-app/src/renderer/InputScreen/TextInput.tsx`
- `packages/electron-app/src/renderer/InputScreen/FileInput.tsx`
- `packages/electron-app/src/renderer/InputScreen/UrlInput.tsx`
- `packages/electron-app/src/renderer/InputScreen/StyleSelector.tsx`

## Implementation tasks

- [x] TASK-S35-01: Create CR-015 document
- [x] TASK-S35-02: Implement `OPEN_FILE` IPC handler and preload API
- [x] TASK-S35-03: Create sub-components (`TextInput`, `FileInput`, `UrlInput`, `StyleSelector`)
- [x] TASK-S35-04: Create `InputScreen` and integrate sub-components
- [x] TASK-S35-05: Update `App.tsx` to render `InputScreen`
- [x] TASK-S35-06: Verify UI behavior (disabled state, tab switching, file picking)
- [x] TASK-S35-07: Update traceability matrix

## Verification

- File picker successfully returns `Result<SourceContent>` via IPC
- UI tab switching clears prior state
- Submit button is disabled when input is invalid or missing

## Status

`complete`
