---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/PRD.md
  - docs/ARCHITECTURE.md
  - docs/product-brief.md
  - docs/addendum.md
status: complete
completedAt: '2026-06-18'
project_name: Bookit v2
---

# Bookit v2 — Epic Breakdown

## Overview

This document decomposes all 24 functional requirements from the PRD and all architecture decisions from ARCHITECTURE.md into implementable epics and stories. Stories are written for the Developer agent (Amelia) and contain full acceptance criteria in Given/When/Then format.

**Architecture canonical reference:** `docs/ARCHITECTURE.md`
**Enforcement rules for every story:**
- Return `Result<T>` from every module function — no raw throws across boundaries
- All IPC calls live exclusively in `packages/electron-app/src/main/ipc-bridge.ts`
- Tests are co-located with source files (`module.ts` / `module.test.ts`)
- All shared types import from `packages/core/src/types/index.ts` — never redefined locally
- All AI prompts live in a `prompts.ts` co-located with the module that uses them

---

## Requirements Inventory

### Functional Requirements

FR-1: User can paste raw text (up to 100,000 characters) as Source Content and submit for processing
FR-2: User can import a .md or .txt file from the local filesystem as Source Content
FR-3: User can enter a YouTube URL; the app extracts the video transcript as Source Content
FR-4: User can optionally provide a document title; if omitted, a title is AI-derived from the first 500 characters of Source Content
FR-5: App displays the active pipeline stage (Extracting / Transforming / Validating / Rendering) in real time during processing
FR-6: When a stage fails, the app names the failed stage and reason; pipeline halts; user can restart
FR-7: A Reading Artifact (PDF) is only written to disk when all four stages complete successfully
FR-8: Technique selection is deterministic — same input always produces the same technique list; runs before any AI call
FR-9: BLUF, teach-not-label headings, and 60-second cheat sheet are applied to every document
FR-10: Mental buckets are applied when Source Content exceeds 1,500 words or contains multiple distinct topics
FR-11: Jargon translation is applied when technical/domain-specific terms are detected
FR-12: Facts→implications is applied when content is primarily factual or assertive in nature
FR-13: AI Transformer does not add, invent, or remove factual claims — enforced by Source Fidelity Validation
FR-14: Technique audit record is available per document (session-only for v2)
FR-15: Factual Claims are extracted from Source Content (via AI, Validation slot) before Transformation begins
FR-16: After each Transformation, every Factual Claim is checked against the Transformed output
FR-17: On validation failure, pipeline automatically retries Transformation (max 3 total attempts)
FR-18: After 3 failed attempts, pipeline halts with "Validation failed after 3 attempts" error; no PDF written
FR-19: Transformed content is rendered using the active Visual Style to produce a Reading Artifact (PDF)
FR-20: Both Orbital Light (default) and Orbital Night ship in v2; user selects at submission time
FR-21: Adding a new Visual Style requires only a new spec file + HTML template — no pipeline changes
FR-22: Output is a valid PDF, portrait orientation, formatted for tablet reading
FR-23: After pipeline success, native Windows save dialog opens; file written only after user confirms location
FR-24: User receives save confirmation with path; can open PDF directly from the confirmation screen

### Non-Functional Requirements

NFR-1: Full pipeline completes in under 3 minutes for a 2,000-word input on a standard internet connection (SM-4)
NFR-2: Source Fidelity Validation passes on first attempt for at least 80% of documents (SM-3)
NFR-3: 90% of submitted documents complete the full pipeline without a terminal error (SM-2)
NFR-4: API keys are stored in Windows Credential Manager via `keytar`; never in electron-store or on disk in plaintext
NFR-5: Token usage is logged per-call to a .jsonl file in userData; logging failures never interrupt the pipeline
NFR-6: App is self-contained Windows 11 desktop application; no server, no installer server, distributed via GitHub
NFR-7: Input is capped at 100,000 characters (soft limit); empty inputs and unsupported file types are rejected before processing
NFR-8: PDF output is portrait, tablet-readable, and opens in the system default PDF viewer

### Additional Requirements (Architecture)

- **Monorepo with npm workspaces:** Three packages — `core` (zero Electron deps), `electron-app`, `mcp-server` (Phase 2 placeholder)
- **Starter template:** `npm create electron-app@latest bookit-v2 -- --template=vite-typescript` is the Electron bootstrap; add React, Vercel AI SDK, youtube-transcript, Playwright, electron-store, keytar
- **EventEmitter abstraction:** Orchestrator in `core` emits via Node EventEmitter; `electron-app/main/ipc-bridge.ts` subscribes and bridges to Electron IPC; `core` never imports from Electron
- **Vercel AI SDK:** `ai` + `@ai-sdk/anthropic` + `@ai-sdk/google` + `@ai-sdk/ollama` for unified `generateText()` interface
- **Two model slots:** Transformation slot (default: `claude-sonnet-4-6`) + Validation/Utility slot (default: `claude-haiku-4-5`)
- **Style registry:** Maps style names to spec paths + HTML template paths; new style = new spec + new template + one registry entry
- **Playwright PDF:** Headless Chromium in main process; A4 portrait, print-background enabled; fonts bundled as static assets
- **Token log schema:** `.jsonl` in `app.getPath('userData')/bookit-token-log.jsonl`; per-call token counts + build-time cost estimates
- **YouTube caption pre-processing:** `preprocessCaptions()` in Intake — deterministic, strips timestamps/speaker labels/filler before SourceContent is formed
- **Mental bucket threshold:** 1,500 words config constant in `technique-selector/rules.ts`
- **Technique audit persistence:** Session-only for v2 (no storage design needed)
- **MCP server:** Phase 2 roadmap — scaffold `packages/mcp-server/src/index.ts` as placeholder only
- **CI:** `.github/workflows/build.yml` — runs on push; fails on TypeScript compilation errors
- **Result<T> error contract:** Every module returns `Result<T>` — no raw throws across boundaries

### UX Design Requirements

UX-DR1: InputScreen presents three mutually exclusive input modes (Paste Text / Import File / YouTube URL); switching clears prior input
UX-DR2: StyleSelector component (dropdown or toggle) shows Orbital Light (default) and Orbital Night; appears in InputScreen before Submit
UX-DR3: Submit button is disabled until valid input is present; inline validation errors appear before any processing begins
UX-DR4: ProcessingScreen shows stage label (Extracting / Transforming / Validating / Rendering) updating in real time; retry label "Retrying transformation — attempt N of 3"
UX-DR5: ErrorScreen names the failed stage and cause explicitly; has a "Start Over" button returning to InputScreen
UX-DR6: SuccessScreen shows save path, "Open File" button (system default PDF viewer), and "Process Another" button returning to InputScreen
UX-DR7: SetupWizard on first launch: Cloud or Local → provider choice → API key / base URL → test connection → model auto-assignment
UX-DR8: Settings screen: Providers section (status cards) + Model Slots section (Transformation / Validation+Utility, each editable)
UX-DR9: UI language is minimal, functional, technical in register — consistent with Orbital Light aesthetic; error messages name stage and cause, no apologetic language

### FR Coverage Map

| Epic | FR Coverage |
|---|---|
| Epic 1: Project Foundation | Architecture requirements, NFR-6 |
| Epic 2: BYOA Settings & AI Client | NFR-4, UX-DR7, UX-DR8 |
| Epic 3: Content Intake | FR-1, FR-2, FR-3, FR-4, FR-20 (style picker), UX-DR1, UX-DR2, UX-DR3 |
| Epic 4: Pipeline Orchestration & UI | FR-5, FR-6, FR-7, FR-17 (retry display), UX-DR4, UX-DR5 |
| Epic 5: Content Transformation | FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, NFR-5 |
| Epic 6: Source Fidelity Validation | FR-15, FR-16, FR-17, FR-18 |
| Epic 7: PDF Rendering | FR-19, FR-20, FR-21, FR-22 |
| Epic 8: Output Delivery | FR-23, FR-24, UX-DR6 |
| Epic 9: Integration & Distribution | NFR-1, NFR-2, NFR-3, NFR-6 |

---

## Epic List

1. [Epic 1: Project Foundation & Monorepo Scaffold](#epic-1-project-foundation--monorepo-scaffold)
2. [Epic 2: BYOA Settings & AI Client](#epic-2-byoa-settings--ai-client)
3. [Epic 3: Content Intake](#epic-3-content-intake)
4. [Epic 4: Pipeline Orchestration & UI](#epic-4-pipeline-orchestration--ui)
5. [Epic 5: Content Transformation](#epic-5-content-transformation)
6. [Epic 6: Source Fidelity Validation](#epic-6-source-fidelity-validation)
7. [Epic 7: PDF Rendering](#epic-7-pdf-rendering)
8. [Epic 8: Output Delivery](#epic-8-output-delivery)
9. [Epic 9: End-to-End Integration & Distribution](#epic-9-end-to-end-integration--distribution)

---

## Epic 1: Project Foundation & Monorepo Scaffold

**Goal:** Establish the full monorepo structure, TypeScript configuration, Electron app shell, shared type contracts, and CI pipeline. Nothing functional runs yet, but every package boundary, naming convention, and build toolchain is in place and verified. Subsequent epics build on this foundation without revisiting structure.

**Covers:** Architecture requirements (monorepo, starter template, IPC boundary, CI), NFR-6

---

### Story 1.1: Initialize Monorepo with npm Workspaces

As a developer,
I want the npm workspaces monorepo initialized with three packages (`core`, `electron-app`, `mcp-server`) and a shared TypeScript base config,
So that all packages share a single build toolchain with correct workspace resolution from day one.

**Acceptance Criteria:**

**Given** the repo root exists with a `package.json` declaring npm workspaces
**When** `npm install` is run from the root
**Then** `packages/core`, `packages/electron-app`, and `packages/mcp-server` are all valid npm workspaces
**And** each package's `tsconfig.json` extends `../../tsconfig.base.json` at the root
**And** `tsconfig.base.json` sets `strict: true`, `moduleResolution: bundler`, `target: ES2022`
**And** `packages/mcp-server/src/index.ts` is a scaffold placeholder (exports nothing, single comment: `// Phase 2 — MCP server`)
**And** `packages/core/package.json` has name `@bookit/core` and is importable from `electron-app`
**And** `.gitignore` excludes `node_modules/`, `out/`, `.vite/`, `dist/`

---

### Story 1.2: Initialize Electron App Shell (electron-forge Vite Template)

As a developer,
I want the `electron-app` package bootstrapped with the electron-forge Vite TypeScript template and React wired into the renderer,
So that `npm run start` opens an Electron window rendering a blank React page with no TypeScript errors.

**Acceptance Criteria:**

**Given** `packages/electron-app` is initialized via `npm create electron-app@latest` with `--template=vite-typescript`
**When** `npm run start` is run from the workspace root (or from `packages/electron-app`)
**Then** an Electron window opens displaying a blank React page (no content required — just `<h1>Bookit v2</h1>`)
**And** both main process (`src/main/index.ts`) and renderer process (`src/renderer/index.tsx`) compile without TypeScript errors
**And** `forge.config.ts`, `vite.main.config.ts`, and `vite.renderer.config.ts` are present and functional
**And** React and ReactDOM are installed (`react`, `react-dom`, `@types/react`, `@types/react-dom`)
**And** the following packages are installed and importable (no usage yet): `@anthropic-ai/sdk`, `youtube-transcript`, `playwright`, `ai`, `@ai-sdk/anthropic`, `@ai-sdk/google`, `@ai-sdk/ollama`, `electron-store`, `keytar`

---

### Story 1.3: Shared Type Definitions (`core/src/types/index.ts`)

As a developer,
I want all pipeline handoff contract types defined once in `packages/core/src/types/index.ts`,
So that no module ever redefines a type locally and the handoff contracts are a single source of truth.

**Acceptance Criteria:**

**Given** `packages/core/src/types/index.ts` is created
**Then** it exports the following types (at minimum):

```typescript
// Pipeline handoff contracts
type SourceContent = { text: string; inputType: 'paste' | 'file' | 'youtube'; title?: string }
type FactualClaim = { id: string; text: string }
type FailedClaim = { claim: FactualClaim; reason: string }
type TechniqueList = { always: AlwaysTechnique[]; conditional: ConditionalTechnique[] }
type TransformedContent = { title: string; sections: ContentSection[]; techniqueAudit: TechniqueAuditRecord }
type ContentSection = { type: SectionType; heading?: string; body: string }
type TechniqueAuditRecord = { applied: string[]; skipped: string[]; conditionLog: Record<string, string> }

// Pipeline control types
type StageName = 'Extracting' | 'Transforming' | 'Validating' | 'Rendering'
type PipelineError = { stage: StageName; cause: string; retryable: boolean }
type Result<T> = { ok: true; value: T } | { ok: false; error: PipelineError }

// Token logging
type TokenUsageEntry = { provider: string; model: string; in: number; out: number }
type PipelineRunLog = { runId: string; timestamp: string; inputType: string; sourceChars: number; visualStyle: string; outcome: 'success' | 'fidelity_failure' | 'error'; attempts: number; tokenUsage: Record<string, TokenUsageEntry | Record<string, TokenUsageEntry>>; estimatedCostUSD: Record<string, number | string> }

// Style
type StyleName = 'orbital-light' | 'orbital-night'
type StyleRegistryEntry = { specPath: string; templatePath: string }
```

**And** `packages/electron-app` imports these types from `@bookit/core` — no local redefinitions
**And** `packages/core/src/index.ts` re-exports all types from `types/index.ts`
**And** the file compiles without errors

---

### Story 1.4: IPC Type Definitions & Bridge Skeleton

As a developer,
I want the IPC channel type contracts defined in `renderer/types/ipc.ts` and the IPC bridge skeleton in `main/ipc-bridge.ts`,
So that the single-file IPC boundary is established before any feature code references it.

**Acceptance Criteria:**

**Given** `packages/electron-app/src/renderer/types/ipc.ts` exists
**Then** it exports typed channel name constants for all pipeline events:

```typescript
export const IPC_CHANNELS = {
  PIPELINE_STAGE_UPDATE: 'pipeline:stage-update',
  PIPELINE_RETRY: 'pipeline:retry',
  PIPELINE_COMPLETE: 'pipeline:complete',
  PIPELINE_ERROR: 'pipeline:error',
  RUN_PIPELINE: 'pipeline:run',
  SAVE_FILE: 'file:save',
  OPEN_FILE: 'file:open',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  KEY_GET: 'key:get',
  KEY_SET: 'key:set',
} as const
```

**And** `packages/electron-app/src/main/ipc-bridge.ts` is the only file that imports from Electron's `ipcMain`
**And** A grep over the entire `packages/` directory confirms no other file imports `ipcMain` from `electron`
**And** the bridge skeleton registers handlers using `ipcMain.handle()` and `ipcMain.on()` stubs (no real logic yet — all handlers return `undefined`)

---

### Story 1.5: GitHub Actions CI Build Workflow

As a developer,
I want a CI build workflow that runs on every push and fails on TypeScript compilation errors,
So that broken types are caught before they reach the main branch.

**Acceptance Criteria:**

**Given** `.github/workflows/build.yml` exists
**When** a push is made to any branch
**Then** the workflow runs `npm ci` and then `npm run build` (or `tsc --noEmit`) for all packages
**And** the job fails if any TypeScript compilation error occurs in any package
**And** the workflow targets Node.js 20 LTS on `windows-latest`
**And** the workflow is named `CI Build` and runs on `push` and `pull_request`

---

## Epic 2: BYOA Settings & AI Client

**Goal:** Users configure their AI provider (Anthropic, Google, Ollama) and API key through a first-launch wizard and ongoing settings screen. The AI client in `core` routes calls through the Vercel AI SDK to the correct provider + model slot. API keys never touch `electron-store`.

**Covers:** NFR-4, UX-DR7, UX-DR8

---

### Story 2.1: Secure Settings Storage (`key-store.ts` + `settings-store.ts`)

As a user,
I want my API keys stored in Windows Credential Manager and all other config in a local JSON store,
So that sensitive credentials never appear on disk in plaintext.

**Acceptance Criteria:**

**Given** I provide an API key
**When** `keyStore.set(provider, apiKey)` is called
**Then** the key is stored via `keytar` to Windows Credential Manager under the service name `bookit-v2`
**And** `keyStore.get(provider)` retrieves the key from Credential Manager
**And** `keyStore.delete(provider)` removes the key

**Given** I provide non-sensitive config (provider type, model name, base URL, slot assignments)
**When** `settingsStore.set(key, value)` is called
**Then** the value is persisted via `electron-store` to the user data directory
**And** `settingsStore.get(key)` returns the persisted value across app restarts

**And** `packages/electron-app/src/main/key-store.ts` is the only file that calls `keytar`
**And** `packages/electron-app/src/main/settings-store.ts` is the only file that instantiates `electron-store`
**And** no API key string ever passes through `electron-store`

---

### Story 2.2: AI Client with Vercel AI SDK (Two Model Slots)

As a developer,
I want a shared AI client in `packages/core/src/services/ai-client/` that accepts a provider config and routes `generateText()` calls through the correct Vercel AI SDK adapter,
So that all pipeline modules call a single interface regardless of the active provider.

**Acceptance Criteria:**

**Given** a `ProviderConfig` of shape `{ provider: 'anthropic' | 'google' | 'ollama'; model: string; apiKey?: string; baseUrl?: string }`
**When** `aiClient.generateText(prompt, providerConfig)` is called
**Then** the correct Vercel AI SDK adapter is invoked (`@ai-sdk/anthropic`, `@ai-sdk/google`, or `@ai-sdk/ollama`)
**And** the response returns `{ text: string; usage: { inputTokens: number; outputTokens: number } }`
**And** provider errors are caught internally and returned as `Result<never>` with a `PipelineError` (never thrown across the boundary)
**And** `packages/core/src/services/ai-client/providers/anthropic.ts`, `google.ts`, and `ollama.ts` each implement the same adapter interface
**And** `ai-client.test.ts` covers all three provider paths using mocked SDK calls
**And** the AI client imports nothing from Electron

---

### Story 2.3: First-Launch Setup Wizard

As a user,
I want a guided setup wizard to appear on first launch so that I can configure my AI provider and API key before the app is usable,
So that I never reach the InputScreen without a working provider.

**Acceptance Criteria:**

**Given** this is the first launch (no `providerConfig` exists in settings-store)
**When** the Electron app opens
**Then** `SetupWizard.tsx` is shown instead of `InputScreen.tsx`
**And** the wizard presents these steps in sequence:
  1. Cloud or Local? (options: Anthropic, Google, Ollama)
  2. Provider-specific inputs: API key field (Anthropic/Google) or base URL field (Ollama)
  3. Test Connection button — calls AI client with a minimal ping prompt
  4. On success: auto-assigns default models (`claude-sonnet-4-6` to Transformation, `claude-haiku-4-5` to Validation/Utility for Anthropic)
  5. Confirmation screen with slot assignments shown
**And** after wizard completion, settings are saved and `InputScreen.tsx` is shown
**And** subsequent launches detect existing config and skip the wizard entirely
**And** the wizard can be re-triggered from Settings ("Reconfigure Provider")

---

### Story 2.4: Settings Screen (Providers + Model Slots)

As a user,
I want a Settings screen where I can view my active provider, edit model slot assignments, and add or reconfigure providers,
So that I can adjust my AI configuration at any time without going through the full wizard.

**Acceptance Criteria:**

**Given** the app is configured and I open Settings
**Then** the Settings screen shows a **Providers** section with one status card per configured provider (showing: provider name, connection status, API key masked)
**And** a **Model Slots** section with two rows: Transformation and Validation/Utility, each showing current provider + model name
**And** each model slot row has an Edit button that opens an inline editor for provider and model name
**And** a "Reconfigure Provider" action triggers the SetupWizard flow for the selected provider
**And** Ollama configuration shows a guidance note: "Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models."
**And** settings changes are persisted immediately on save (no "Apply" step)
**And** Settings is accessible via a gear icon or menu item from `App.tsx`

---

## Epic 3: Content Intake

**Goal:** Users supply Source Content through three methods (paste text, file import, YouTube URL) and optionally provide a document title. The InputScreen validates all inputs before any pipeline stage begins. The Visual Style is selected here.

**Covers:** FR-1, FR-2, FR-3, FR-4, FR-20 (style picker), UX-DR1, UX-DR2, UX-DR3

---

### Story 3.1: Paste Text Input

As a user,
I want to paste raw text into the app and submit it for processing,
So that I can transform any text content without needing a file or URL.

**Acceptance Criteria:**

**Given** the InputScreen is showing and the Paste Text tab is active
**When** I paste text into the textarea and click Submit
**Then** the text is stored as `SourceContent` with `inputType: 'paste'` and passed to the pipeline
**And** the Submit button is disabled until the textarea contains at least one non-whitespace character

**When** I submit with an empty textarea
**Then** an inline error message "Content required" appears below the textarea; no processing begins

**When** I paste text exceeding 100,000 characters
**Then** an inline character count error appears; the Submit button remains disabled; no processing begins

**And** `packages/core/src/modules/intake/intake.ts` exports `processTextInput(text: string): Result<SourceContent>`
**And** `intake.test.ts` covers: valid input, empty input, oversized input

---

### Story 3.2: File Import (.md and .txt)

As a user,
I want to import a .md or .txt file from my filesystem as Source Content,
So that I can transform local documents without manual copy-paste.

**Acceptance Criteria:**

**Given** I click the Import File button on the InputScreen
**When** the native Electron file picker opens and I select a `.md` or `.txt` file
**Then** the file content is read as plain text and stored as `SourceContent` with `inputType: 'file'`
**And** the filename appears in the UI as confirmation of the selected file
**And** the text is treated identically to pasted text for all downstream processing

**When** I select a file with any other extension
**Then** an inline error "Only .md and .txt files are supported" appears; no processing begins

**When** I select a file with no content
**Then** an inline error "File is empty" appears; no processing begins

**And** `intake.ts` exports `processFileInput(filePath: string): Result<SourceContent>`
**And** file reading uses `fs.readFileSync` in the main process, triggered via IPC from the renderer
**And** `intake.test.ts` covers: .md file, .txt file, unsupported extension, empty file

---

### Story 3.3: YouTube URL Input & Transcript Extraction

As a user,
I want to paste a YouTube URL and have the app automatically extract the transcript as Source Content,
So that I can transform video content without manually transcribing it.

**Acceptance Criteria:**

**Given** the YouTube URL tab is active
**When** I paste a valid YouTube URL (`youtube.com/watch?v=` or `youtu.be/` format) and click Submit
**Then** the `youtube-transcript` npm package extracts the raw transcript
**And** `preprocessCaptions(rawTranscript)` runs before forming `SourceContent` — stripping timestamps, speaker labels, and filler tokens, and restoring basic sentence boundaries
**And** the cleaned transcript is stored as `SourceContent` with `inputType: 'youtube'`

**When** no transcript is available for the video
**Then** an inline error "No transcript available for this video. Try pasting the content manually." appears; no processing begins

**When** I enter a URL that is not a valid YouTube URL
**Then** an inline error "Please enter a valid YouTube URL" appears before any extraction is attempted

**And** `intake.ts` exports `processYouTubeInput(url: string): Promise<Result<SourceContent>>`
**And** `preprocessCaptions(raw: string): string` is a pure function in `intake.ts` (no AI, no side effects)
**And** `intake.test.ts` covers: valid URL with transcript, valid URL without transcript, invalid URL, `preprocessCaptions` with sample noisy transcript

---

### Story 3.4: Document Title (Provided or AI-Derived)

As a user,
I want to optionally provide a document title before submitting so my Reading Artifact has the right name,
And if I leave it blank, the app derives one for me.

**Acceptance Criteria:**

**Given** I provide a title in the title field before submitting
**Then** that title is used as the document title in the Reading Artifact and as the default PDF filename (sanitized for filesystem)

**Given** I leave the title field empty and submit
**Then** after Source Content is established, the Validation/Utility model slot derives a title from the first 500 characters of Source Content
**And** the derived title is passed into the pipeline as `SourceContent.title`
**And** title derivation happens before Claim Extraction begins (first AI call in the pipeline)
**And** token usage for title derivation is logged as `titleDerive` in the run log

**And** `intake.ts` exports `deriveTitle(text: string, aiConfig: ProviderConfig): Promise<Result<string>>`
**And** `intake.test.ts` covers: user-provided title, AI-derived title (mocked AI call)

---

### Story 3.5: InputScreen UI (All Input Types + Style Selector)

As a user,
I want the InputScreen to present all input methods, a style selector, and a title field in a single coherent layout,
So that I can configure my entire submission before starting the pipeline.

**Acceptance Criteria:**

**Given** the app is open and configured
**Then** `InputScreen.tsx` renders with three tab/toggle buttons: "Paste Text", "Import File", "YouTube URL"
**And** only one input panel is shown at a time; switching tabs clears the prior input and any inline errors
**And** a `StyleSelector.tsx` component appears below the input area showing "Orbital Light" (default, selected) and "Orbital Night"
**And** an optional title text field appears above the input area
**And** the Submit button is disabled until at least one valid input is present
**And** the selected style name is passed to the pipeline alongside `SourceContent`
**And** `TextInput.tsx`, `FileInput.tsx`, `UrlInput.tsx`, and `StyleSelector.tsx` are separate components under `InputScreen/`
**And** the UI language is minimal and technical in register (labels: "PASTE TEXT", "IMPORT FILE", "YOUTUBE URL")

---

## Epic 4: Pipeline Orchestration & UI

**Goal:** After submission, the Orchestrator sequences all 5 modules, emits real-time stage events, and the renderer displays progress. Stage failures are surfaced with stage name and cause. No partial output is ever written.

**Covers:** FR-5, FR-6, FR-7, FR-17 (retry display), UX-DR4, UX-DR5

---

### Story 4.1: Pipeline Orchestrator (`core/orchestrator/pipeline-orchestrator.ts`)

As a developer,
I want a stateless Pipeline Orchestrator in `core` that sequences all 5 modules and owns retry logic via Node EventEmitter,
So that the pipeline is fully decoupled from both Electron and any future host (MCP server).

**Acceptance Criteria:**

**Given** a `PipelineInput` of shape `{ sourceContent: SourceContent; styleSelection: StyleName; providerConfig: { transformation: ProviderConfig; validation: ProviderConfig } }`
**When** `runPipeline(input)` is called
**Then** the Orchestrator runs modules in this sequence:
  1. `deriveTitle` (if no title in SourceContent)
  2. `extractClaims` (ClaimExtractor)
  3. `selectTechniques` (TechniqueSelector)
  4. `transform` (Transformer — attempt 1)
  5. `validate` (Validator)
  6. On fail → `transform` again (attempt 2), then `validate` again
  7. On fail again → `transform` again (attempt 3), then `validate` again
  8. On 3rd fail → emit `pipeline:error` and halt
  9. On pass → `render` (Renderer)

**And** the Orchestrator emits these events on its Node `EventEmitter` instance:
  - `pipeline:stage-update` → `{ stage: StageName }`
  - `pipeline:retry` → `{ attempt: number; max: number }` (e.g. `{ attempt: 2, max: 3 }`)
  - `pipeline:complete` → `{ pdfBuffer: Buffer; title: string }`
  - `pipeline:error` → `{ stage: StageName; cause: string }`

**And** the Orchestrator imports nothing from Electron
**And** all module calls are wrapped — a module that throws internally returns `Result<never>` before it reaches the Orchestrator
**And** `pipeline-orchestrator.test.ts` covers: happy path, fidelity failure → retry → success, 3 fidelity failures → halt, module error → halt

---

### Story 4.2: IPC Bridge (Electron Shell ↔ Core)

As a developer,
I want `ipc-bridge.ts` to subscribe to the Orchestrator's EventEmitter and forward events to the renderer via Electron IPC,
So that the renderer receives pipeline progress without any coupling to `core`.

**Acceptance Criteria:**

**Given** the Orchestrator instance is created in the main process
**When** `registerIpcBridge(orchestrator, webContents)` is called from `main/index.ts`
**Then** `ipc-bridge.ts` subscribes to all 4 Orchestrator events and forwards them to the renderer via `webContents.send(channelName, payload)`
**And** `pipeline:retry` is forwarded as human-readable text "Retrying transformation — attempt N of 3"
**And** `pipeline:complete` triggers the save dialog flow (calls `dialog.showSaveDialog` via `ipcMain.handle`)
**And** `pipeline:run` is handled via `ipcMain.handle('pipeline:run', ...)` — receives `PipelineInput` from renderer and starts the Orchestrator
**And** `ipc-bridge.ts` is the only file in the project that imports `ipcMain` from `electron` (grep confirmed)
**And** `ipcMain.handle()` is used for all request/response patterns; `webContents.send()` is used for all fire-and-forget pipeline events

---

### Story 4.3: ProcessingScreen with Stage Progress

As a user,
I want to see the active pipeline stage update in real time while my content is being processed,
So that I know Bookit is working and can see where it is in the pipeline.

**Acceptance Criteria:**

**Given** I submit content from the InputScreen
**When** the pipeline starts
**Then** `ProcessingScreen.tsx` replaces `InputScreen.tsx` immediately
**And** `StageProgress.tsx` displays the active stage label, updating as each stage completes: Extracting → Transforming → Validating → Rendering
**And** on a retry event, the label updates to "Retrying transformation — attempt 2 of 3" (or "attempt 3 of 3")
**And** the stage label is visible for the entire duration of processing; no blank states
**And** the renderer subscribes to `pipeline:stage-update` and `pipeline:retry` via `ipcRenderer.on()` in `use-pipeline.ts`

---

### Story 4.4: ErrorScreen (Stage-Level Failure)

As a user,
I want to see exactly which stage failed and why when processing cannot complete,
So that I understand what happened and can decide to start over with different input.

**Acceptance Criteria:**

**Given** the pipeline emits `pipeline:error` with `{ stage, cause }`
**When** the renderer receives the event
**Then** `ErrorScreen.tsx` replaces `ProcessingScreen.tsx`
**And** the error heading names the stage explicitly: e.g. "Extraction Failed", "Transformation Failed", "Validation Failed", "Rendering Failed"
**And** the error body shows the cause string (e.g. "No transcript available for this video" / "Validation failed after 3 attempts — fidelity check could not be satisfied")
**And** a "Start Over" button returns the user to `InputScreen.tsx` (clearing all state)
**And** no PDF file is written to disk on any error path
**And** error message language is direct: no "Sorry", no "Unfortunately", no apologetic language

---

## Epic 5: Content Transformation

**Goal:** Before any AI call, a deterministic Technique Selector evaluates Source Content and returns the technique list. The Transformer uses that list to call the AI Transformation slot and produce structured Transformed Content. Token usage is logged for every run.

**Covers:** FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, NFR-5

---

### Story 5.1: Technique Selector Module

As a developer,
I want a stateless, deterministic Technique Selector that evaluates Source Content against defined rules and returns the technique list,
So that technique selection is reproducible, testable, and happens before any AI call.

**Acceptance Criteria:**

**Given** any `SourceContent` text
**When** `selectTechniques(sourceContent)` is called
**Then** it returns a `TechniqueList` with:
  - `always`: `['BLUF', 'teach-not-label-headings', '60-second-cheat-sheet']` — always present, never conditional
  - `conditional`: subset of `['mental-buckets', 'jargon-translation', 'facts-implications']` based on rules below

**And** the following conditional rules apply:
  - `mental-buckets` → included when word count ≥ 1,500 (config constant in `rules.ts`: `MENTAL_BUCKET_THRESHOLD = 1500`) OR when multiple distinct topics are detected
  - `jargon-translation` → included when technical or domain-specific terms are detected
  - `facts-implications` → included when content is primarily factual or assertive (rule-based classification, no AI call)

**And** the same Source Content always produces the same technique list (pure function, no randomness)
**And** `TechniqueList` includes a `conditionLog: Record<string, string>` explaining why each conditional technique was included or excluded (feeds FR-14)
**And** `MENTAL_BUCKET_THRESHOLD` is a named constant in `technique-selector/rules.ts` (not hardcoded inline)
**And** `technique-selector.test.ts` covers: short content (no buckets), long content (buckets), jargon-heavy content, factual content, multi-topic content, combined conditions

---

### Story 5.2: Transformer Module

As a developer,
I want a Transformer module that takes Source Content + technique list + factual claims and calls the AI Transformation slot to produce structured Transformed Content,
So that the AI executes exactly the selected techniques and returns a structured result the rest of the pipeline can trust.

**Acceptance Criteria:**

**Given** `SourceContent`, `TechniqueList`, and `FactualClaim[]`
**When** `transform(input, providerConfig)` is called
**Then** it calls the Transformation model slot via `aiClient.generateText()` with the prompt from `transformer/prompts.ts`
**And** the prompt instructs the model to: apply only the techniques in `TechniqueList`, restructure (not summarize), not add or invent factual claims
**And** the response is parsed into a `TransformedContent` object with typed sections: BLUF, body sections with teach-not-label headings, 60-second cheat sheet, and any applicable conditional sections
**And** the function returns `Result<TransformedContent>` — never throws across the boundary
**And** `TransformedContent` includes `techniqueAudit` from the technique selector's `conditionLog` (passed through from `TechniqueList`)
**And** the token usage from the AI call is returned as part of the `Result` value for the Orchestrator to log
**And** the prompt is in `transformer/prompts.ts` — not inline in `transformer.ts`
**And** `transformer.test.ts` covers: happy path (mocked AI), AI error wrapped as `Result<never>`, technique list with all conditionals, technique list with none

---

### Story 5.3: Token Logger

As a developer,
I want every pipeline run to append one structured JSON log entry to a `.jsonl` file in the app's user data directory,
So that per-call token usage is tracked for analysis and never lost, without any impact on pipeline execution.

**Acceptance Criteria:**

**Given** a pipeline run completes (success, fidelity failure, or error)
**Then** a JSON object is appended to `{app.getPath('userData')}/bookit-token-log.jsonl` conforming to this schema:

```json
{
  "runId": "<uuid>",
  "timestamp": "<ISO-8601>",
  "inputType": "paste|file|youtube",
  "sourceChars": 8420,
  "visualStyle": "orbital-light|orbital-night",
  "outcome": "success|fidelity_failure|error",
  "attempts": 1,
  "tokenUsage": {
    "_note": "Actual token counts.",
    "titleDerive":  { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 150, "out": 15 },
    "claimExtract": { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 2800, "out": 340 },
    "transform_1":  { "provider": "anthropic", "model": "claude-sonnet-4-6", "in": 3400, "out": 3200 },
    "validate_1":   { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 4100, "out": 80 },
    "totals":       { "in": 10450, "out": 3635 }
  },
  "estimatedCostUSD": {
    "_note": "Estimated at app build time. Use tokenUsage for current calculations.",
    "_buildDate": "2026-06-18",
    "total": 0.1047
  }
}
```

**And** for Ollama (local model) runs, `estimatedCostUSD` shows `"actualCost": 0.00` and `"cloudEquivalentEstimate"` for reference
**And** the log is append-only — existing entries are never modified or overwritten
**And** any error during log write is caught silently and does not interrupt or crash the pipeline
**And** `token-logger.ts` lives in `core/orchestrator/` and is called by the Orchestrator after every run (success or failure)
**And** retry attempts are logged as `transform_2`, `validate_2`, `transform_3`, `validate_3` when they occur

---

## Epic 6: Source Fidelity Validation

**Goal:** Every Factual Claim from Source Content is extracted (via AI, once per session) before Transformation begins. After each Transformation attempt, the Validator checks every claim against the Transformed Content. Failed validations trigger automatic retries up to 3 total attempts. Unvalidated content never reaches rendering.

**Covers:** FR-15, FR-16, FR-17, FR-18

---

### Story 6.1: Claim Extractor Module

As a developer,
I want a Claim Extractor module that uses the Validation/Utility AI slot to extract Factual Claims at the semantic level from Source Content,
So that the Validator has a precise reference set for checking transformed output.

**Acceptance Criteria:**

**Given** a `SourceContent` object
**When** `extractClaims(sourceContent, providerConfig)` is called
**Then** it calls the Validation/Utility model slot via `aiClient.generateText()` with the prompt from `claim-extractor/prompts.ts`
**And** the prompt instructs extraction at the semantic level — "extract the meaning of each factual assertion, not the exact quoted string"
**And** the response is parsed into `FactualClaim[]` where each entry has `{ id: uuid, text: string }`
**And** the function returns `Result<FactualClaim[]>` — never throws across the boundary
**And** extraction runs exactly once per pipeline session (before the first Transformer call); the Orchestrator does not re-run extraction on retries
**And** the Source Content is not modified by extraction
**And** token usage for the extraction call is returned for logging
**And** the prompt is in `claim-extractor/prompts.ts` — not inline in `claim-extractor.ts`
**And** `claim-extractor.test.ts` covers: typical factual article (mocked AI), AI error wrapped as `Result<never>`, empty content edge case

---

### Story 6.2: Validator Module + Retry Logic in Orchestrator

As a developer,
I want a Validator module that checks all Factual Claims against the Transformed Content, and for the Orchestrator to implement the retry loop that retries Transformation on failure (max 3 total attempts),
So that fidelity validation is enforced and no unvalidated content reaches the Renderer.

**Acceptance Criteria:**

**Given** `TransformedContent` and `FactualClaim[]`
**When** `validate(transformed, claims, providerConfig)` is called
**Then** it calls the Validation/Utility model slot with the prompt from `validator/prompts.ts`
**And** the prompt checks each claim semantically: "Is the meaning of this claim present and accurately represented in the transformed content?"
**And** it returns `Result<{ passed: boolean; failedClaims: FailedClaim[] }>`
**And** `passed: true` only when all claims are accurately represented
**And** `passed: false` when any claim is absent, altered, or contradicted — `failedClaims` lists which ones and why

**And** in the Orchestrator, when `validate` returns `passed: false`:
  - If attempt < 3: emit `pipeline:retry { attempt: N, max: 3 }`, call `transform` again with original `SourceContent` and `TechniqueList`, then call `validate` again
  - If attempt === 3: emit `pipeline:error { stage: 'Validating', cause: 'Validation failed after 3 attempts — fidelity check could not be satisfied' }`

**And** no `render` call is ever made unless `validate` returns `passed: true`
**And** the prompt is in `validator/prompts.ts` — not inline in `validator.ts`
**And** `validator.test.ts` covers: all claims present (pass), missing claim (fail), altered claim (fail), mocked AI error

---

## Epic 7: PDF Rendering

**Goal:** Validated Transformed Content is rendered into a styled PDF via Playwright. Both Orbital Light and Orbital Night styles are supported. Adding a new style requires only a new spec + HTML template. The Renderer never alters content.

**Covers:** FR-19, FR-20, FR-21, FR-22

---

### Story 7.1: Visual Style Specs & HTML Templates (Orbital Light + Orbital Night)

As a developer,
I want both Orbital Light and Orbital Night HTML templates built from their YAML-frontmatter specs and font assets bundled,
So that the Renderer has fully-specified, self-contained templates to render from.

**Acceptance Criteria:**

**Given** the canonical specs at `ORBITAL-LIGHT.md` and `ORBITAL-NIGHT.md`
**Then** `packages/core/src/modules/renderer/templates/orbital-light.html` is implemented with:
  - White/off-white base background
  - Ink-black body text (Hanken Grotesk)
  - Anton for display headings
  - JetBrains Mono for code/labels
  - Accent-blue (`#0052ff` — verify against spec before use) for key terms
  - Acid-yellow (`#c7f300`) for action badges / 60-second cheat sheet accent
  - Sharp corners, thick borders, corner bracket decorative elements

**And** `packages/core/src/modules/renderer/templates/orbital-night.html` is implemented with:
  - Terminal Black (`#131313`) base
  - Acid-yellow (`#c7f300`) and white accents
  - Same typography scale and structural elements as Orbital Light
  - Screen-optimized colorway

**And** both templates use CSS variables for ALL color tokens (populated at render time from YAML frontmatter, not hardcoded)
**And** both templates reference fonts via `@font-face` pointing to `../assets/fonts/` local paths
**And** `packages/core/src/modules/renderer/assets/fonts/` contains: `Anton-Regular.ttf`, `HankenGrotesk-Regular.ttf` (and weight variants used), `JetBrainsMono-Medium.ttf`
**And** both templates define named template slot markers (e.g. `{{BLUF_SECTION}}`, `{{BODY_SECTIONS}}`, `{{CHEAT_SHEET}}`) for content injection

---

### Story 7.2: Style Registry + Renderer Module

As a developer,
I want a Style Registry mapping style names to spec + template paths, and a Renderer module that injects CSS tokens, populates template slots, and calls Playwright to produce a PDF buffer,
So that rendering is driven by spec files and adding a new style requires only one registry entry.

**Acceptance Criteria:**

**Given** `TransformedContent` and a `StyleName` (`'orbital-light'` or `'orbital-night'`)
**When** `render(transformedContent, styleName)` is called
**Then** `style-registry.ts` maps the style name to `{ specPath, templatePath }`

**And** the Renderer:
  1. Reads YAML frontmatter from `specPath` → extracts color tokens
  2. Reads `templatePath` → injects color tokens as CSS variable overrides (`<style>:root { --bg: #fff; ... }</style>`)
  3. Populates template slot markers with `TransformedContent` sections (BLUF, body, cheat sheet, etc.)
  4. Launches Playwright headless Chromium and loads the rendered HTML string
  5. Calls `page.pdf({ format: 'A4', printBackground: true, margin: { top: '24mm', right: '20mm', bottom: '24mm', left: '20mm' } })`
  6. Returns `Result<Buffer>` containing the PDF

**And** the Renderer never modifies the text content of `TransformedContent` — only visual presentation
**And** Playwright runs in the Electron main process (not renderer)
**And** adding a new style requires: 1 spec file + 1 HTML template + 1 entry in `style-registry.ts` — no other file changes
**And** `renderer.test.ts` covers: orbital-light renders valid PDF buffer (mocked Playwright), orbital-night renders valid PDF buffer, missing style name returns `Result<never>` with `PipelineError`

---

## Epic 8: Output Delivery

**Goal:** After pipeline success, the user chooses a save location via a native Windows dialog. The file is written only after confirmation. The SuccessScreen shows the save path and offers to open the file.

**Covers:** FR-23, FR-24, UX-DR6

---

### Story 8.1: Save Dialog & Success Screen

As a user,
I want a native Windows save dialog to appear after my Reading Artifact is ready, and clear confirmation when the PDF is saved,
So that I control where the file goes and know exactly where to find it.

**Acceptance Criteria:**

**Given** the pipeline emits `pipeline:complete` with `{ pdfBuffer: Buffer, title: string }`
**When** the IPC bridge receives this event
**Then** `dialog.showSaveDialog` opens with:
  - Default filename: `{sanitized-title}.pdf`
  - Filter: `{ name: 'PDF', extensions: ['pdf'] }`
  - Default path: last-used save directory (persisted in settings-store), or user's Documents folder

**When** I confirm a save location
**Then** the PDF buffer is written to disk at the confirmed path
**And** `SuccessScreen.tsx` replaces `ProcessingScreen.tsx` showing:
  - Heading: "Reading Artifact Saved"
  - The full save path
  - "Open File" button — calls `shell.openPath(savedPath)` to open in system default PDF viewer
  - "Process Another" button — returns to `InputScreen.tsx` (clears all state)

**When** I cancel the save dialog
**Then** no file is written to disk
**And** the pipeline result (PDF buffer) remains available in memory for the duration of the app session
**And** the ProcessingScreen remains showing with an option to retry the save dialog

**And** the save path's parent directory is persisted to settings-store as the next default save location
**And** `FR-7` is enforced: no PDF is ever written unless the pipeline completed all 4 stages successfully

---

## Epic 9: End-to-End Integration & Distribution

**Goal:** All modules are wired together in the Electron app, the full pipeline runs from InputScreen to SuccessScreen, and the app builds into a self-contained Windows `.exe` distributable.

**Covers:** NFR-1, NFR-2, NFR-3, NFR-6

---

### Story 9.1: Full Pipeline Integration (Wiring All Modules)

As a developer,
I want all 5 pipeline modules wired through the Orchestrator and the full user journey — from InputScreen submission through SuccessScreen save — working end to end in the Electron app,
So that all module handoff contracts are exercised in their real execution context before packaging.

**Acceptance Criteria:**

**Given** a sample plain-text document is submitted from the InputScreen
**When** the full pipeline runs with real AI calls (Anthropic Sonnet for Transformation, Haiku for Validation/Claim Extraction)
**Then** all 5 modules execute in sequence: title derivation → ClaimExtractor → TechniqueSelector → Transformer → Validator → Renderer
**And** the ProcessingScreen updates stage labels in real time (Extracting → Transforming → Validating → Rendering)
**And** the SuccessScreen appears and "Open File" opens a valid, visually styled PDF
**And** `bookit-token-log.jsonl` is written with a correctly structured entry
**And** no module throws an unhandled exception (all errors route through `Result<T>` to `pipeline:error`)

**And** a fidelity failure scenario is tested: if the Validator mock returns `passed: false` on attempt 1 and `passed: true` on attempt 2, the ProcessingScreen shows the retry label and the pipeline eventually succeeds

**And** an error scenario is tested: if Intake fails (invalid YouTube URL), the ErrorScreen shows "Extraction Failed" with the correct cause

**And** this integration test runs in CI (`.github/workflows/build.yml`)

---

### Story 9.2: Windows Executable Distribution

As a developer,
I want the app to build into a self-contained Windows `.exe` via electron-builder,
So that Bookit can be downloaded from GitHub and run on any Windows 11 machine without additional installs.

**Acceptance Criteria:**

**Given** `forge.config.ts` is configured with `@electron-forge/maker-squirrel` (or `@electron-forge/maker-nsis`) targeting Windows
**When** `npm run make` is run from the workspace root
**Then** a self-contained Windows installer or portable `.exe` is produced in the `out/` directory
**And** the `.exe` bundles: all npm dependencies, Playwright Chromium binary, all font assets, both HTML templates, both YAML style specs
**And** running the `.exe` on a fresh Windows 11 machine with no Node.js installed launches the app successfully
**And** the first launch triggers the SetupWizard (no pre-existing settings)
**And** the GitHub Actions `build.yml` adds a `make` job that produces the `.exe` as a workflow artifact
**And** the artifact is named `bookit-v2-win32-x64.exe` (or equivalent) for GitHub Release use

---

## Implementation Notes for Developer Agent

### Module Test Coverage Requirements

Every module listed below **must** have a co-located `.test.ts` file before the story is marked complete:

| Module | Test File |
|---|---|
| `core/modules/intake/intake.ts` | `intake.test.ts` |
| `core/modules/technique-selector/technique-selector.ts` | `technique-selector.test.ts` |
| `core/modules/claim-extractor/claim-extractor.ts` | `claim-extractor.test.ts` |
| `core/modules/transformer/transformer.ts` | `transformer.test.ts` |
| `core/modules/validator/validator.ts` | `validator.test.ts` |
| `core/modules/renderer/renderer.ts` | `renderer.test.ts` |
| `core/services/ai-client/ai-client.ts` | `ai-client.test.ts` |
| `core/orchestrator/pipeline-orchestrator.ts` | `pipeline-orchestrator.test.ts` |

### Naming Conventions (from ARCHITECTURE.md)

| Thing | Convention |
|---|---|
| Source files | `kebab-case.ts` |
| React components | `PascalCase.tsx` |
| TypeScript types | `PascalCase` |
| Functions / variables | `camelCase` |
| IPC event names | `namespace:action` |
| Constants | `SCREAMING_SNAKE_CASE` |
| HTML templates | `kebab-case.html` |

### Error Contract (from ARCHITECTURE.md)

Every module function must return `Result<T>`:

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: PipelineError }
```

Never propagate raw exceptions across module boundaries. Catch internally and wrap as `Result<never>`.

### Story Sequencing Recommendation

Epics 1 and 2 are prerequisites for all other epics. Within each epic, stories are ordered by dependency — execute them in the order listed. Epic 9 is the integration epic and depends on all others being complete.

**Suggested sprint sequence:**
1. Stories 1.1 → 1.5 (foundation)
2. Stories 2.1 → 2.2 (settings + AI client — unblocks all AI-dependent stories)
3. Stories 3.1 → 3.5 + 4.1 → 4.4 in parallel tracks (intake UI / pipeline orchestration)
4. Stories 5.1 → 5.3 + 6.1 → 6.2 in parallel (transformation / validation)
5. Stories 7.1 → 7.2 (rendering)
6. Story 8.1 (output delivery)
7. Stories 9.1 → 9.2 (integration + distribution) — after all prior stories complete
8. Stories 2.3 → 2.4 (setup wizard + settings UI) — can overlap with story 9.x

---

## Phase 2: MCP Server

> **Source:** `docs/PRD-MCP-addendum.md`
> **Architecture:** `docs/ARCHITECTURE.md` §Decision 2 Addendum
> **Prerequisite:** All Phase 1 epics (1–9) complete. `@bookit/core` is the shared pipeline — no changes to core required.

---

## Epic 10: MCP Server Foundation

**Goal:** Establish the `packages/mcp-server` package as a real, runnable Node.js MCP server that registers the `bookit_transform` tool and can be connected to by Claude Desktop or Cursor. No pipeline logic lives here — only the shell, configuration, and tool registration.

**Covers:** MCP-FR-001 (inputs), MCP-FR-002 (env config), MCP-FR-003 (outputs, structure only)

---

### Story 10.1: Package Setup and MCP SDK Integration

As a developer,
I want `packages/mcp-server` to be a properly configured TypeScript Node.js package with `@modelcontextprotocol/sdk` installed and a running stdio MCP server,
So that Claude Desktop and Cursor can connect to it and discover the `bookit_transform` tool.

**Acceptance Criteria:**

**Given** the MCP server package is built and launched via `node dist/index.js`
**When** Claude Desktop connects using the stdio transport
**Then** the server responds to the MCP `initialize` handshake successfully
**And** `tools/list` returns exactly one tool: `bookit_transform` with its full input schema
**And** the server process stays alive and does not exit on connection

**And** the `packages/mcp-server/package.json` declares:
- `"name": "@bookit/mcp-server"`
- `"type": "module"` or `"main"` pointing to compiled output
- A `"build"` script that compiles TypeScript to `dist/`
- A `"start"` script: `node dist/index.js`
- A `"postinstall"` script: `npx playwright install chromium`
- Dependencies: `@modelcontextprotocol/sdk`, `@bookit/core`
- No Electron dependencies

**And** `tsconfig.json` extends `../../tsconfig.base.json` and compiles to `dist/`

**And** the tool input schema exposes:
```json
{
  "content": { "type": "string", "description": "Raw text, markdown, or YouTube URL" },
  "filePath": { "type": "string", "description": "Absolute path to .md or .txt file" },
  "style": { "type": "string", "enum": ["orbital-light", "orbital-night"], "default": "orbital-light" },
  "title": { "type": "string", "description": "Optional document title" },
  "outputDir": { "type": "string", "description": "Output directory for the PDF" },
  "verbose": { "type": "boolean", "default": false }
}
```

---

### Story 10.2: Environment Variable Configuration

As a developer,
I want the MCP server to read all AI provider credentials and settings from `BOOKIT_*` environment variables,
So that the server can be configured without touching the Electron keytar store and users can set API keys in their MCP host configuration.

**Acceptance Criteria:**

**Given** the server starts with `BOOKIT_ANTHROPIC_KEY` set in the environment
**When** `bookit_transform` is invoked
**Then** it uses the Anthropic provider with the configured key

**And** the following environment variables are supported:

| Variable | Required | Default |
|---|---|---|
| `BOOKIT_ANTHROPIC_KEY` | If using Anthropic | — |
| `BOOKIT_GOOGLE_KEY` | If using Google | — |
| `BOOKIT_OLLAMA_URL` | If using Ollama | `http://localhost:11434` |
| `BOOKIT_TRANSFORM_PROVIDER` | No | `anthropic` |
| `BOOKIT_TRANSFORM_MODEL` | No | `claude-sonnet-4-5` |
| `BOOKIT_VALIDATE_PROVIDER` | No | same as transform |
| `BOOKIT_VALIDATE_MODEL` | No | `claude-haiku-4-5` |
| `BOOKIT_OUTPUT_DIR` | No | `~/Documents/Bookit/` |

**And** if the configured provider has no API key set, `bookit_transform` returns an error response with `error.stage: "Configuration"` and `error.cause: "No API key found for provider: anthropic"` — the pipeline does not start

**And** environment variables are read at each tool invocation (not cached at startup)

**And** `src/config/env-config.ts` exports a `readConfig()` function that returns a typed `McpConfig` object and throws a structured config error if required variables are missing

---

## Epic 11: Pipeline Integration and Tool Execution

**Goal:** The `bookit_transform` tool invokes the real `PipelineOrchestrator` from `@bookit/core`, subscribes to its events, runs the full pipeline, saves the PDF, and returns a structured result to the MCP host.

**Covers:** MCP-FR-001 (full), MCP-FR-003 (full), MCP-FR-004, MCP-FR-005, MCP-FR-006

---

### Story 11.1: Input Validation and Intake

As a developer,
I want the `bookit_transform` tool to validate its inputs and route content through the correct `@bookit/core` intake function before the pipeline starts,
So that bad inputs fail fast with clear errors before any AI calls are made.

**Acceptance Criteria:**

**Given** `bookit_transform` is called with `content: "some text"` and `filePath: "/path/to/file.md"` simultaneously
**When** the tool handler runs
**Then** it returns `{ error: { stage: "Configuration", cause: "Provide either content or filePath, not both", retryable: false } }` — no pipeline call is made

**Given** `bookit_transform` is called with neither `content` nor `filePath`
**Then** it returns `{ error: { stage: "Configuration", cause: "content or filePath is required", retryable: false } }`

**Given** `bookit_transform` is called with `content: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"`
**Then** it routes the content through `processYouTubeInput()` from `@bookit/core`

**Given** `bookit_transform` is called with `content: "some plain text"`
**Then** it routes through `processTextInput()` from `@bookit/core`

**Given** `bookit_transform` is called with `filePath: "/path/to/doc.md"`
**Then** it routes through `processFileInput()` from `@bookit/core`

**And** all intake errors (`Result.ok === false`) are mapped to an MCP tool error response with the stage and cause from the `PipelineError` — the pipeline does not continue

---

### Story 11.2: Pipeline Orchestration and PDF Save

As a developer,
I want the `bookit_transform` tool to run the full `PipelineOrchestrator` pipeline from `@bookit/core`, collect its result, save the PDF to the output directory, and return the file path to the caller,
So that a successful tool call always produces a real PDF on disk.

**Acceptance Criteria:**

**Given** a valid source content input and a configured provider
**When** `bookit_transform` runs the pipeline
**Then** `PipelineOrchestrator.runPipeline()` is called with the correct `PipelineInput`
**And** the orchestrator subscribes to `pipeline:complete`, `pipeline:error`, and `pipeline:retry` events
**And** on `pipeline:complete`, the PDF buffer is written to `<outputDir>/<sanitizedTitle>.pdf`
**And** if the output file already exists, a numeric suffix is appended (`<title> (2).pdf`, `<title> (3).pdf`, etc.)
**And** the tool returns:
```json
{
  "filePath": "/Users/jason/Documents/Bookit/My Article.pdf",
  "title": "My Article",
  "style": "orbital-light",
  "attempts": 1,
  "tokenSummary": { "totalIn": 12400, "totalOut": 3800 }
}
```

**And** on `pipeline:error`, the tool returns:
```json
{
  "error": {
    "stage": "Transforming",
    "cause": "AI API rate limit exceeded",
    "retryable": true
  }
}
```

**And** the output directory is created if it does not exist (recursive `mkdir`)

**And** the sanitized filename strips characters illegal on Windows and macOS filesystems (`/ \ : * ? " < > |`) and trims to 100 characters max

---

### Story 11.3: Verbose Mode and Stage Timing

As a developer,
I want the `bookit_transform` tool to optionally return per-stage timing information when `verbose: true` is set,
So that the user can see how long each pipeline stage took in the tool response.

**Acceptance Criteria:**

**Given** `bookit_transform` is called with `verbose: false` (or `verbose` not provided)
**When** the pipeline completes
**Then** the response does not include `stages` timing data

**Given** `bookit_transform` is called with `verbose: true`
**When** the pipeline completes
**Then** the response includes:
```json
{
  "stages": {
    "extracting": "1.2s",
    "transforming": "18.4s",
    "validating": "3.1s",
    "rendering": "4.7s"
  }
}
```
**And** stage timings are measured wall-clock time from the start of each `pipeline:stage-update` event to the next

---

### Story 11.4: Token Logging

As a developer,
I want every `bookit_transform` call to append a structured entry to `bookit-token-log.jsonl`,
So that all pipeline runs — both Electron and MCP — are tracked in a single log.

**Acceptance Criteria:**

**Given** a `bookit_transform` call completes (success or failure)
**When** the pipeline finishes
**Then** a log entry is appended to `~/Documents/Bookit/bookit-token-log.jsonl`
**And** the entry's `inputType` field is `"mcp"` (not `"paste"` / `"file"` / `"youtube"`) to distinguish MCP runs
**And** the log schema is otherwise identical to the Electron app's token log format
**And** if the log write fails, the failure is caught silently — it must never cause the tool to return an error or throw

---

## Epic 12: Distribution and Host Configuration

**Goal:** The MCP server is runnable from Claude Desktop and Cursor via a simple configuration entry, and the setup process is documented. The CI workflow optionally builds the MCP server.

**Covers:** NFR-MCP-001 (Claude Desktop config), NFR-MCP-002 (Cursor config), NFR-MCP-003 (documentation)

---

### Story 12.1: Claude Desktop Configuration

As a user,
I want a documented, copy-paste Claude Desktop config entry that launches the Bookit MCP server,
So that I can add Bookit to Claude Desktop without reading source code.

**Acceptance Criteria:**

**Given** the MCP server is built (`npm run build` in `packages/mcp-server`)
**When** the following entry is added to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):
```json
{
  "mcpServers": {
    "bookit": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "BOOKIT_ANTHROPIC_KEY": "sk-ant-...",
        "BOOKIT_OUTPUT_DIR": "C:\\Users\\Jason\\Documents\\Bookit"
      }
    }
  }
}
```
**Then** Claude Desktop connects to the Bookit MCP server on startup
**And** the `bookit_transform` tool appears in Claude's tool list
**And** a message like "Transform this article: [text]" causes Claude to invoke `bookit_transform` and return the PDF path

**And** the configuration snippet is documented in `docs/MCP-SETUP.md` with path placeholders and inline comments

---

### Story 12.2: Cursor Configuration

As a user,
I want a documented Cursor MCP configuration that launches the Bookit MCP server,
So that I can call `bookit_transform` from within Cursor without switching to another app.

**Acceptance Criteria:**

**Given** the MCP server is built
**When** the following is added to `.cursor/mcp.json` in the workspace root (or the global Cursor MCP config):
```json
{
  "mcpServers": {
    "bookit": {
      "command": "node",
      "args": ["/absolute/path/to/packages/mcp-server/dist/index.js"],
      "env": {
        "BOOKIT_ANTHROPIC_KEY": "sk-ant-..."
      }
    }
  }
}
```
**Then** Cursor can invoke `bookit_transform` from the assistant panel
**And** the configuration is documented in `docs/MCP-SETUP.md`

---

### Story 12.3: MCP Setup Documentation

As a user,
I want a single setup document that explains how to install, configure, and use the Bookit MCP server,
So that setup takes under 10 minutes from a fresh install.

**Acceptance Criteria:**

**Given** `docs/MCP-SETUP.md` exists
**Then** it contains:
1. **Prerequisites** — Node.js 20+, built MCP server (`npm run build`)
2. **Step 1** — Install Playwright Chromium: `npm install` runs `postinstall` automatically
3. **Step 2** — Claude Desktop config snippet with all env vars documented
4. **Step 3** — Cursor config snippet
5. **Step 4** — Example tool invocations:
   - "Bookit this YouTube video: https://..."
   - "Transform this file: /path/to/article.md with orbital-night style"
6. **Environment variable reference** table (all `BOOKIT_*` vars, purpose, required/optional, default)
7. **Troubleshooting** — common errors (missing API key, missing Chromium, output dir not writable)

---

## Implementation Notes for Developer Agent (Phase 2)

### Package Structure
```
packages/mcp-server/
  package.json           ← @bookit/mcp-server; deps: @modelcontextprotocol/sdk, @bookit/core
  tsconfig.json          ← extends ../../tsconfig.base.json; outDir: dist/
  src/
    index.ts             ← server entry: create McpServer, register tools, start stdio transport
    server.ts            ← McpServer construction and tool registration
    config/
      env-config.ts      ← readConfig(): validates BOOKIT_* env vars, returns McpConfig
    tools/
      bookit-transform.ts  ← tool handler: validation, intake, pipeline, file write, response
```

### Key Constraints
- **Zero Electron dependencies** — `packages/mcp-server` imports only `@bookit/core`, `@modelcontextprotocol/sdk`, and Node.js builtins
- **`@bookit/core` is not modified** — the MCP server is a consumer, not a modifier
- **Same `Result<T>` contract** — all errors from core modules flow through `Result<T>`, mapped to MCP tool error responses at the shell boundary
- **No `ipcMain` or `ipcRenderer`** — those live exclusively in `packages/electron-app`
- **Token log path** — `~/Documents/Bookit/bookit-token-log.jsonl` (uses `os.homedir()`, not Electron's `app.getPath()`)

### Naming Conventions
Same as the rest of the project (from ARCHITECTURE.md). Tool name: `bookit_transform` (snake_case per MCP convention).

### Story Sequencing
1. Story 10.1 → 10.2 (foundation — package setup, env config)
2. Story 11.1 (input validation — can be built and unit-tested before pipeline wiring)
3. Story 11.2 (pipeline + file save — core functional story)
4. Story 11.3 (verbose mode — additive, can be done last)
5. Story 11.4 (token logging — additive, low risk)
6. Story 12.1 → 12.2 → 12.3 (distribution + docs — after pipeline works end-to-end)
