# CR-019 — Content Transformation (Epic 5)

## Summary

Implement the Technique Selector, Transformer, and Token Logger modules, along with their orchestration logic, to satisfy Epic 5 requirements.

## Change type

Feature

## Requirements addressed

- `FR-8`: Deterministic technique selection.
- `FR-9`: BLUF, teach-not-label, 60-second cheat sheet.
- `FR-10`: Mental buckets threshold.
- `FR-11`: Jargon translation.
- `FR-12`: Facts→implications.
- `FR-13`: AI Transformer does not add/invent/remove factual claims.
- `FR-14`: Technique audit record.
- `NFR-5`: Token usage is logged per-call to a `.jsonl` file.

## Design

- **Technique Selector** (`core/src/modules/technique-selector/technique-selector.ts`): Rule-based string parsing. No AI.
- **Transformer** (`core/src/modules/transformer/transformer.ts` & `prompts.ts`): Takes the Source Content, the techniques, and factual claims (stubbed for now, actually Epic 6 builds Claim Extractor, but Transformer signature requires it).
- **Token Logger** (`core/src/orchestrator/token-logger.ts`): Append-only logger using Node `fs`. It needs the user data path, which will be passed to `PipelineOrchestrator`'s constructor from the main process (`app.getPath('userData')`).

## Files affected

### New
- `packages/core/src/modules/technique-selector/rules.ts`
- `packages/core/src/modules/technique-selector/technique-selector.ts`
- `packages/core/src/modules/technique-selector/technique-selector.test.ts`
- `packages/core/src/modules/transformer/prompts.ts`
- `packages/core/src/modules/transformer/transformer.ts`
- `packages/core/src/modules/transformer/transformer.test.ts`
- `packages/core/src/orchestrator/token-logger.ts`
- `packages/core/src/orchestrator/token-logger.test.ts`

### Modified
- `packages/core/src/orchestrator/pipeline-orchestrator.ts`
- `packages/electron-app/src/main/index.ts`
- `docs/spec/06-traceability/traceability-matrix.md`

## Implementation tasks

- [x] TASK-S51-01: Implement `Technique Selector`
- [x] TASK-S52-01: Implement `Transformer`
- [x] TASK-S53-01: Implement `Token Logger` and update `PipelineOrchestrator`
- [x] TASK-S53-02: Update Traceability Matrix

## Status

`complete`
