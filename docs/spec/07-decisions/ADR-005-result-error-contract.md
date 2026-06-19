# ADR-005 — Result<T> Error Contract Across Module Boundaries

## Status

accepted

## Context

The pipeline has 5 modules in sequence. If any module throws an unhandled exception, the Orchestrator loses stage attribution — it can't know which stage failed. FR-006 requires stage-level error reporting. The error contract must be structural, not aspirational.

## Decision

Every module function returns `Result<T>`:

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: PipelineError }
type PipelineError = { stage: StageName; cause: string; retryable: boolean }
```

Exceptions thrown inside a module are caught internally and wrapped as `Result<never>` before returning. Nothing propagates as an unhandled exception across module boundaries. The Orchestrator checks `result.ok` after every call.

## Requirement links

- `ARCH-002`
- `FR-006`
- `FR-007`

## Consequences

### Positive

- Stage attribution is structurally enforced — error type carries `stage` identity
- FR-006 (stage-level error reporting) is mechanically guaranteed, not aspirational
- Orchestrator retry logic is clean — check `result.ok`, not try/catch
- Modules are independently testable — test the `Result` shape, not exception handling

### Negative

- Every function signature must return `Result<T>` — more verbose than simple throws
- Internal module errors still need try/catch blocks to wrap exceptions

### Neutral

- `retryable: boolean` on `PipelineError` lets the Orchestrator decide retry behavior without inspecting error strings

## Alternatives considered

| Option | Why rejected |
|---|---|
| Try/catch in Orchestrator | Doesn't give stage attribution — Orchestrator can't know which module threw |
| Custom exception classes with stage property | Throw/catch still needs wrapping at boundaries; Result<T> is cleaner for a pipeline |
| Unhandled — let Electron crash handler catch | Gives no stage attribution; violates FR-006 |
