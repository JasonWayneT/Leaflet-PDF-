# CR-020: Source Fidelity Validation (Epic 6)

## Background

Epic 6 introduces the Source Fidelity Validation phase. Every Factual Claim from the Source Content is extracted before Transformation begins using the AI validation slot. After each Transformation attempt, the Validator checks every extracted claim against the Transformed Content. If validation fails, the Orchestrator retries the transformation up to 3 times.

## Affected Requirements

- `FR-015`: Factual Claims extracted before Transformation
- `FR-016`: After each Transformation attempt, Factual Claims are checked
- `FR-017`: On validation failure, auto-retry Transformation up to 3 attempts
- `FR-018`: After 3 failed attempts, pipeline halts
- `AC-035`–`AC-043`: Acceptance Criteria for Validation

## Implementation tasks

- [x] TASK-S61-01: Implement `Claim Extractor` module and AI prompts
- [x] TASK-S62-01: Implement `Validator` module and AI prompts
- [x] TASK-S62-02: Update Traceability Matrix with Epic 6 stories

## Status

`complete`
