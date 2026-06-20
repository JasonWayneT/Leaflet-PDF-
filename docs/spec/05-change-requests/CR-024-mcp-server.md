# CR-024: Phase 2 MCP Server Extension

## Overview

**Type:** Feature Addition
**Status:** Approved
**Date:** 2026-06-19

Implement Phase 2 of Leaflet PDF: the `packages/mcp-server` workspace. This will expose the core transformation pipeline as an MCP tool (`leafletpdf_transform`) accessible from Claude Desktop, Cursor, and other MCP hosts. This was planned from project inception (see ADR-001) and requires no modifications to the shared pipeline in `@leafletpdf/core`.

## Requirements Impacted

- **Added:** `MCP-FR-001`, `MCP-FR-002`, `MCP-FR-003`, `MCP-FR-004`, `MCP-FR-005`, `MCP-FR-006`
- **Added:** `NFR-MCP-001`, `NFR-MCP-002`, `NFR-MCP-003`
- **Existing:** No changes to FR-001 through FR-024.

## Specs Updated

- `docs/PRD-MCP-addendum.md` (Created)
- `docs/epics-stories.md` (Appended Phase 2 epics)
- `docs/spec/02-requirements-registry.md`
- `docs/spec/03-feature-specs/FEAT-007-mcp-server.md` (Created)
- `docs/spec/06-traceability/traceability-matrix.md`

## Implementation Tasks

The work is defined in Epic 10, Epic 11, and Epic 12 (Stories 10.1–12.3):
1. **TASK-MCP-01:** Scaffold MCP package, configure typescript, install `@modelcontextprotocol/sdk`. (Story 10.1)
2. **TASK-MCP-02:** Implement environment variable configuration logic for API keys. (Story 10.2)
3. **TASK-MCP-03:** Build `leafletpdf_transform` tool handler with input validation. (Story 11.1)
4. **TASK-MCP-04:** Wire `PipelineOrchestrator`, event listeners, and save PDF. (Story 11.2)
5. **TASK-MCP-05:** Implement verbose mode timing logic. (Story 11.3)
6. **TASK-MCP-06:** Implement token logging. (Story 11.4)
7. **TASK-MCP-07:** Create setup documentation for Claude Desktop and Cursor. (Stories 12.1–12.3)

## Verification Plan

- Build package using `npm run build`.
- Start server using `node dist/index.js` and connect locally via MCP Inspector or Claude Desktop to verify the tool appears.
- Invoke the tool manually with test inputs and confirm a PDF is generated at the configured output path.
