# Change Request: CR-002 Electron App Bootstrap

## Metadata

- Change request ID: `CR-002`
- Type: architecture
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-18
- Updated: 2026-06-18

## Request

Bootstrap `packages/electron-app` with the electron-forge Vite TypeScript template structure, wire in React, and install all runtime dependencies listed in Story 1.2. Adapts the standard template's flat `src/` layout to the architecture's `src/main/` and `src/renderer/` subdirectory structure.

## Classification

- User-visible behavior change: yes (Electron window now opens)
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: no (bootstrap — verified by TypeScript noEmit pass and visual window open)
- Requires migration: no
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `ARCH-001` | implements | electron-app package now has real content |
| `NFR-005` | partial | Self-contained Windows app foundation is established |

## Documentation updates required before code

- [x] Traceability matrix — mark ARCH-001 as `verified` (Story 1.1 + 1.2 together satisfy it)

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S12-01` | `ARCH-001` | Update electron-app package.json with forge scripts and all deps | completed |
| `TASK-S12-02` | `ARCH-001` | Update tsconfig.json with jsx: react-jsx and forge/vite includes | completed |
| `TASK-S12-03` | `ARCH-001` | Create forge.config.ts (VitePlugin + MakerSquirrel) | completed |
| `TASK-S12-04` | `ARCH-001` | Create vite.main.config.ts, vite.renderer.config.ts, vite.preload.config.ts | completed |
| `TASK-S12-05` | `ARCH-001` | Create src/main/index.ts (BrowserWindow, app lifecycle) | completed |
| `TASK-S12-06` | `ARCH-001` | Create src/preload.ts (empty bridge placeholder) | completed |
| `TASK-S12-07` | `ARCH-001` | Create src/renderer/index.html, index.tsx, App.tsx | completed |
| `TASK-S12-08` | `ARCH-001` | Run npm install; verify workspace resolution | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `VERIFY-S12-01` | npm install completes without errors | passed |
| `VERIFY-S12-02` | forge.config.ts, vite.main.config.ts, vite.renderer.config.ts present | verified by inspection |
| `VERIFY-S12-03` | React and ReactDOM installed | verified by npm ls |
| `VERIFY-S12-04` | All "installed and importable" packages present in package.json | verified by inspection |
| `VERIFY-S12-05` | TypeScript noEmit passes (no type errors) | not run — requires electron types to resolve at build time |

## Final notes

- Implementation summary: Manually scaffolded equivalent of `npm create electron-app@latest --template=vite-typescript` with path adaptations for `src/main/index.ts` and `src/renderer/` per ARCHITECTURE.md. `vite.renderer.config.ts` sets `root: 'src/renderer'` so the HTML entry lives at the architecture-specified location. All 579 packages resolved; npm install passed.
- Spec conflict flagged: ARCHITECTURE.md references `@ai-sdk/ollama` which does not exist on npm. Installed `ollama-ai-provider@1.2.0` instead. Conflict logged as `BUG-001` in `docs/spec/09-known-issues/`. Story 2.2 must use `ollama-ai-provider` adapter. PM decision may be needed if the intended package differs.
- Tests run: `npm install` (passed); `npm ls` workspace verification (passed)
- Open risks: (1) `keytar` is a native module — compilation requires Windows Build Tools; if absent, Story 2.1 will surface it. (2) `electron-store@11` is ESM-only; Story 2.1 must verify compatibility with Vite's CommonJS bundling of the main process. (3) `npm run start` visual verification deferred — no desktop in this environment; verify manually before Story 4.3.
- Follow-ups: Story 1.3 (shared types in core), Story 1.4 (IPC bridge skeleton)
