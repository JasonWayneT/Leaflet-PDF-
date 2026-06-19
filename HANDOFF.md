# Bookit v2 — Session Handoff

**Date:** 2026-06-19
**Status:** Epic 1 complete; Epic 2 complete; Epic 3 complete; Epic 4 complete; Epic 5 next.

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

### Story 1.5 ✅ — GitHub Actions CI Build Workflow
**CR:** `docs/spec/05-change-requests/CR-006-ci-build-workflow.md`
**What was built:**
- `.github/workflows/build.yml` named `CI Build`
- Runs on `push` and `pull_request`
- Uses Node.js 20 on `windows-latest`
- Runs `npm ci` then `npm run build --workspaces --if-present`
- Verified: `npm ci` passed; full workspace build passed

### Story 2.1 ✅ — Secure Settings Storage
**CR:** `docs/spec/05-change-requests/CR-007-secure-settings-storage.md`
**What was built:**
- `packages/electron-app/src/main/key-store.ts` — only file that imports/calls `keytar`; service name `bookit-v2`
- `packages/electron-app/src/main/settings-store.ts` — only file that instantiates `electron-store`; typed non-sensitive settings schema
- Co-located compile tests: `key-store.test.ts`, `settings-store.test.ts`
- Verified: `npx tsc --noEmit --project packages\electron-app\tsconfig.json` passed; `npm run build --workspaces --if-present` passed; source greps confirmed storage boundary rules

### Story 2.2 ✅ — AI Client with Vercel AI SDK
**CR:** `docs/spec/05-change-requests/CR-008-ai-client.md`
**What was built:**
- `packages/core/src/services/ai-client/ai-client.ts` — shared `Result<T>` AI client
- Provider adapters:
  - `providers/anthropic.ts` using `@ai-sdk/anthropic`
  - `providers/google.ts` using `@ai-sdk/google`
  - `providers/ollama.ts` using `ollama-ai-provider-v2`
- Co-located compile tests for client and all provider adapters
- `@bookit/core` now owns AI SDK runtime dependencies and re-exports the AI client API
- Verified: `npm run build --workspace=@bookit/core` passed; `npm run build --workspaces --if-present` passed; `rg -n "electron" packages\core` returned no matches; runtime npm audit reported zero vulnerabilities

### Story 2.3 ✅ — First-Launch Setup Wizard
**CR:** `docs/spec/05-change-requests/CR-009-setup-wizard.md`
**What was built:**
- `SetupWizard.tsx` with provider choice, credential/base URL input, connection test, and model-slot confirmation
- `App.tsx` first-launch check using `providerConfig` from settings
- `preload.ts` exposes renderer API for settings, provider setup, and provider test connection
- `ipc-bridge.ts` routes setup calls to `settingsStore`, `keyStore`, and `aiClient`
- `vite.main.config.ts` externalizes native `keytar` so packaging succeeds
- Verified: `npx tsc --noEmit --project packages\electron-app\tsconfig.json` passed; full workspace build passed; API-key grep showed no API key fields in `settings-store.ts`

### Story 2.4 ✅ — Settings Screen
**CR:** `docs/spec/05-change-requests/CR-010-settings-screen.md`
**What was built:**
- `SettingsScreen.tsx` with Providers section (status card, masked credential indicator, Reconfigure Provider button) and Model Slots section (Transformation + Validation/Utility rows with inline Edit)
- Gear icon in `App.tsx` toggles Settings; Reconfigure Provider re-enters SetupWizard cleanly
- `KEY_DELETE` channel added to `ipc.ts`, `ipc-bridge.ts`, and `preload.ts`
- `RendererApi.provider.deleteKey()` added to preload API types
- `SettingsScreen.test.tsx` compile-time smoke test
- Settings styles appended to `styles.css`
- API keys never displayed or routed through `electron-store` (SEC-001, SEC-002 preserved)
- Verified: `tsc --noEmit` passed; full workspace build passed; architectural grep checks passed

### Story 3.1 ✅ — Paste Text Input
**CR:** `docs/spec/05-change-requests/CR-011-paste-text-input.md`
**What was built:**
- `packages/core/src/modules/intake/intake.ts` — `processTextInput(text): Result<SourceContent>` and `SOURCE_CONTENT_CHAR_LIMIT = 100_000`
- `packages/core/src/modules/intake/intake.test.ts` — compile-time coverage for valid, empty, oversized, and boundary inputs
- `packages/core/src/index.ts` — exports `processTextInput` and `SOURCE_CONTENT_CHAR_LIMIT` from `@bookit/core`
- Verified: `tsc --noEmit` (core) passed; full workspace build passed; no `electron` imports in `packages/core`

### Story 3.2 ✅ — File Import (.md and .txt)
**CR:** `docs/spec/05-change-requests/CR-012-file-import.md`
**What was built:**
- Extended `packages/core/src/modules/intake/intake.ts` with `processFileInput(filePath: string): Result<SourceContent>`
  - Uses Node.js `fs.readFileSync` + `path.extname` (no Electron imports)
  - `SUPPORTED_EXTENSIONS = new Set(['.md', '.txt'])`
  - AC-005: unsupported extension → "Only .md and .txt files are supported"
  - AC-006: empty file → "File is empty"
  - NFR-004: oversized file cap reused from `SOURCE_CONTENT_CHAR_LIMIT`
  - AC-004: valid file → `SourceContent` with `inputType: 'file'`
- Extended `intake.test.ts` with compile-time coverage for all four file scenarios
- Exported `processFileInput` from `@bookit/core`
- Verified: `tsc --noEmit` (core) passed; full workspace build passed; no `electron` imports

### Story 3.3 ✅ — YouTube URL Input & Transcript Extraction
**CR:** `docs/spec/05-change-requests/CR-013-youtube-input.md`
**What was built:**
- Added `youtube-transcript` to `@bookit/core` dependencies; workspace deduplication verified
- Added to `packages/core/src/modules/intake/intake.ts`:
  - `YOUTUBE_URL_PATTERN` regex: matches `youtube.com/watch?v=` and `youtu.be/` formats
  - `preprocessCaptions(raw: string): string` — pure function: HTML entity decode, bracket annotation removal, timestamp removal, filler word removal, whitespace collapse, sentence capitalisation
  - `processYouTubeInput(url: string): Promise<Result<SourceContent>>` — URL validation (AC-009), `YoutubeTranscript.fetchTranscript()` call, error class mapping (AC-008), caption preprocessing, SourceContent wrap (AC-007)
- Extended `intake.test.ts` with `preprocessCaptions` and `processYouTubeInput` compile-time type scenarios
- Exported both functions from `@bookit/core`
- Verified: `tsc --noEmit` passed; full workspace build passed; zero `electron` imports

### Story 3.4 ✅ — Document Title (Provided or AI-Derived)
**CR:** `docs/spec/05-change-requests/CR-014-document-title.md`
**What was built:**
- Extended `packages/core/src/modules/intake/intake.ts` with `deriveTitle(text: string, aiConfig: ProviderConfig): Promise<Result<string>>`
- Uses the AI client to generate a max-60-character title from the first 500 characters of the content
- Extended `intake.test.ts` with type checking for the async resolution shape
- Exported `deriveTitle` from `@bookit/core`
- Verified: `tsc --noEmit` and full workspace build passed

### Story 3.5 ✅ — InputScreen UI
**CR:** `docs/spec/05-change-requests/CR-015-input-screen.md`
**What was built:**
- Created `packages/electron-app/src/renderer/InputScreen/` with `InputScreen.tsx`, `TextInput.tsx`, `FileInput.tsx`, `UrlInput.tsx`, and `StyleSelector.tsx`
- Wired up `OPEN_FILE` IPC handler in `ipc-bridge.ts` calling `dialog.showOpenDialog` and `processFileInput` from core
- Exposed `files.openFile()` through `preload.ts` and type-safe `preload-api.ts`
- Wired `InputScreen` to the `App.tsx` router so it displays once configuration is complete
- Supported settings navigation from the InputScreen topbar
- Verified UI logic blocks submission of invalid/missing input per UX-DR1, UX-DR2, UX-DR3

### Story 4.1 ✅ — Pipeline Orchestrator
**CR:** `docs/spec/05-change-requests/CR-016-pipeline-orchestrator.md`
**What was built:**
- Created typed module stubs in `core` (`claim-extractor`, `technique-selector`, `transformer`, `validator`, `renderer`) to allow Orchestrator implementation before downstream modules exist.
- Implemented `PipelineOrchestrator` in `core/orchestrator/pipeline-orchestrator.ts` using Node's `EventEmitter`.
- Handled the 5-stage pipeline, including the `validate` -> `transform` retry loop (max 3 total attempts).
- Exposed the `PipelineInput` type and `PipelineEvents` interface.
- Created `pipeline-orchestrator.test.ts` as a compile-time test mapping types and logic routes.

### Story 4.2 ✅ — IPC Bridge
**CR:** `docs/spec/05-change-requests/CR-017-ipc-bridge-pipeline.md`
**What was built:**
- Updated `ipc.ts` with PIPELINE_ channels.
- Added typed `pipeline` namespace to `preload-api.ts` and `preload.ts` (`run`, `onStageUpdate`, `onRetry`, `onError`, `onComplete`).
- Modified `registerIpcBridge` to accept `PipelineOrchestrator` and `webContents`.
- Instantiated `PipelineOrchestrator` in `main/index.ts` and passed it to the bridge.
- Forwarded events from the Orchestrator to the renderer.
- On `pipeline:complete`, native `dialog.showSaveDialog` prompts the user, saves the PDF, and sends the filePath back to the renderer.

### Story 4.3 ✅ — Processing UI
**CR:** `docs/spec/05-change-requests/CR-018-processing-ui.md`
**What was built:**
- `ProcessingScreen.tsx` listens to `window.bookit.pipeline.onStageUpdate` and displays active stages.
- `App.tsx` routes between Input, Processing, Error, and Success states.
- Retries append `(Retry attempt 2 of 3)` text.
- Full workspace build passed.

### Story 4.4 ✅ — Success UI
**CR:** `docs/spec/05-change-requests/CR-018-processing-ui.md`
**What was built:**
- `SuccessScreen.tsx` with "Process Another" and "Open File" buttons.
- `OPEN_EXTERNAL` channel added to `ipc.ts` and `ipc-bridge.ts` utilizing `shell.openPath`.
- `preload-api.ts` exposing `files.openExternal`.

### Story 4.5 ✅ — Error UI
**CR:** `docs/spec/05-change-requests/CR-018-processing-ui.md`
**What was built:**
- `ErrorScreen.tsx` maps failed stage names and displays the string cause.
- "Start Over" button navigates cleanly back to `InputScreen` via `App.tsx`.

### Immediate: Epic 5+ — AI Modules
Next is **Epic 5: Knowledge Extraction** (starting with `ClaimExtractor`).


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
