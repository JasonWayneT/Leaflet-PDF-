# CR-016 — Pipeline Orchestrator (Story 4.1)

## Summary

Implement the stateless Pipeline Orchestrator that sequences all pipeline modules (`deriveTitle`, `extractClaims`, `selectTechniques`, `transform`, `validate`, `render`), manages the validation retry loop, and emits typed events via Node `EventEmitter`.

## Change type

Feature — orchestration layer connecting the intake module to the downstream processing modules.

## Requirements addressed

- `FR-005`: Emits stage updates (Extracting, Transforming, Validating, Rendering)
- `FR-006`: Emits stage failures with named stages and causes
- `FR-007`: Pipeline only writes to disk (via renderer) when all stages complete
- `FR-017`, `FR-018`: Orchestrator handles validation retry loop (max 3 total attempts)

## Design

### Orchestrator Module (`core/src/orchestrator/pipeline-orchestrator.ts`)
- Uses Node's `EventEmitter` (no Electron deps).
- Input: `PipelineInput` containing `SourceContent`, `styleSelection`, and AI `providerConfig`.
- Emits:
  - `pipeline:stage-update` -> `{ stage: StageName }`
  - `pipeline:retry` -> `{ attempt: number, max: number }`
  - `pipeline:complete` -> `{ pdfBuffer: Buffer, title: string }`
  - `pipeline:error` -> `{ stage: StageName, cause: string }`
- Since downstream modules (Extractor, Transformer, Validator, Renderer) aren't implemented yet, it imports them from stub files created in this story. The stubs return `Result<T>` or `Promise<Result<T>>` with dummy data or `Not Implemented` errors.
- Retry logic: If `validate` fails, loop back to `transform` (using the same technique list). Abort after 3 total transformation attempts.

### Stubs to create
- `core/src/modules/claim-extractor/claim-extractor.ts`: `extractClaims`
- `core/src/modules/technique-selector/technique-selector.ts`: `selectTechniques`
- `core/src/modules/transformer/transformer.ts`: `transform`
- `core/src/modules/validator/validator.ts`: `validate`
- `core/src/modules/renderer/renderer.ts`: `render`

## Files affected

### New
- `packages/core/src/orchestrator/pipeline-orchestrator.ts`
- `packages/core/src/orchestrator/pipeline-orchestrator.test.ts`
- Module stubs:
  - `packages/core/src/modules/claim-extractor/claim-extractor.ts`
  - `packages/core/src/modules/technique-selector/technique-selector.ts`
  - `packages/core/src/modules/transformer/transformer.ts`
  - `packages/core/src/modules/validator/validator.ts`
  - `packages/core/src/modules/renderer/renderer.ts`

### Modified
- `packages/core/src/index.ts` (export orchestrator and stubs)

## Implementation tasks

- [x] TASK-S41-01: Create CR-016 document
- [x] TASK-S41-02: Create typed stubs for downstream modules
- [x] TASK-S41-03: Implement `PipelineOrchestrator` class/functions and EventEmitter
- [x] TASK-S41-04: Implement Orchestrator tests (mocking stubs to simulate success/retry/failure)
- [x] TASK-S41-05: Update traceability matrix

## Verification

- Orchestrator tests pass (happy path, 1 retry, 3 failures, module throw)
- Full workspace compiles without errors

## Status

`complete`
