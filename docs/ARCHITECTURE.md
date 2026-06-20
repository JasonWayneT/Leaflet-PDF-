---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: complete
completedAt: '2026-06-18'
inputDocuments:
  - docs/product-brief.md
  - docs/PRD.md
  - docs/addendum.md
  - docs/.decision-log.md
  - docs/spec/04-design-specs/ORBITAL-LIGHT.md
workflowType: architecture
project_name: Leaflet PDF
user_name: Jason
date: 2026-06-18
---

# Architecture Decision Document — Leaflet PDF

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

---

## Starter Template Evaluation

### Primary Technology Domain

Windows desktop application — Electron with TypeScript.

### Selected Stack: Electron + TypeScript via electron-forge (Vite template)

**Rationale:** Full HTML/CSS/React UI flexibility; Playwright for PDF rendering (HTML/CSS → PDF, Orbital Light spec maps directly to CSS); `youtube-transcript` npm package is a JS-native equivalent of the Python library with no subprocess required; `@anthropic-ai/sdk` TypeScript SDK is first-class; `electron-builder` for Windows `.exe` distribution.

**Initialization Command:**

```bash
npm create electron-app@latest Leaflet PDF-v2 -- --template=vite-typescript
```

Then add:
```bash
npm install react react-dom @types/react @types/react-dom
npm install @anthropic-ai/sdk
npm install youtube-transcript
npm install playwright
```

**Architectural Decisions Established by Starter:**
- Language: TypeScript throughout (main process + renderer process)
- Bundler: Vite — fast dev, clean production builds
- Process model: Electron main/renderer split — main handles pipeline + AI + file I/O; renderer handles UI state + display
- UI layer: React in the renderer process
- PDF renderer: Playwright — headless Chromium renders HTML template with Orbital Light CSS to PDF
- YouTube extraction: `youtube-transcript` npm — no API key required
- Distribution: `electron-builder` → self-contained Windows `.exe`

**Note:** Project scaffolding is the first implementation story.

---

## Core Architectural Decisions

### Decision 1: AI Model Selection + Provider Architecture

**Decision:** Two-tier model slots (Transformation / Validation+Utility) with BYOA multi-provider support.

**Providers in scope for v2:** Anthropic (Claude), Google (Gemini), Ollama (local), MCP Sampling (host-delegated — see Decision 1 Addendum).

**Default assignments:**
- Transformation slot: `claude-sonnet-4-6` — quality-critical restructuring
- Validation/Utility slot: `claude-haiku-4-5` — claim checking, title extraction, claim extraction

**SDK:** Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/google` + `@ai-sdk/ollama`) — unified `generateText()` interface, provider swapped at runtime from user config.

**Provider configuration UX:**
- First-launch wizard: Cloud or Local → provider choice → API key/URL → test connection → auto-assign recommended models to slots
- Ongoing settings: Providers section (status cards) + Model Slots section (Transformation / Validation+Utility, each showing provider + model name with edit)
- Shared provider config (enter Anthropic key once) with per-slot model assignment

**API key storage:** `keytar` (Windows Credential Manager / OS keychain) for secrets. `electron-store` for non-sensitive config (provider type, model name, base URL). Keys never touch `electron-store`.

**Ollama guidance (shown in settings):** minimum 8GB VRAM; recommended model families: Llama 3.x, Mistral, Qwen; note that fidelity retry rate will be higher with weaker local models.

**Web app key security:** Out of scope for v2. Desktop threat model is handled by `keytar`. Web app key architecture is a roadmap item for any future hosted version.

**Packages added:**
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/google @ai-sdk/ollama
npm install electron-store keytar
```

---

### Decision 2: Pipeline Module Structure + Handoff Contracts

**Decision:** 6-module pipeline — 5 execution modules + 1 orchestrator. Modules are stateless; orchestrator owns sequence and retry logic.

**Module map:**
```
Pipeline Orchestrator
  ├── Intake Module
  ├── Technique Selector  (deterministic — no AI)
  ├── Claim Extractor     (method: see Decision 3)
  ├── Transformer         (AI — Transformation model slot)
  ├── Validator           (AI — Validation model slot)
  └── Renderer            (Playwright — no AI)
```

**Handoff contracts:**

| Module | Receives | Returns |
|---|---|---|
| Intake | Raw input (text / file path / YouTube URL) | Source Content (plain text) + input metadata |
| Technique Selector | Source Content | Technique list (always + conditional) + audit log |
| Claim Extractor | Source Content | `FactualClaim[]` |
| Transformer | Source Content + Technique list + `FactualClaim[]` | Transformed Content (structured) |
| Validator | Transformed Content + `FactualClaim[]` | `{ passed: boolean, failedClaims: FailedClaim[] }` |
| Renderer | Transformed Content + style spec path | PDF buffer |

**Error contract:** Every module returns `{ stage: StageName, cause: string, retryable: boolean }` on failure. Stage name is part of the error type — not inferred by the orchestrator. This is what makes FR-6 enforceable.

**Retry logic:** Lives in the Orchestrator, not inside Transformer or Validator. On Validator fail → Orchestrator calls Transformer again with original inputs. Max 3 total attempts.

**Electron IPC:** Pipeline runs in main process. Orchestrator emits events to renderer:
- `pipeline:stage-update` → active stage name
- `pipeline:retry` → "Retrying transformation — attempt 2 of 3"
- `pipeline:complete` → triggers save dialog
- `pipeline:error` → `{ stage, cause }`

Renderer subscribes to events; no polling, no shared state.

**Style extensibility (FR-21):** Renderer receives a path to a style spec file, not a hardcoded style object. New style = new spec file + new HTML template. No other module changes.

---

### Decision 2 Addendum: Monorepo Structure + MCP Readiness

**Decision:** Monorepo from day one using npm workspaces.

```
Leaflet PDF-v2/
  packages/
    core/           ← all pipeline logic, zero Electron dependencies
    electron-app/   ← portfolio app; imports from core
    mcp-server/     ← (Phase 2 roadmap); also imports from core
```

**Rationale:** Jason's primary day-to-day use case is Leaflet PDF as an MCP server (via Cursor, Claude Desktop, or any MCP-compatible host). The Electron app is the GitHub portfolio piece and a working demo of `core`. Both are valid hosts for the same pipeline.

**EventEmitter abstraction:** The Orchestrator in `core` emits events via Node.js built-in `EventEmitter` — never Electron's `ipcMain`. The Electron shell subscribes and bridges to IPC. The MCP server shell subscribes and handles differently. `core` never imports from Electron.

```
core/orchestrator → emits to Node EventEmitter
  electron-app/shell → subscribes → forwards to Electron IPC → renderer
  mcp-server/shell   → subscribes → returns progress to MCP client (future)
```

**MCP server scope:** Phase 2 roadmap item. Building `core` correctly now makes it a wrapper, not a rewrite.

---

### Decision 1 Addendum: MCP Sampling Provider

**Decision:** Add `'mcp-sampling'` as a fourth provider mode in `ProviderConfig`. When active, AI inference is delegated to the MCP host via `sampling/createMessage` rather than to an external API.

**When it activates:**
- Explicit: `LEAFLETPDF_TRANSFORM_PROVIDER=mcp-sampling`
- Auto-detect: no API key present and no `LEAFLETPDF_OLLAMA_URL` set

**How it works:** The MCP server builds a `ProviderConfig` object whose `createMessage` callback calls `server.request('sampling/createMessage', ...)`. The MCP SDK routes this request to the connected client (Claude Desktop, Cursor, etc.), which fulfills it using the user's active session. The response comes back through the same stdio transport. From the pipeline's perspective, this is indistinguishable from any other provider — `aiClient.generateText()` receives the same `Result<AiTextResponse>` shape.

**Provider resolution order (MCP server only):**
```
LEAFLETPDF_TRANSFORM_PROVIDER=mcp-sampling  → sampling (explicit)
No API keys + no LEAFLETPDF_OLLAMA_URL       → sampling (auto-detect)
LEAFLETPDF_ANTHROPIC_KEY present             → Anthropic (direct)
LEAFLETPDF_GOOGLE_KEY present                → Google (direct)
LEAFLETPDF_OLLAMA_URL present                → Ollama (direct)
```

**Constraints:**
- Token counts are unavailable in sampling mode — `tokenSummary` reports `{ input: 0, output: 0 }`
- The host controls model selection; Leaflet PDF cannot guarantee which model is used
- Requires a sampling-capable MCP host (Claude Desktop, recent Cursor)

**Implemented in:** CR-003. Decision logged as DEC-023.

---

### Decision 3: Factual Claim Extraction Method

**Decision:** Dedicated AI call using the Validation/Utility model slot (Option A).

**Rationale:** Highest accuracy for the kinds of content Leaflet PDF handles — YouTube transcripts, technical articles, dense non-fiction where factual claims aren't always in clean declarative sentences. Token cost at Haiku/Flash pricing is negligible for a personal tool (~$0.001–0.003 per run on a 2,000-word document). Rule-based NLP risks brittle extraction that produces false validation failures — the wrong trade for a tool where fidelity is the core trust signal.

**Local/Ollama mode:** Claim Extractor uses the Validation/Utility slot regardless of provider. Local models increase fidelity failure rate; the retry loop (up to 3 attempts) absorbs variance. Settings screen surfaces a guidance note when Ollama is configured for either slot.

**Extraction prompt guidance:** The prompt instructs the model to extract claims at the semantic level — not as quoted strings. The Validator checks whether the meaning is preserved, not whether exact phrasing appears. This reduces false failures from legitimate paraphrasing during transformation.

---

### Decision 4: Visual Style System — Orbital Light + Orbital Night

**Decision:** Two Visual Styles ship in v2 MVP: Orbital Light (light ground) and Orbital Night (dark ground). User selects at submission time; Orbital Light is the default.

**Style identity:**
- **Orbital Light** — white/off-white base, ink-black text, accent-blue (#0052ff, verify) for key terms, acid-yellow (#c7f300) for action badges. Print and tablet-friendly. Spec: `ORBITAL-LIGHT.md` (created architecture session).
- **Orbital Night** — Terminal Black (#131313) base, acid-yellow and white accents. Screen-optimised. Spec: `ORBITAL-NIGHT.md` (renamed from `ORBITAL-LIGHT.md`, which described this design).

Both styles share identical typography scale (Anton / Hanken Grotesk / JetBrains Mono), spacing system, and structural elements (corner brackets, barcode strips, thick borders, sharp corners). They differ only in color tokens.

**Renderer architecture:**
1. Parse YAML frontmatter from active style spec → token object
2. Inject tokens as CSS variables into style-specific HTML template
3. Populate template slots with Transformed Content
4. Playwright renders HTML → PDF buffer (A4 portrait, print-background enabled, tablet-reading margins)
5. Return PDF buffer to Orchestrator

**Font bundling:** Anton, Hanken Grotesk, JetBrains Mono ship as static assets with the app. HTML templates load via `@font-face` pointing to local paths accessible to Playwright.

**Style registry:** A simple object mapping style names to spec paths and template paths. New style = new spec + new HTML template + one registry entry. No pipeline changes.

**Note:** `ORBITAL-LIGHT.md` color token `accent-blue: #0052ff` is estimated from design reference — verify before treating as canonical.

---

### Decision 5: Token Budget Instrumentation

**Decision:** Every pipeline run appends one JSON object to a local `.jsonl` log file in the app's user data directory. Per-call token granularity. Two clearly separated fields: actual token counts and estimated cost.

**Log schema:**

```jsonl
{
  "runId": "uuid",
  "timestamp": "ISO-8601",
  "inputType": "paste|file|youtube",
  "sourceChars": 8420,
  "visualStyle": "orbital-light",
  "outcome": "success|fidelity_failure|error",
  "attempts": 2,

  "tokenUsage": {
    "_note": "Actual token counts. Use these for current cost calculations.",
    "claimExtract":  { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 2800, "out": 340  },
    "transform_1":   { "provider": "anthropic", "model": "claude-sonnet-4-6", "in": 3400, "out": 3200 },
    "validate_1":    { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 4100, "out": 80   },
    "titleDerive":   { "provider": "anthropic", "model": "claude-haiku-4-5",  "in": 150,  "out": 15   },
    "totals":        { "in": 18050, "out": 7045 }
  },

  "estimatedCostUSD": {
    "_note": "Estimated at app build time. Rates may have changed — use tokenUsage for current calculations.",
    "_buildDate": "2026-06-18",
    "_rateSource": "Anthropic published pricing at build date",
    "claimExtract": 0.0014,
    "transform":    0.1025,
    "validate":     0.0007,
    "titleDerive":  0.0001,
    "total":        0.1047
  }
}
```

**For Ollama (local models):** Same schema. `tokenUsage` logs actual counts. `estimatedCostUSD` shows cloud equivalent using reference model (Haiku tier), clearly labeled:

```jsonl
"estimatedCostUSD": {
  "_note": "Local model — actual API cost: $0.00. Cloud equivalent shown for reference only.",
  "_referenceModel": "claude-haiku-4-5",
  "_buildDate": "2026-06-18",
  "actualCost": 0.00,
  "cloudEquivalentEstimate": 0.0074
}
```

**Storage:** `.jsonl` file in Electron `app.getPath('userData')`. Appendable, human-readable, no database required. Not surfaced in main UI for v2 — available as a raw file for review and limit-setting analysis.

---

## Implementation Patterns & Consistency Rules

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Source files | `kebab-case` | `ai-client.ts`, `pipeline-orchestrator.ts` |
| React component files | `PascalCase` | `InputScreen.tsx`, `StageProgress.tsx` |
| TypeScript types/interfaces | `PascalCase` | `SourceContent`, `PipelineError`, `FactualClaim` |
| Functions and variables | `camelCase` | `runPipeline()`, `extractClaims()`, `sourceContent` |
| IPC event names | `namespace:action` kebab | `pipeline:stage-update`, `pipeline:complete` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_RETRY_ATTEMPTS`, `TOKEN_LOG_PATH` |
| HTML template files | `kebab-case` | `orbital-light.html`, `orbital-night.html` |
| Style spec references | `kebab-case` | `orbital-light`, `orbital-night` |

### Error Handling Pattern

No thrown exceptions cross module boundaries. Every module returns a `Result` type:

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: PipelineError }

type PipelineError = {
  stage: 'Extracting' | 'Transforming' | 'Validating' | 'Rendering'
  cause: string
  retryable: boolean
}
```

The Orchestrator checks `result.ok` after every module call. Errors thrown inside a module are caught and wrapped in `Result` before returning. Nothing propagates as an unhandled exception.

### IPC Pattern

- **Pipeline events** (fire-and-forget updates): `webContents.send()` from main → `ipcRenderer.on()` in renderer
- **Request/response** (save dialog, settings reads): `ipcMain.handle()` + `ipcRenderer.invoke()`
- Never call `ipcMain` or `ipcRenderer` from `packages/core` — the IPC bridge lives exclusively in `packages/electron-app/src/main/ipc-bridge.ts`

### State Management

React state in the renderer is local component state only — no global store for v2 (the pipeline has only 4 linear states; a store adds complexity without benefit). Pipeline state flows in one direction: main process emits IPC events → renderer updates local state.

### Test Placement

Tests are co-located with source files:
```
claim-extractor.ts
claim-extractor.test.ts
```
Not in a separate `/tests` directory. Each module is responsible for its own tests.

### Token Log

- Path: `app.getPath('userData')/leafletpdf-token-log.jsonl`
- Always append, never overwrite
- Errors during log write are caught silently — a logging failure must never interrupt or crash the pipeline

### AI Prompt Location

All AI prompts live in a `prompts.ts` file co-located with the module that uses them — not inline in the module logic, not in a shared prompts folder. `transformer/prompts.ts` owns transformation prompts. `validator/prompts.ts` owns validation prompts. `claim-extractor/` owns extraction prompts.

### Enforcement

All agents working on this codebase must:
- Return `Result<T>` from every module function — no raw throws across boundaries
- Keep all IPC calls inside `electron-app` — never in `core`
- Co-locate tests with source
- Use the shared types from `core/src/types/index.ts` for all handoff contracts — never redefine them locally

---

## Project Structure & Boundaries

### Complete Project Directory Structure

```
Leaflet PDF-v2/
├── package.json                        ← workspace root (npm workspaces)
├── tsconfig.base.json
├── .gitignore
├── .github/
│   └── workflows/
│       └── build.yml
│
├── packages/
│
│   ├── core/                           ← all pipeline logic, zero Electron deps
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── types/
│   │       │   └── index.ts            ← ALL shared handoff contracts
│   │       ├── modules/
│   │       │   ├── intake/
│   │       │   │   ├── intake.ts       ← FR-1, FR-2, FR-3, FR-4
│   │       │   │   └── intake.test.ts
│   │       │   ├── technique-selector/
│   │       │   │   ├── technique-selector.ts  ← FR-8, FR-9, FR-10, FR-11, FR-12, FR-14
│   │       │   │   ├── rules.ts
│   │       │   │   └── technique-selector.test.ts
│   │       │   ├── claim-extractor/
│   │       │   │   ├── claim-extractor.ts     ← FR-15
│   │       │   │   ├── prompts.ts
│   │       │   │   └── claim-extractor.test.ts
│   │       │   ├── transformer/
│   │       │   │   ├── transformer.ts  ← FR-8–FR-13
│   │       │   │   ├── prompts.ts
│   │       │   │   └── transformer.test.ts
│   │       │   ├── validator/
│   │       │   │   ├── validator.ts    ← FR-16, FR-17, FR-18
│   │       │   │   ├── prompts.ts
│   │       │   │   └── validator.test.ts
│   │       │   └── renderer/
│   │       │       ├── renderer.ts     ← FR-19, FR-20, FR-21, FR-22
│   │       │       ├── style-registry.ts
│   │       │       ├── templates/
│   │       │       │   ├── orbital-light.html
│   │       │       │   └── orbital-night.html
│   │       │       ├── assets/fonts/
│   │       │       │   ├── Anton-Regular.ttf
│   │       │       │   ├── HankenGrotesk-Regular.ttf
│   │       │       │   └── JetBrainsMono-Medium.ttf
│   │       │       └── renderer.test.ts
│   │       ├── services/
│   │       │   └── ai-client/
│   │       │       ├── ai-client.ts
│   │       │       ├── providers/
│   │       │       │   ├── anthropic.ts
│   │       │       │   ├── google.ts
│   │       │       │   └── ollama.ts
│   │       │       └── ai-client.test.ts
│   │       └── orchestrator/
│   │           ├── pipeline-orchestrator.ts   ← FR-5, FR-6, FR-7, retry logic
│   │           ├── token-logger.ts
│   │           └── pipeline-orchestrator.test.ts
│   │
│   ├── electron-app/
│   │   ├── package.json
│   │   ├── forge.config.ts
│   │   ├── vite.main.config.ts
│   │   ├── vite.renderer.config.ts
│   │   └── src/
│   │       ├── main/
│   │       │   ├── index.ts
│   │       │   ├── ipc-bridge.ts       ← ONLY file that touches Electron IPC
│   │       │   ├── settings-store.ts   ← electron-store
│   │       │   └── key-store.ts        ← keytar wrapper
│   │       └── renderer/
│   │           ├── index.html
│   │           ├── index.tsx
│   │           ├── App.tsx
│   │           ├── components/
│   │           │   ├── InputScreen/    ← FR-1–4, FR-20 style picker
│   │           │   │   ├── InputScreen.tsx
│   │           │   │   ├── TextInput.tsx
│   │           │   │   ├── FileInput.tsx
│   │           │   │   ├── UrlInput.tsx
│   │           │   │   └── StyleSelector.tsx
│   │           │   ├── ProcessingScreen/  ← FR-5, FR-17
│   │           │   │   ├── ProcessingScreen.tsx
│   │           │   │   └── StageProgress.tsx
│   │           │   ├── ErrorScreen/    ← FR-6, FR-7, FR-18
│   │           │   │   └── ErrorScreen.tsx
│   │           │   ├── SuccessScreen/  ← FR-23, FR-24
│   │           │   │   └── SuccessScreen.tsx
│   │           │   └── Settings/
│   │           │       ├── Settings.tsx
│   │           │       ├── SetupWizard.tsx
│   │           │       ├── ProviderCard.tsx
│   │           │       └── ModelSlot.tsx
│   │           ├── hooks/
│   │           │   ├── use-pipeline.ts
│   │           │   └── use-settings.ts
│   │           └── types/
│   │               └── ipc.ts
│   │
│   └── mcp-server/                     ← Phase 2 roadmap, scaffold only
│       ├── package.json
│       └── src/
│           └── index.ts
│
└── docs/
    ├── product-brief.md
    ├── PRD.md
    ├── ARCHITECTURE.md
    ├── addendum.md
    └── .decision-log.md
```

### Requirements to Structure Mapping

| FR Group | Module / Component |
|---|---|
| FR-1–4 (Content Intake) | `core/modules/intake/` + `renderer/InputScreen/` |
| FR-5–7 (Pipeline) | `core/orchestrator/` + `renderer/ProcessingScreen/` + `ErrorScreen/` |
| FR-8–14 (Transformation) | `core/modules/technique-selector/` + `core/modules/transformer/` |
| FR-15–18 (Validation) | `core/modules/claim-extractor/` + `core/modules/validator/` |
| FR-19–22 (Rendering) | `core/modules/renderer/` |
| FR-23–24 (Output Delivery) | `renderer/SuccessScreen/` + `main/index.ts` |
| BYOA / Settings | `main/settings-store.ts` + `main/key-store.ts` + `renderer/Settings/` |

### Integration Points

**Internal (IPC):** `core/orchestrator` → `EventEmitter` → `electron-app/main/ipc-bridge.ts` → `ipcMain.send` → `renderer`

**External (AI API):** `core/services/ai-client` → Vercel AI SDK → Anthropic / Google / Ollama

**External (YouTube):** `core/modules/intake` → `youtube-transcript` npm

**External (PDF):** `core/modules/renderer` → Playwright headless Chromium → PDF buffer

**External (OS):** `electron-app/main/index.ts` → Electron `dialog.showSaveDialog` → file system write

---

## Architecture Validation Results

### Coherence Validation ✅

All technology choices are compatible. Electron + Vite + TypeScript + React is standard and well-supported. Vercel AI SDK adapters (Anthropic, Google, Ollama) share a unified interface. Playwright runs cleanly in the Electron main process. `youtube-transcript`, `electron-store`, and `keytar` all operate in the Electron main process without conflict. npm workspaces monorepo is the correct shape for this multi-package project. Implementation patterns (Result<T>, IPC isolation, EventEmitter abstraction) align with and reinforce the architectural decisions.

### Requirements Coverage ✅

All 24 functional requirements are architecturally covered. Every FR maps to a specific module and file in the project structure. No FR is left without an implementation home.

### Gap Resolved: YouTube Caption Pre-Processing

Open Question #6 (raw captions vs. clean first) is closed. The Intake module runs a deterministic `preprocessCaptions()` step on YouTube-sourced content before it becomes Source Content — strips timestamps, speaker labels, filler tokens, restores basic sentence boundaries. No AI call, no extra cost. Implemented in `core/modules/intake/intake.ts` for YouTube input type only.

### Deferred Items (Not Blocking)

| Item | Decision |
|---|---|
| Mental bucket threshold (FR-10) | Config constant in `technique-selector/rules.ts` — start at 1,500 words, tune from SM-3 data |
| Technique audit persistence (FR-14) | Session-only for v2 — no storage design needed |
| Max PDF page count / file size | Not an architectural constraint — Playwright handles it |

### Architecture Completeness Checklist

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status: READY FOR IMPLEMENTATION**
**Confidence: High**

**Key strengths:**
- Every FR traces to a specific module and file — no ambiguity for implementation agents
- Monorepo + EventEmitter abstraction makes the Phase 2 MCP server a wrapper, not a rewrite
- Two model slots + Vercel AI SDK enables BYOA flexibility across Anthropic, Gemini, and Ollama
- `Result<T>` error contract makes FR-6 (stage-level errors) structurally enforced, not aspirational
- Style registry + spec files makes FR-21 (style extensibility) genuinely zero-pipeline-change

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use shared types from `core/src/types/index.ts` for all handoff contracts — never redefine locally
- Keep all IPC calls inside `packages/electron-app/src/main/ipc-bridge.ts` — never in core
- Return `Result<T>` from every module function — no raw throws across boundaries
- Co-locate tests with source files

**First Implementation Step:**
```bash
npm create electron-app@latest Leaflet PDF-v2 -- --template=vite-typescript
```

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements: 24 FRs across 6 feature areas**

| Feature Area | FRs | Architectural Weight |
|---|---|---|
| Content Intake | FR-1–4 | Low — text/file/URL ingestion |
| Processing Pipeline | FR-5–7 | Medium — orchestration, state, error propagation |
| Content Transformation | FR-8–14 | High — rules engine + AI execution + audit trail |
| Source Fidelity Validation | FR-15–18 | High — AI call, claim store, retry loop |
| PDF Rendering | FR-19–22 | High — custom visual style, extensible style system |
| Output Delivery | FR-23–24 | Low — native OS dialog, file write |

The three architecturally heavy areas — Transformation, Validation, and Rendering — are the core architecture problem. They must be isolated modules with defined input/output contracts, which is what makes FR-6 (stage-level error reporting) and FR-21 (style extensibility) enforceable rather than aspirational.

**Non-Functional Requirements:**
- Windows 11 desktop, self-contained, no server, GitHub distribution
- Pipeline completes < 3 min for 2,000-word input (SM-4)
- Source fidelity first-pass rate ≥ 80% (SM-3)
- User-supplied API key; secure local storage required
- No offline mode — AI API requires internet
- 100k character soft input limit (hard limit TBD)
- Valid PDF, portrait, tablet-readable

**Scale:** Medium complexity. No multi-tenancy, no database, no real-time collaboration. Complexity is concentrated in the AI pipeline and PDF renderer.

**Estimated modules:** 5 domain modules (Intake, Transformation, Validation, Rendering, Delivery) + 2 cross-cutting services (Pipeline Orchestrator, AI Client).

### Technical Constraints & Dependencies

- **`youtube-transcript-api`** referenced in product brief — a Python library. Constrains or biases the tech stack toward Python unless a subprocess bridge is acceptable.
- **PDF generation** must support Anton, Hanken Grotesk, JetBrains Mono fonts with custom layout zones (Orbital Light spec). An HTML/CSS-to-PDF approach maps cleanly to the CSS-like ORBITAL-LIGHT.md spec.
- **API key** must be stored securely on Windows. Solution depends on chosen stack (OS keychain vs. encrypted local file).
- **Distribution** must be a self-contained executable or simple setup with no installer server.

### Cross-Cutting Concerns Identified

1. **Pipeline orchestration** — 4 stages in sequence; retry logic for Transformation+Validation loops lives at the orchestrator level, not inside either module.
2. **AI client abstraction** — Both Transformation and Validation call the AI API. A shared client layer handles key management, token logging, error handling, and future provider swaps.
3. **Error propagation** — Every module emits structured errors with stage identity and cause; the orchestrator surfaces them accurately (FR-6).
4. **Style extensibility** — Renderer must read a style spec (e.g., ORBITAL-LIGHT.md) rather than hardcode values. New style = new spec + new renderer module, no pipeline changes (FR-21).
5. **Token instrumentation** — No hard limit in v2, but token usage must be logged per run to inform future caps.
