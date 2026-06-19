# ADR-001 — Monorepo with npm Workspaces

## Status

accepted

## Context

Bookit v2 has two confirmed execution hosts: the Electron desktop app (portfolio piece) and a future MCP server (Jason's primary day-to-day use case). Both need to run the same pipeline logic. The question is whether to build them as a monorepo from day one or start with a single package and extract later.

## Decision

Monorepo from day one using npm workspaces, with three packages:
- `packages/core` — all pipeline logic, zero Electron dependencies
- `packages/electron-app` — Electron shell; imports from `@bookit/core`
- `packages/mcp-server` — Phase 2 placeholder; scaffold only

## Requirement links

- `ARCH-001`
- `NFR-005`

## Consequences

### Positive

- MCP server (Phase 2) becomes a thin wrapper around `core` — no rewrite required
- `core` can be tested independently of Electron
- Clean separation between pipeline logic and host-specific code
- EventEmitter abstraction in `core` works identically in both Electron and MCP contexts

### Negative

- Slightly more setup overhead at project initialization
- `npm workspaces` requires Node 16+ (not a constraint — Windows 11 target)

### Neutral

- `packages/mcp-server` exists as a placeholder and adds no complexity until Phase 2

## Alternatives considered

| Option | Why rejected |
|---|---|
| Single package, extract later | Extraction requires rethinking Electron IPC coupling — easier to enforce the boundary from day one |
| Separate repos for core and electron-app | Cross-repo dependency management adds friction; npm workspaces gives the same isolation without the overhead |
