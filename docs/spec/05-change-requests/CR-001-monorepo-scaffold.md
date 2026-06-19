# Change Request: CR-001 Monorepo Scaffold

## Metadata

- Change request ID: `CR-001`
- Type: architecture
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-18
- Updated: 2026-06-18

## Request

Initialize the npm workspaces monorepo with three packages (`core`, `electron-app`, `mcp-server`), a shared TypeScript base config, and the root `.gitignore`. This is Story 1.1 of Epic 1.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: no (structural scaffold — verified by `npm install` succeeding and workspace resolution)
- Requires migration: no
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `ARCH-001` | implements | Monorepo with npm workspaces: three packages established |

## Documentation updates required before code

- [ ] Requirements registry — not required (no new requirement IDs)
- [ ] Feature spec — not required (covered by epics-stories.md Story 1.1 ACs)
- [ ] Design spec — not required
- [x] Traceability matrix — update ARCH-001 status to `implemented`
- [ ] Test spec — not required (structural scaffold)
- [ ] ADR — not required (ADR-001 already documents this decision)
- [ ] Known bug record — not required

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S11-01` | `ARCH-001` | Create root `package.json` declaring npm workspaces | completed |
| `TASK-S11-02` | `ARCH-001` | Create `tsconfig.base.json` with strict, moduleResolution: bundler, target: ES2022 | completed |
| `TASK-S11-03` | `ARCH-001` | Create `packages/core/package.json` (name: @bookit/core) and `tsconfig.json` | completed |
| `TASK-S11-04` | `ARCH-001` | Create `packages/electron-app/package.json` and `tsconfig.json` | completed |
| `TASK-S11-05` | `ARCH-001` | Create `packages/mcp-server/package.json`, `tsconfig.json`, and `src/index.ts` placeholder | completed |
| `TASK-S11-06` | `ARCH-001` | Create root `.gitignore` | completed |
| `TASK-S11-07` | `ARCH-001` | Create `packages/core/src/index.ts` placeholder | completed |
| `TASK-S11-08` | `ARCH-001` | Run `npm install` from workspace root to verify workspace resolution | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `VERIFY-S11-01` | `npm install` completes without errors | passed |
| `VERIFY-S11-02` | packages/core, packages/electron-app, packages/mcp-server all listed as workspaces | passed |
| `VERIFY-S11-03` | each package tsconfig extends ../../tsconfig.base.json | verified (by inspection) |
| `VERIFY-S11-04` | tsconfig.base.json has strict: true, moduleResolution: bundler, target: ES2022 | verified (by inspection) |
| `VERIFY-S11-05` | packages/mcp-server/src/index.ts contains only `// Phase 2 — MCP server` | verified (by inspection) |
| `VERIFY-S11-06` | .gitignore excludes node_modules/, out/, .vite/, dist/ | verified (by inspection) |

## Final notes

- Implementation summary: Created monorepo scaffold with npm workspaces. Three packages established with correct names and tsconfig inheritance. MCP server is a placeholder only. electron-app declares @bookit/core as a workspace dependency.
- Tests run: npm install (workspace resolution)
- Open risks: None — Story 1.2 adds the electron-forge bootstrap and real dependencies.
- Follow-ups: Story 1.2 (electron-app bootstrap), Story 1.3 (shared types)
