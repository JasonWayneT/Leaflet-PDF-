# TEST-002 Shared Type Contracts

## Requirement links

- `ARCH-004`
- `ARCH-002`

## Purpose

Prove that Story 1.3 shared handoff contracts are exported from `@leafletpdf/core` and can be used by downstream packages without redefining types locally.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-002-A` | `ARCH-004` | Import all Story 1.3 pipeline handoff types from `@leafletpdf/core` | `packages/core/src/types/index.test.ts` compiles under `tsc --noEmit` |
| `TEST-002-B` | `ARCH-002` | Construct success and failure `Result<T>` values with shared `PipelineError` | `packages/core/src/types/index.test.ts` compiles under `tsc --noEmit` |
| `TEST-002-C` | `ARCH-004` | Confirm technique, section, stage, and style literal unions accept canonical values | `packages/core/src/types/index.test.ts` compiles under `tsc --noEmit` |

## Commands

```powershell
npm run build --workspace=@leafletpdf/core
npm run build --workspaces --if-present
```

## Current result

- Status: passed for `@leafletpdf/core`; workspace-level Electron verification blocked by `BUG-002`
- Last run: 2026-06-19
