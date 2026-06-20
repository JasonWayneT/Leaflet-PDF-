# CR-012 — File Import Module (Story 3.2)

## Summary

Extend `packages/core/src/modules/intake/intake.ts` with `processFileInput(filePath: string): Result<SourceContent>`. Validates the file extension (.md/.txt only), reads file content via Node's `fs.readFileSync`, rejects empty files, and wraps valid content as `SourceContent` with `inputType: 'file'`.

## Change type

Feature — extends existing core module

## Requirements addressed

- `FR-002`: User can import a .md or .txt file as Source Content
- `AC-004`: Valid file (.md/.txt) → SourceContent with `inputType: 'file'`; filename in UI (deferred to Story 3.5)
- `AC-005`: Unsupported extension → `Result<never>` cause "Only .md and .txt files are supported"
- `AC-006`: Empty file → `Result<never>` cause "File is empty"
- `ARCH-002`: Returns `Result<T>` — no raw throws across boundary
- `ARCH-004`: `SourceContent` imported from types, never redefined locally
- `ARCH-006`: Tests co-located with source

## Rationale

`processFileInput` belongs in `core` because it has no Electron dependency — it uses Node.js `fs` and `path` built-ins. The IPC trigger (native file dialog → main process → `processFileInput`) is wired in Story 3.5. This story delivers and verifies the pure logic.

## Design

```
processFileInput(filePath: string): Result<SourceContent>
  1. path.extname(filePath).toLowerCase() → must be '.md' or '.txt' (AC-005)
  2. fs.readFileSync(filePath, 'utf-8') → wrapped in try/catch → Result<never> on read error
  3. content.trim().length === 0 → reject "File is empty" (AC-006)
  4. content.length > SOURCE_CONTENT_CHAR_LIMIT → reject oversized (reuses NFR-004 cap)
  5. Return { ok: true, value: { text: content, inputType: 'file' } }
```

## Files affected

### Modified

- `packages/core/src/modules/intake/intake.ts` — add `processFileInput` function
- `packages/core/src/modules/intake/intake.test.ts` — add test cases: .md, .txt, unsupported ext, empty file
- `packages/core/src/index.ts` — export `processFileInput`

## Implementation tasks

- [x] TASK-S32-01: Create CR-012 document
- [x] TASK-S32-02: Add `processFileInput` to `intake.ts`
- [x] TASK-S32-03: Extend `intake.test.ts` with file import scenarios
- [x] TASK-S32-04: Export `processFileInput` from `@leafletpdf/core`
- [x] TASK-S32-05: Verify `tsc --noEmit` and full workspace build pass
- [x] TASK-S32-06: Update traceability matrix

## Verification

- `npx tsc --noEmit --project packages\core\tsconfig.json` ✅ passes
- `npm run build --workspaces --if-present` ✅ passes
- Source grep confirms `packages/core` has no `electron` import ✅
- `SourceContent` imported from `../../types/index`, not redefined locally ✅
- `processFileInput` uses only Node.js `fs` and `path` built-ins ✅

## Status

`complete`
