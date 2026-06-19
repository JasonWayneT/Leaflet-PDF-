# ADR-006 — EventEmitter Abstraction for IPC Boundary

## Status

accepted

## Context

The Orchestrator in `core` must emit progress events so the renderer can update the UI in real time. But `core` must have zero Electron dependencies — it needs to work identically in a future MCP server host. The IPC boundary must be enforced structurally so that `core` never accidentally imports `ipcMain`.

## Decision

The Orchestrator emits events via Node.js built-in `EventEmitter` — never via Electron IPC. A single bridge file (`electron-app/main/ipc-bridge.ts`) subscribes to the Orchestrator's EventEmitter instance and forwards events to the renderer via Electron IPC (`webContents.send()`). `ipc-bridge.ts` is the only file in the entire codebase that imports `ipcMain` from `electron`.

```
core/orchestrator  →  EventEmitter events
electron-app/main/ipc-bridge.ts  →  subscribes  →  webContents.send() → renderer
mcp-server/shell (Phase 2)  →  subscribes  →  returns progress to MCP client
```

## Requirement links

- `ARCH-003`
- `ARCH-005`
- `ARCH-001`

## Consequences

### Positive

- `core` has zero Electron dependencies — verifiable by grepping for `electron` imports in `packages/core`
- Phase 2 MCP server wraps `core` identically — subscribes to the same EventEmitter, handles differently
- IPC coupling is auditable in one place (`ipc-bridge.ts`)

### Negative

- Requires discipline — future agents must never add Electron imports to `core`; enforced by the agent constraint in `00-project-constitution.md`
- Slightly more indirection for debugging pipeline events (EventEmitter → IPC bridge → renderer)

### Neutral

- Node `EventEmitter` is a built-in; no additional dependency
- `ipcMain.handle()` is used for request/response patterns (settings reads, save dialog); `webContents.send()` for fire-and-forget pipeline events

## Alternatives considered

| Option | Why rejected |
|---|---|
| Orchestrator calls `ipcMain` directly | Ties `core` to Electron — breaks MCP server path; violates ARCH-001 |
| Polling from renderer | Inefficient; introduces shared state; no real-time accuracy |
| Direct function calls from main to renderer | Not event-driven; doesn't support the EventEmitter → MCP bridge shape |
