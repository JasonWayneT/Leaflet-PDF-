# TEST-006 AI Client

## Requirement links

- `INT-001`
- `ARCH-001`
- `ARCH-002`

## Purpose

Prove that Story 2.2 routes AI generation through the selected provider adapter, returns normalized text and token usage, and wraps provider failures as `Result<never>`.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-006-A` | `INT-001` | Anthropic provider config routes through Anthropic adapter | `ai-client.test.ts` compiles with fake provider factories |
| `TEST-006-B` | `INT-001` | Google provider config routes through Google adapter | `ai-client.test.ts` compiles with fake provider factories |
| `TEST-006-C` | `INT-001` | Ollama provider config routes through `ollama-ai-provider-v2` adapter | `ai-client.test.ts` compiles with fake provider factories |
| `TEST-006-D` | `ARCH-002` | Generator failure returns `Result<never>` with `PipelineError` | `ai-client.test.ts` compiles with fake rejecting generator |
| `TEST-006-E` | `ARCH-001` | AI client lives in `core` and imports no Electron APIs | Source grep |

## Commands

```powershell
npm run build --workspace=@leafletpdf/core
npm run build --workspaces --if-present
rg -n "from 'electron'|from \"electron\"" packages\core
```

## Current result

- Status: passed
- Last run: 2026-06-19
