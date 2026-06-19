# Known Issue: BUG-001 @ai-sdk/ollama Package Name Conflict

## Metadata

- Bug ID: `BUG-001`
- Status: mitigated
- Severity: low
- Found in: Story 1.2 (npm install)
- Fixed in: `CR-004` (working spec layer and installed dependency); adapter behavior remains pending Story 2.2 verification
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

Story 1.2 installed `ollama-ai-provider@^1.2.0` in `packages/electron-app/package.json`. CR-004 normalized the working spec-layer references in the requirements registry and ADR-002. Story 2.2 (AI Client) must import from `ollama-ai-provider` and verify the adapter interface is compatible.

## Regression acceptance criteria

| AC ID | Given | When | Then |
|---|---|---|---|
| `AC-BUG-001` | Ollama is configured as provider | `aiClient.generateText()` called | Call routes through `ollama-ai-provider` adapter successfully |

## Verification

- Test ID: `TEST-022` (AI client — Ollama provider path, Story 2.2)
- Result: package-name mismatch mitigated; adapter behavior not run (Story 2.2 pending)
- Notes: Upstream BMAD documents still preserve the original `@ai-sdk/ollama` reference as historical source input. Follow the corrected working spec layer and verify `ollama-ai-provider` API compatibility before implementing Story 2.2.
