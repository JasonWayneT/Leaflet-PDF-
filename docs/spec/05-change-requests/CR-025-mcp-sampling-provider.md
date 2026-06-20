# Change Request: CR-003 MCP Sampling Provider

## Metadata

- Change request ID: `CR-003`
- Type: architecture
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Add MCP sampling as a zero-key inference mode for the MCP server. When the user has no API key configured and no Ollama URL set, the server delegates all AI calls to the MCP host (Claude Desktop, Cursor, or any sampling-capable host) rather than erroring. Users with a Claude Desktop or Cursor subscription can run the full Leaflet PDF pipeline without a separate API key or additional cost.

## Motivation

The MCP server previously required an Anthropic, Google, or Ollama API key to function. This created friction for users who already have a Claude Desktop or Cursor subscription — they needed a second billing relationship just to use Leaflet PDF via MCP. MCP Sampling solves this: the MCP server sends inference requests back to the host, which fulfills them using the user's existing session.

This also makes Leaflet PDF more portable — it works correctly in any MCP host that supports sampling, regardless of which AI provider the user prefers.

## Classification

- User-visible behavior change: yes (zero-key setup now works)
- Requires new requirement ID: yes — `MCP-FR-007`
- Requires design update: no
- Requires tests: no (runtime behavior — sampling requires a live MCP host)
- Requires migration: no (existing API key configs continue to work unchanged)
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `MCP-FR-002` | updated | API key is now optional; sampling is the fallback when no key is present |
| `MCP-FR-007` | new | Sampling mode: host-delegated inference via MCP protocol |
| `DEC-019` | updated | BYOA assumption extended — MCP Sampling is a fourth provider option alongside Anthropic, Google, Ollama |
| `DEC-023` | new | Architecture decision for the sampling provider implementation |

## Implementation Summary

Four files changed:

| File | Change |
|---|---|
| `packages/core/src/services/ai-client/ai-client.ts` | Added `'mcp-sampling'` to `ProviderConfig` union type. When active, `generateText` calls the injected `createMessage` callback instead of a Vercel AI SDK model. |
| `packages/mcp-server/src/config/env-config.ts` | Auto-detects sampling mode when no API key is present. Returns `useSampling: true` and `providerConfig: null`. Explicit opt-in via `LEAFLETPDF_TRANSFORM_PROVIDER=mcp-sampling`. |
| `packages/mcp-server/src/server.ts` | Declares `experimental: { sampling: {} }` capability. Builds the sampling `ProviderConfig` by closing over `server.request('sampling/createMessage', ...)`. Passes resolved `providerConfig` to the tool handler. |
| `packages/core/src/orchestrator/pipeline-orchestrator.ts` | Logs `'host-model'` for token tracking when sampling is active (model name is not available from the host). |

## Provider Resolution Logic

```
LEAFLETPDF_TRANSFORM_PROVIDER=mcp-sampling  → sampling (explicit)
No API keys + no LEAFLETPDF_OLLAMA_URL       → sampling (auto-detect)
LEAFLETPDF_ANTHROPIC_KEY present             → Anthropic (direct)
LEAFLETPDF_GOOGLE_KEY present                → Google (direct)
LEAFLETPDF_OLLAMA_URL present                → Ollama (direct)
```

## Constraints and Known Limitations

- Token counts are not returned by the MCP sampling protocol. The `tokenSummary` field in the tool response will report `{ input: 0, output: 0 }` in sampling mode.
- The MCP host controls model selection. Leaflet PDF cannot specify or guarantee which model is used when sampling.
- Sampling requires the MCP host to support the `sampling/createMessage` request. Claude Desktop and recent Cursor versions support this. Hosts that do not will return an error, which surfaces as a pipeline failure.
- The `experimental: { sampling: {} }` capability declaration is required by this SDK version's type system. When the MCP SDK adds a typed `sampling` capability field, the declaration should be updated.
