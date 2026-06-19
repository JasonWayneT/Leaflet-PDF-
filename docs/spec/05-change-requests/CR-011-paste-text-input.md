# CR-011 — Paste Text Input Module (Story 3.1)

## Summary

Implement `processTextInput()` in `packages/core/src/modules/intake/intake.ts`. This is the first Content Intake module — it validates raw pasted text against the 100,000-character cap and empty-input rule, then wraps the result as `SourceContent`.

## Change type

Feature — new core module

## Requirements addressed

- `FR-001`: User can paste raw text (up to 100,000 chars) as Source Content and submit for processing
- `NFR-004`: Input capped at 100,000 characters; empty inputs rejected before processing
- `AC-001`: Valid paste — text stored as SourceContent with `inputType: 'paste'`
- `AC-002`: Empty paste — rejected with `Result<never>` (cause: "Content required")
- `AC-003`: Oversized paste — rejected with `Result<never>` (cause includes character count)
- `ARCH-002`: Module returns `Result<T>` — no raw throws across boundary
- `ARCH-004`: `SourceContent` type imported from `@bookit/core/types`, never redefined locally
- `ARCH-006`: Test co-located with source (`intake.ts` / `intake.test.ts`)

## Rationale

This is the first implementation in Epic 3. `intake.ts` will grow to cover FR-002 (file), FR-003 (YouTube), and FR-004 (title derivation) in subsequent stories. Story 3.1 establishes the module file and exports.

## Files affected

### New

- `packages/core/src/modules/intake/intake.ts` — exports `processTextInput()`
- `packages/core/src/modules/intake/intake.test.ts` — compile-time tests for all three input scenarios

### Modified

- `packages/core/src/index.ts` — re-exports `processTextInput` and `SOURCE_CONTENT_CHAR_LIMIT`

## Constants

- `SOURCE_CONTENT_CHAR_LIMIT = 100_000` defined as named constant in `intake.ts` (NFR-004)

## Implementation tasks

- [x] TASK-S31-01: Create CR-011 document
- [x] TASK-S31-02: Create `packages/core/src/modules/intake/intake.ts` with `processTextInput`
- [x] TASK-S31-03: Create co-located `intake.test.ts` covering valid, empty, oversized inputs
- [x] TASK-S31-04: Export `processTextInput` and `SOURCE_CONTENT_CHAR_LIMIT` from `@bookit/core`
- [x] TASK-S31-05: Verify `tsc --noEmit` and full workspace build pass
- [x] TASK-S31-06: Update traceability matrix

## Verification

- `npx tsc --noEmit --project packages\core\tsconfig.json` ✅ passes
- `npm run build --workspaces --if-present` ✅ passes (full package builds)
- Source grep confirms `packages/core` has no `electron` imports ✅
- `SourceContent` imported from `../../types/index`, not redefined locally ✅
- `SOURCE_CONTENT_CHAR_LIMIT = 100_000` exported as named constant ✅

## Status

`complete`
