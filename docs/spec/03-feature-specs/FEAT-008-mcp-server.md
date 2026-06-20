# Feature Spec: MCP Server (Phase 2)

## 1. Feature Description

This feature implements Leaflet PDF as an MCP (Model Context Protocol) server. It wraps the existing `@leafletpdf/core` pipeline in an MCP `leafletpdf_transform` tool, enabling AI assistants like Claude Desktop and Cursor to run documents through the pipeline directly, without opening the Electron UI.

**Requirement IDs covered:** `MCP-FR-001`, `MCP-FR-002`, `MCP-FR-003`, `MCP-FR-004`, `MCP-FR-005`, `MCP-FR-006`

## 2. Acceptance Criteria

| AC ID | Description | Requirement ID |
|---|---|---|
| `AC-058` | Tool accepts `content`, `filePath`, `style`, `title`, `outputDir`, and `verbose` inputs and routes valid input through the correct intake function, or fails fast on invalid input. | `MCP-FR-001` |
| `AC-059` | Tool configuration is driven entirely by `LEAFLETPDF_*` environment variables, read per invocation, avoiding Electron keytar store. | `MCP-FR-002` |
| `AC-060` | Tool returns a structured JSON response indicating success (with PDF path) or a `Result<T>` error mapping containing the failed stage and cause. | `MCP-FR-003` |
| `AC-061` | Output PDFs are saved deterministically to `LEAFLETPDF_OUTPUT_DIR` (or default `~/Documents/LeafletPDF/`), appending numeric suffixes if the file exists. | `MCP-FR-004` |
| `AC-062` | If `verbose: true`, the tool response includes timing records for each pipeline stage. | `MCP-FR-005` |
| `AC-063` | Tool run metadata is appended to `leafletpdf-token-log.jsonl` with `inputType: "mcp"`. | `MCP-FR-006` |

## 3. Implementation Details

### Component Breakdown

1. **MCP Server Shell (`packages/mcp-server/src/index.ts`, `server.ts`)**
   - **Inputs:** Stdio transport from an MCP client
   - **Outputs:** Registered tool list, JSON tool responses
   - **Behaviors:** Initializes `@modelcontextprotocol/sdk` Server, registers `leafletpdf_transform` tool, starts stdio listener.
   - **Done when:**
     - [ ] Server responds to `initialize` handshake over stdio
     - [ ] Server lists `leafletpdf_transform` tool with proper JSON schema

2. **Environment Config (`packages/mcp-server/src/config/env-config.ts`)**
   - **Inputs:** `process.env`
   - **Outputs:** Typed `McpConfig` object
   - **Behaviors:** Validates `LEAFLETPDF_ANTHROPIC_KEY` (or chosen provider), resolves output directory.
   - **Done when:**
     - [ ] Returns valid config object or throws specific structured error if required variables are missing

3. **Tool Handler (`packages/mcp-server/src/tools/leafletpdf-transform.ts`)**
   - **Inputs:** Tool arguments, `McpConfig`
   - **Outputs:** MCP ToolResponse (stringified JSON)
   - **Behaviors:** Maps tool arguments to `PipelineInput`, invokes `PipelineOrchestrator`, subscribes to events, measures timing, writes PDF buffer to disk, returns success or error response, appends to token log.
   - **Done when:**
     - [ ] Invalid inputs return `{ error: { stage: "Configuration", ... } }`
     - [ ] Successful pipeline run writes PDF to disk and returns path + token summary
     - [ ] Failed pipeline returns structured error response
     - [ ] Pipeline token usage logs to `~/Documents/LeafletPDF/leafletpdf-token-log.jsonl`

### Interface Contracts

No cross-package interface changes needed. The tool handler imports `@leafletpdf/core` `PipelineOrchestrator` directly and acts as a consumer exactly like the Electron app.

## 4. Dependencies

- `@modelcontextprotocol/sdk` (MCP implementation)
- `@leafletpdf/core` (Shared pipeline logic)
- Playwright Chromium (must be installed via `npx playwright install chromium` before use)

## 5. Security & Privacy

- Relies on environment variables for API keys instead of `keytar`.
- Output PDFs are written to local disk only.
- No network traffic other than the standard AI API calls executed by the core pipeline.
