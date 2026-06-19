# ADR-002 — Two Model Slots + Vercel AI SDK

## Status

accepted

## Context

The pipeline makes AI calls at three points: claim extraction, transformation, and validation. These calls have different quality/cost profiles — transformation is quality-critical; extraction and validation are mechanical. Bookit is also BYOA (bring your own API), which means the provider must be swappable at runtime. The choice of SDK determines how the provider swap is implemented.

## Decision

Two model slots with Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/google` + `ollama-ai-provider-v2`):
- **Transformation slot** (default: `claude-sonnet-4-6`) — quality-critical restructuring
- **Validation/Utility slot** (default: `claude-haiku-4-5`) — claim extraction, validation, title derivation

Provider is swapped at runtime from user config. All AI calls use the unified `generateText()` interface — no provider-specific code in pipeline modules.

## Requirement links

- `INT-001`
- `ARCH-002`
- `SEC-001`

## Consequences

### Positive

- Single interface (`generateText()`) across all providers — pipeline modules are provider-agnostic
- Provider swap = config change only; no module code changes
- Two slots allow quality/cost optimization — expensive model for transformation only
- Ollama adapter enables fully local operation (zero API cost)

### Negative

- Vercel AI SDK is an additional dependency (not Anthropic SDK directly); adds ~1 abstraction layer
- Ollama models increase fidelity retry rate — documented and surfaced in Settings

### Neutral

- Token usage is returned by `generateText()` and logged per call by the Orchestrator

## Alternatives considered

| Option | Why rejected |
|---|---|
| Anthropic SDK directly | Ties pipeline to one provider; BYOA requires provider abstraction |
| Single model slot | Wastes cost using quality model for mechanical tasks (extraction, validation) |
| LangChain | Heavier dependency, more abstraction than needed for this use case |
