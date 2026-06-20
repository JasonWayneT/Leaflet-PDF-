# CR-014 — Document Title Derivation (Story 3.4)

## Summary

Extend `packages/core/src/modules/intake/intake.ts` with `deriveTitle`, a function that generates a short, descriptive title from the first 500 characters of the input text using the AI client.

## Change type

Feature — extends existing core module with an AI-driven title generation function.

## Requirements addressed

- `FR-001` / `FR-002` / `FR-003`: Provides the derived title metadata for SourceContent processing (orchestration happens later).
- `ARCH-002`: Uses `Result<T>` pattern for boundary crossings — no raw throws.
- `ARCH-006`: Type-level tests co-located with source.

## Design

### deriveTitle(text: string, aiConfig: ProviderConfig): Promise<Result<string>>
- Takes the first 500 characters of the input text to save context window and latency.
- Uses `aiClient.generateText` from `@leafletpdf/core` with a prompt asking for a short title (max 60 chars) without quotes.
- Returns `Result<string>`. Any AI client error is propagated as a `Result<never>` using the standard pipeline error shape.
- Caller is responsible for bypassing this if a title is user-provided.
- Token usage recording is deferred to the pipeline orchestrator story.

## Files affected

### Modified

- `packages/core/src/modules/intake/intake.ts` — add `deriveTitle` and necessary imports
- `packages/core/src/modules/intake/intake.test.ts` — add `deriveTitle` type tests
- `packages/core/src/index.ts` — export `deriveTitle`

## Implementation tasks

- [x] TASK-S34-01: Create CR-014 document
- [x] TASK-S34-02: Implement `deriveTitle` in `intake.ts`
- [x] TASK-S34-03: Add `deriveTitle` type tests to `intake.test.ts`
- [x] TASK-S34-04: Export `deriveTitle` from `index.ts`
- [x] TASK-S34-05: Verify `tsc --noEmit` and full workspace build pass
- [x] TASK-S34-06: Update traceability matrix

## Verification

- `npx tsc --noEmit --project packages\core\tsconfig.json` ✅ passes
- `npm run build --workspaces --if-present` ✅ passes

## Status

`complete`
