# Known Issue: BUG-001 @ai-sdk/ollama Package Name Conflict

## Metadata

- Bug ID: `BUG-001`
- Status: blocking Story 2.2 decision
- Severity: low
- Found in: Story 1.2 (npm install)
- Fixed in: pending provider decision
- Related requirements: `INT-001` (Vercel AI SDK integration)
- Related tests: `TEST-022`

## Current behavior

`docs/ARCHITECTURE.md` §Decision 1 specifies `@ai-sdk/ollama` as the Vercel AI SDK adapter for Ollama. This package does not exist on npm (404 error). The correct package for Ollama integration with the Vercel AI SDK is `ollama-ai-provider@1.2.0`, maintained by the community.

## Expected behavior

The working spec layer should reference `ollama-ai-provider` instead of `@ai-sdk/ollama`. Story 2.2 (AI Client implementation) must use `ollama-ai-provider` when wiring the Ollama adapter.

## Unchanged behavior

- Ollama integration requirement is unchanged — the app must support Ollama as a provider
- `INT-001` acceptance criteria are unchanged
- The AI client interface (`aiClient.generateText()`) is unchanged; only the adapter import changes

## Reproduction steps

1. `npm install @ai-sdk/ollama` from any directory — returns 404 Not Found

## Root cause

The ARCHITECTURE.md was authored when `@ai-sdk/ollama` may have been planned or referenced under a different anticipated name. The actual published package for Ollama support in the Vercel AI SDK ecosystem is `ollama-ai-provider` (community provider).

## Mitigation applied

Story 1.2 installed `ollama-ai-provider@^1.2.0` in `packages/electron-app/package.json`. CR-004 normalized the working spec-layer references in the requirements registry and ADR-002. Story 2.2 compatibility investigation found that this package targets `@ai-sdk/provider` v1 and returns `LanguageModelV1`, while the installed `ai@6.0.208` expects `LanguageModelV2` or `LanguageModelV3`.

## Story 2.2 compatibility evidence

- `npm view @ai-sdk/ollama version` still returns 404.
- `npm view ollama-ai-provider version dependencies peerDependencies` reports `ollama-ai-provider@1.2.0` with `@ai-sdk/provider: ^1.0.0`.
- A core-local TypeScript compatibility probe failed on `generateText({ model: createOllama(...)('llama3.2'), prompt })` with: `Type 'LanguageModelV1' is not assignable to type 'LanguageModel'`.
- `npm search "ollama ai sdk provider" --json` shows currently published alternatives that claim AI SDK v6 support, including `ollama-ai-provider-v2@3.6.0` and `ai-sdk-ollama@3.8.8`.

## Regression acceptance criteria

| AC ID | Given | When | Then |
|---|---|---|---|
| `AC-BUG-001` | Ollama is configured as provider | `aiClient.generateText()` called | Call routes through `ollama-ai-provider` adapter successfully |

## Verification

- Test ID: `TEST-022` (AI client — Ollama provider path, Story 2.2)
- Result: blocked for Story 2.2 provider selection
- Notes: Upstream BMAD documents still preserve the original `@ai-sdk/ollama` reference as historical source input. The currently installed `ollama-ai-provider@1.2.0` is not compatible with `ai@6`; choose a compatible provider package before implementing the Ollama adapter.
