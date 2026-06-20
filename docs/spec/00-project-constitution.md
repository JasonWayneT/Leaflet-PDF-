# Project Constitution — Leaflet PDF

## Project identity

- **Project name:** Leaflet PDF
- **Product type:** Windows desktop application (personal utility)
- **Target users:** Jason — single-user personal tool
- **Primary problem:** Valuable non-fiction content (articles, docs, YouTube transcripts) arrives in formats optimized for platforms, not for focused reading away from a screen
- **Primary value proposition:** Transform any raw non-fiction content into a structured, visually designed PDF built for reading on a tablet or away from a desk — without summarizing or altering the facts
- **Current stage:** MVP

## Operating mode

- **Spec mode:** standard
- **Required requirement categories:**
  - Functional: yes
  - Non-functional: yes
  - UX/design: yes
  - Architecture: yes
  - Data: no (no persistent user data beyond token log)
  - Security/privacy: yes (API key storage)
  - Operations: no (single-user local app)

- **Default priority scale:** P0 | P1 | P2 | Won't have

## Technical defaults

- **Frontend:** React (Electron renderer process, Vite bundler)
- **Backend:** Electron main process (Node.js) — no server
- **Database:** None — `electron-store` for config, `.jsonl` for token log
- **Authentication:** None — BYOA (user supplies own API key)
- **Hosting/deployment:** GitHub release — self-contained Windows `.exe`
- **Testing framework:** Vitest (co-located with source: `module.test.ts` beside `module.ts`)
- **Observability:** Token log `.jsonl` in `app.getPath('userData')` — no remote telemetry
- **Package manager:** npm (workspaces)
- **Style system:** CSS variables driven by YAML spec frontmatter; Orbital Light + Orbital Night

## Build target

| Field | Value |
|---|---|
| **Deliverable type** | Windows desktop application |
| **Primary language(s)** | TypeScript (main process + renderer process) |
| **Runtime environment** | Electron (Chromium + Node.js), Windows 11 |
| **Entry point** | `packages/electron-app/src/main/index.ts` |
| **Distribution method** | GitHub release — self-contained Windows `.exe` via electron-builder |
| **Install steps for a new user** | Download `.exe` from GitHub releases → run → complete first-launch wizard (provider + API key) |

**Approved for build:** [ ] Yes — PM has reviewed and signed off on the build target above

## Product boundaries

### Goals

- `GOAL-001`: Transform raw non-fiction text, file, or YouTube content into a structured PDF (Reading Artifact) using a cognitive science-backed learning design framework
- `GOAL-002`: Guarantee source fidelity — every factual claim in the output is present in the input; validation is mechanical, not aspirational
- `GOAL-003`: Ship two production-quality Visual Styles (Orbital Light, Orbital Night); style system is extensible without pipeline changes
- `GOAL-004`: Support BYOA across Anthropic, Google, and Ollama — user supplies their own API key; keys are stored securely in the OS keychain
- `GOAL-005`: Self-contained Windows application distributable from GitHub with no server dependency

### Non-goals

- `NG-001`: Not a summarization tool — every fact in the source appears in the output
- `NG-002`: Not a writing tool — Leaflet PDF restructures, it does not generate original content
- `NG-003`: Not a multi-user platform — no accounts, sharing, or collaboration
- `NG-004`: Not a content library — no document history or session persistence across restarts
- `NG-005`: Not a cloud service — runs entirely locally; only Source Content is sent to the AI API
- `NG-006`: Not a browser extension or web scraper — no article/website URL input in v2
- `NG-007`: No offline mode — AI API requires internet
- `NG-008`: No Mac or cross-platform support in v2
- `NG-009`: No CLI interface in v2 (Phase 5 roadmap item)
- `NG-010`: MCP server is Phase 2 — scaffold only in v2

## Global quality bar

- **Performance:** Full pipeline completes in under 3 minutes for a 2,000-word input on a standard internet connection (NFR-001)
- **Accessibility:** Not a v2 requirement — single-user personal tool
- **Security:** API keys stored in Windows Credential Manager via `keytar` — never in electron-store or on disk in plaintext (SEC-001)
- **Reliability:** 90% of submitted documents complete the full pipeline without a terminal error (NFR-003); fidelity first-pass rate ≥ 80% (NFR-002)
- **Maintainability:** All modules return `Result<T>` — no raw throws across boundaries; all shared types live in `core/src/types/index.ts`; all IPC calls live exclusively in `ipc-bridge.ts`
- **Documentation:** ARCHITECTURE.md is the canonical reference for all technical decisions; agents must read it before touching any module

## Agent constraints

- Agents must update specs before code.
- Agents must cite requirement IDs in tasks and implementation summaries (e.g. `// Implements FR-001`).
- Agents must preserve existing accepted behavior unless a change request says otherwise.
- Agents must record open questions instead of guessing when the decision changes product behavior.
- Agents must never redefine types locally — always import from `packages/core/src/types/index.ts`.
- Agents must never call `ipcMain` or `ipcRenderer` outside `packages/electron-app/src/main/ipc-bridge.ts`.
- Agents must never import from `electron` in `packages/core` — the core package has zero Electron dependencies.
- Fidelity is a hard constraint: a Reading Artifact that fails Source Fidelity Validation must never be delivered, regardless of other quality signals.
