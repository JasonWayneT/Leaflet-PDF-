# Bookit v2 — Session Handoff

**Date:** 2026-06-19
**Status:** Epic 1 in progress — Stories 1.1 through 1.4 complete, Story 1.5 pending.

---

## READ THIS FIRST — AGENTS.md

Before touching anything:
1. Read `AGENTS.md` in full
2. Read `PIPELINE.md`
3. Read the required spec files in order (`docs/spec/00` through `docs/spec/08`)
4. Read `docs/epics-stories.md` for the current story

AGENTS.md governs everything. The short version:
- Create a CR before writing code
- Cite requirement IDs in every implementation task
- Never redefine types locally — import from `@bookit/core/src/types/index.ts`
- Never call `ipcMain` outside `packages/electron-app/src/main/ipc-bridge.ts`
- Never import from `electron` inside `packages/core`
- Every module returns `Result<T>` — no raw throws across boundaries
- Tests co-located with source (`module.ts` / `module.test.ts`)

---

## What Bookit v2 Is

A Windows desktop application (Electron + TypeScript) that transforms raw non-fiction content — pasted text, .md/.txt files, or YouTube transcripts — into a structured, visually designed PDF (a "Reading Artifact"). The core constraint: **source fidelity is mechanically enforced**. The pipeline never delivers a Reading Artifact that failed validation.

**Four-stage pipeline:** Extracting → Transforming → Validating → Rendering

Full product spec: `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/epics-stories.md`

---

## Current Implementation State

### What Is On Disk Right Now

```
bookit-v2/
├── package.json                        ← workspace root; "start" → @bookit/electron-app
├── tsconfig.base.json                  ← strict: true, moduleResolution: bundler, target: ES2022
├── .gitignore                          ← node_modules/, out/, .vite/, dist/
├── AGENTS.md
├── PIPELINE.md
├── HANDOFF.md                          ← this file
├── CHANGELOG.md
├── README.md
├── packages/
│   ├── core/
│   │   ├── package.json                ← name: @bookit/core
│   │   ├── tsconfig.json               ← extends ../../tsconfig.base.json
│   │   └── src/
│   │       ├── index.ts                ← re-exports shared types
│   │       └── types/
│   │           ├── index.ts            ← shared pipeline handoff contracts
│   │           └── index.test.ts       ← compile-time type surface test
│   ├── electron-app/
│   │   ├── package.json                ← all forge + runtime deps installed
│   │   ├── tsconfig.json               ← extends base + jsx: react-jsx + DOM lib
│   │   ├── forge.config.ts             ← VitePlugin, src/main/index.ts entry
│   │   ├── vite.main.config.ts
│   │   ├── vite.renderer.config.ts     ← root: 'src/renderer'
│   │   ├── vite.preload.config.ts
│   │   └── src/
│   │       ├── main/
│   │       │   └── index.ts            ← BrowserWindow + app lifecycle
│   │       ├── preload.ts              ← placeholder for renderer bridge exposure
│   │       ├── main/
│   │       │   ├── index.ts            ← BrowserWindow + IPC bridge registration
│   │       │   ├── ipc-bridge.ts       ← ONLY ipcMain import; Story 1.4 skeleton
│   │       │   └── ipc-bridge.test.ts
│   │       └── renderer/
│   │           ├── index.html
│   │           ├── index.tsx           ← React createRoot
│   │           └── App.tsx             ← <h1>Bookit v2</h1>
│   └── mcp-server/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts                ← // Phase 2 — MCP server
└── docs/
    ├── product-brief.md
    ├── PRD.md
    ├── ARCHITECTURE.md                 ← canonical tech reference; read before touching any module
    ├── addendum.md
    ├── .decision-log.md
    ├── UX.md
    ├── epics-stories.md                ← 9 epics, 22 stories; your primary work queue
    └── spec/
        ├── 00-project-constitution.md
        ├── 01-bmad-intake.md
        ├── 02-requirements-registry.md
        ├── 03-feature-specs/FEAT-001 through FEAT-007
        ├── 04-design-specs/ (templates)
        ├── 05-change-requests/
        │   ├── CR-001-monorepo-scaffold.md     ← Story 1.1 complete
        │   └── CR-002-electron-app-bootstrap.md ← Story 1.2 complete
        ├── 06-traceability/traceability-matrix.md
        ├── 07-decisions/ADR-001 through ADR-006
        ├── 08-test-specs/TEST-001-pipeline-integration.md
        └── 09-known-issues/
            └── BUG-001-ai-sdk-ollama-package-name.md ← IMPORTANT — read this
```

### node_modules Status

`npm install` has been run from the workspace root. All packages are installed. Key resolved versions:
- `electron@42.4.1`
- `react@19.2.7`, `react-dom@19.2.7`
- `vite@8.0.16`
- `@electron-forge/cli@7.11.2`, `@electron-forge/plugin-vite@7.11.2`
- `ai@6.0.208`
- `@ai-sdk/anthropic@3.0.85`, `@ai-sdk/google@3.0.83`
- `ollama-ai-provider@1.2.0` ← replaces non-existent `@ai-sdk/ollama` (see BUG-001)
- `@anthropic-ai/sdk@0.105.0`
- `electron-store@11.0.2`
- `keytar@7.9.0`
- `playwright@1.61.0`
- `youtube-transcript@1.3.1`

---

## Stories Completed This Session

### Story 1.1 ✅ — Initialize Monorepo with npm Workspaces
**CR:** `docs/spec/05-change-requests/CR-001-monorepo-scaffold.md`
**What was built:**
- Root `package.json` with `workspaces: ["packages/*"]`
- `tsconfig.base.json` (strict, moduleResolution: bundler, ES2022)
- Three workspace packages: `@bookit/core`, `@bookit/electron-app`, `@bookit/mcp-server`
- Each package has its own `package.json` and `tsconfig.json` extending the base
- `packages/mcp-server/src/index.ts` — single-line placeholder
- `.gitignore`
- Verified: `npm install` passed, `npm ls --workspaces` confirmed all 3 resolved

### Story 1.2 ✅ — Initialize Electron App Shell
**CR:** `docs/spec/05-change-requests/CR-002-electron-app-bootstrap.md`
**Known issue:** `BUG-001` — read before implementing anything AI-related
**What was built:**
- Full electron-forge Vite TypeScript scaffold (manually, adapted for `src/main/` + `src/renderer/` path structure)
- `forge.config.ts`, `vite.main.config.ts`, `vite.renderer.config.ts`, `vite.preload.config.ts`
- `src/main/index.ts` — BrowserWindow entry point
- `src/preload.ts` — empty bridge placeholder
- `src/renderer/index.html`, `index.tsx`, `App.tsx` (`<h1>Bookit v2</h1>`)
- Root `package.json` updated: added `"start": "npm run start --workspace=@bookit/electron-app"`
- All runtime dependencies installed and verified
- **Visual verification (window opens) is NOT done** — no desktop in prior session. Jason can run `npm start` locally to confirm.

**Open risks from Story 1.2 (low probability, verify in Story 2.1):**
- `electron-store@11` is ESM-only — should be fine with Vite bundling, but verify when implementing `settings-store.ts`
- `keytar` native module compilation — installed cleanly, verify with actual import in Story 2.1

### Story 1.3 ✅ — Shared Type Definitions
**CR:** `docs/spec/05-change-requests/CR-003-shared-type-definitions.md`
**What was built:**
- `packages/core/src/types/index.ts` with Story 1.3 shared pipeline handoff contracts
- `packages/core/src/index.ts` re-exports all shared types from `@bookit/core`
- `packages/core/src/types/index.test.ts` compile-time type surface check
- Verified: `npm run build --workspace=@bookit/core` passed; no local redefinitions found outside canonical type file

### Story 1.4 ✅ — IPC Type Definitions & Bridge Skeleton
**CR:** `docs/spec/05-change-requests/CR-005-ipc-bridge-skeleton.md`
**What was built:**
- `packages/electron-app/src/renderer/types/ipc.ts` with `IPC_CHANNELS`
- `packages/electron-app/src/main/ipc-bridge.ts` with guarded stub registration
- `packages/electron-app/src/main/index.ts` now calls `registerIpcBridge()`
- Compile-time IPC tests in `ipc.test.ts` and `ipc-bridge.test.ts`
- Verified: `npx tsc --noEmit --project packages\electron-app\tsconfig.json` passed; `npm run build --workspace=@bookit/electron-app` passed; source grep confirms only `ipc-bridge.ts` imports `ipcMain`

---

## BUG-001 — Critical Context Before Any AI Story

**ARCHITECTURE.md says:** install `@ai-sdk/ollama`
**Reality:** that package does not exist on npm (404).
**What was installed:** `ollama-ai-provider@1.2.0` (community Vercel AI SDK provider for Ollama)

Working spec-layer references now point to `ollama-ai-provider`; upstream BMAD docs still preserve the original `@ai-sdk/ollama` reference as historical input. When implementing Story 2.2 (AI Client), the Ollama adapter must import from `ollama-ai-provider`. Verify the adapter API is compatible with Vercel AI SDK's provider interface before implementing.

Full record: `docs/spec/09-known-issues/BUG-001-ai-sdk-ollama-package-name.md`

---

## What's Next

### Immediate: Story 1.5 — GitHub Actions CI Build Workflow

Creates `.github/workflows/build.yml` — CI on push/PR, Node 20 LTS, `windows-latest`, fails on TypeScript errors.

### After Epic 1: Epic 2 Stories (2.1 → 2.2)

Story 2.1 is the first story that will actually exercise `electron-store` and `keytar`. That's where BUG-001's open risks get resolved.

---

## Key Architectural Rules (Enforcement Checklist)

Before every story:
- [ ] Does any code I'm about to write import from `electron` inside `packages/core`? → STOP. Not allowed.
- [ ] Does any code import `ipcMain` anywhere other than `ipc-bridge.ts`? → STOP. Not allowed.
- [ ] Does any module throw exceptions across its boundary instead of returning `Result<T>`? → STOP. Fix it.
- [ ] Are any types being redefined locally instead of imported from `@bookit/core/src/types/index.ts`? → STOP. Fix it.
- [ ] Are tests co-located (module.ts / module.test.ts same directory)? → Required for every module.
- [ ] Are AI prompts in a co-located `prompts.ts`? → Required for every AI-calling module.
- [ ] Is every requirement ID cited in the implementation? → Required. Use `// Implements FR-xxx`.

---

## Model Defaults (from ARCHITECTURE.md)

- Transformation slot: `claude-sonnet-4-6`
- Validation/Utility slot: `claude-haiku-4-5`

These are the defaults for the Setup Wizard auto-assignment. Do not hardcode them anywhere else — they live in settings and are user-configurable.

---

## Traceability Matrix Status

`docs/spec/06-traceability/traceability-matrix.md`

- `ARCH-001` → `implemented` (Stories 1.1 + 1.2)
- `INT-001` → `accepted` + `BUG-001` flag on Ollama adapter
- All others → `accepted` (pre-implementation)

---

## CHANGELOG

`CHANGELOG.md` has not been updated this session. Update it after Epic 1 is fully complete (all 5 stories done).
