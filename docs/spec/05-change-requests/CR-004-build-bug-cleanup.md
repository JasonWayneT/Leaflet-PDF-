# Change Request: CR-004 Build Bug Cleanup

## Metadata

- Change request ID: `CR-004`
- Type: bug fix
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Address fixable known issues before continuing to the next foundation story: repair current Electron build verification blockers from `BUG-002` and normalize working spec-layer references for the Ollama provider conflict tracked by `BUG-001`.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `ARCH-001` | fixes | Electron package config must point to the emitted Vite main bundle |
| `NFR-005` | supports | Workspace build verification supports future Windows distribution |
| `INT-001` | clarifies | Working spec layer should name the installed Ollama adapter package |

## Documentation updates required before code

- [x] Change request created
- [x] `BUG-002` already contains regression acceptance criteria
- [x] Traceability matrix updated with `CR-004`

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-SBUG-002-01` | `ARCH-001`, `NFR-005` | Reproduce Electron package entry-point and TypeScript rootDir failures | completed |
| `TASK-SBUG-002-02` | `ARCH-001`, `NFR-005` | Update Electron package/config so Forge package and direct TypeScript checks can run | completed |
| `TASK-SBUG-001-01` | `INT-001` | Update working spec-layer references from `@ai-sdk/ollama` to `ollama-ai-provider` where allowed | completed |
| `TASK-SBUG-VERIFY-01` | `ARCH-001`, `NFR-005`, `INT-001` | Run build verification and provider package checks | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `VERIFY-BUG-002-01` | `npm run build --workspace=@leafletpdf/electron-app` packages successfully | passed |
| `VERIFY-BUG-002-02` | Direct electron-app TypeScript verification does not fail on rootDir/config layout | passed |
| `VERIFY-BUG-001-01` | Installed package tree contains `ollama-ai-provider` and not `@ai-sdk/ollama` | passed: `ollama-ai-provider@1.2.0` present; `@ai-sdk/ollama` absent |

## Final notes

- Implementation summary: Updated `packages/electron-app/package.json` main entry from `.vite/build/main.js` to `.vite/build/index.js`, matching the actual Forge Vite output. Updated `packages/electron-app/tsconfig.json` rootDir from `./src` to `.` so included Forge/Vite config files are inside the TypeScript project root. Normalized working spec-layer Ollama references to `ollama-ai-provider`.
- Tests run: `npm run build --workspace=@leafletpdf/electron-app` passed; `npx tsc --noEmit --project packages\electron-app\tsconfig.json` passed; `npm run build --workspaces --if-present` passed; `npm ls ollama-ai-provider --workspace=@leafletpdf/electron-app` found `ollama-ai-provider@1.2.0`; `npm ls @ai-sdk/ollama --workspace=@leafletpdf/electron-app` returned empty as expected.
- Open risks: Story 2.2 still must verify the actual `ollama-ai-provider` adapter API during AI client implementation.
