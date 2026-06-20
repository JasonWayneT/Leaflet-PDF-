# Change Request: CR-008 AI Client

## Metadata

- Change request ID: `CR-008`
- Type: feature
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Implement Story 2.2 by adding a shared AI client in `packages/core/src/services/ai-client/` that routes text generation through Anthropic, Google, or Ollama provider adapters and returns `Result<T>` errors instead of throwing across module boundaries.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: medium

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `INT-001` | implements | Routes all AI calls through Vercel AI SDK provider adapters |
| `ARCH-001` | supports | AI client lives in `core` with no Electron imports |
| `ARCH-002` | implements | Provider errors are wrapped as `Result<never>` |

## Documentation updates required before code

- [x] Change request created
- [x] Traceability matrix updated
- [x] Test spec added
- [x] `BUG-001` resolved with `ollama-ai-provider-v2`

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S22-01` | `INT-001` | Add provider config and AI client response types | completed |
| `TASK-S22-02` | `INT-001` | Add Anthropic, Google, and Ollama provider adapters | completed |
| `TASK-S22-03` | `INT-001`, `ARCH-002` | Add `aiClient.generateText()` with injectable generator and `Result<T>` error handling | completed |
| `TASK-S22-04` | `ARCH-001` | Verify `core` imports no Electron APIs and all provider packages compile from `core` | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `TEST-006` | AI client provider routing and error wrapping compile | passed |
| `VERIFY-S22-01` | `npm run build --workspace=@leafletpdf/core` passes | passed |
| `VERIFY-S22-02` | `npm run build --workspaces --if-present` passes | passed |
| `VERIFY-S22-03` | Source grep confirms no Electron imports in `packages/core` | passed |

## Final notes

- Implementation summary: Added a shared AI client in `packages/core/src/services/ai-client/` with typed provider config, normalized text/token usage response, injectable generation dependency for tests, and Anthropic/Google/Ollama provider adapters. Ollama uses `ollama-ai-provider-v2@3.6.0`.
- Tests run: `npm run build --workspace=@leafletpdf/core` failed before implementation with missing AI client modules, then passed; `npm run build --workspaces --if-present` passed; `npm ls ollama-ai-provider-v2 --workspace=@leafletpdf/core` confirmed the selected provider; `npm ls ollama-ai-provider --workspaces --if-present` returned empty; `rg -n "electron" packages\core` returned no matches; `npm audit --omit=dev --json` reported zero runtime vulnerabilities.
- Open risks: Runtime calls are covered through compile-time injectable tests until a runtime test runner is added and provider API keys/base URLs are configured.
