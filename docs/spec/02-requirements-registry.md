# Requirements Registry — Bookit v2

Canonical source of truth for all requirement IDs. All feature specs, tasks, tests, and code changes trace back here.

## Status values

- `accepted` — approved source of truth
- `implemented` — implemented in code
- `verified` — implemented and validated
- `deprecated` — no longer active

---

## Functional Requirements

| ID | Priority | Status | Requirement | Acceptance criteria | Source |
|---|---|---|---|---|---|
| `FR-001` | P0 | accepted | User can paste raw text (up to 100,000 chars) as Source Content and submit | `AC-001`, `AC-002`, `AC-003` | BMAD-SRC-002 §4.1 |
| `FR-002` | P0 | accepted | User can import a .md or .txt file as Source Content | `AC-004`, `AC-005`, `AC-006` | BMAD-SRC-002 §4.1 |
| `FR-003` | P0 | accepted | User can enter a YouTube URL; app extracts transcript as Source Content | `AC-007`, `AC-008`, `AC-009` | BMAD-SRC-002 §4.1 |
| `FR-004` | P1 | accepted | User can optionally provide a document title; if omitted, AI derives from first 500 chars | `AC-010`, `AC-011` | BMAD-SRC-002 §4.1 |
| `FR-005` | P0 | accepted | App displays active pipeline stage (Extracting / Transforming / Validating / Rendering) in real time | `AC-012`, `AC-013` | BMAD-SRC-002 §4.2 |
| `FR-006` | P0 | accepted | On stage failure: names the failed stage and reason; pipeline halts; user can restart | `AC-014`, `AC-015`, `AC-016` | BMAD-SRC-002 §4.2 |
| `FR-007` | P0 | accepted | PDF is only written to disk when all four stages complete successfully | `AC-017`, `AC-018` | BMAD-SRC-002 §4.2 |
| `FR-008` | P0 | accepted | Technique selection is deterministic — same input always produces same technique list; runs before any AI call | `AC-019`, `AC-020` | BMAD-SRC-002 §4.3 |
| `FR-009` | P0 | accepted | BLUF, teach-not-label headings, 60-second cheat sheet applied to every document | `AC-021`, `AC-022`, `AC-023` | BMAD-SRC-002 §4.3 |
| `FR-010` | P0 | accepted | Mental buckets applied when Source Content ≥ 1,500 words or contains multiple distinct topics | `AC-024`, `AC-025`, `AC-026` | BMAD-SRC-002 §4.3 |
| `FR-011` | P0 | accepted | Jargon translation applied when technical/domain-specific terms detected | `AC-027`, `AC-028`, `AC-029` | BMAD-SRC-002 §4.3 |
| `FR-012` | P0 | accepted | Facts→implications applied when content is primarily factual or assertive (rule-based, no AI) | `AC-030`, `AC-031` | BMAD-SRC-002 §4.3 |
| `FR-013` | P0 | accepted | Transformer does not add, invent, or remove factual claims — enforced by validation, not prompt alone | `AC-032` | BMAD-SRC-002 §4.3 |
| `FR-014` | P1 | accepted | Technique audit record available per document (session-only for v2) | `AC-033`, `AC-034` | BMAD-SRC-002 §4.3 |
| `FR-015` | P0 | accepted | Factual Claims extracted (via AI, Validation slot, semantic level) from Source Content before Transformation | `AC-035`, `AC-036` | BMAD-SRC-002 §4.4 |
| `FR-016` | P0 | accepted | After each Transformation attempt, every Factual Claim checked against Transformed output | `AC-037`, `AC-038` | BMAD-SRC-002 §4.4 |
| `FR-017` | P0 | accepted | On validation failure, pipeline auto-retries Transformation; max 3 total attempts | `AC-039`, `AC-040`, `AC-041` | BMAD-SRC-002 §4.4 |
| `FR-018` | P0 | accepted | After 3 failed attempts, pipeline halts with "Validation failed after 3 attempts"; no PDF written | `AC-042`, `AC-043` | BMAD-SRC-002 §4.4 |
| `FR-019` | P0 | accepted | Transformed content rendered using active Visual Style to produce a Reading Artifact (PDF) | `AC-044`, `AC-045` | BMAD-SRC-002 §4.5 |
| `FR-020` | P0 | accepted | Both Orbital Light (default) and Orbital Night ship in v2; user selects at submission | `AC-046`, `AC-047`, `AC-048` | BMAD-SRC-002 §4.5 |
| `FR-021` | P1 | accepted | Adding a new Visual Style requires only new spec + HTML template — no pipeline changes | `AC-049`, `AC-050` | BMAD-SRC-002 §4.5 |
| `FR-022` | P0 | accepted | Output is a valid PDF, portrait orientation, formatted for tablet reading | `AC-051`, `AC-052` | BMAD-SRC-002 §4.5 |
| `FR-023` | P0 | accepted | After pipeline success, native Windows save dialog opens; file written only after user confirms | `AC-053`, `AC-054`, `AC-055` | BMAD-SRC-002 §4.6 |
| `FR-024` | P0 | accepted | User receives save confirmation with path; can open PDF directly from confirmation screen | `AC-056`, `AC-057` | BMAD-SRC-002 §4.6 |

---

## Non-Functional Requirements

| ID | Priority | Status | Requirement | Source |
|---|---|---|---|---|
| `NFR-001` | P0 | accepted | Full pipeline completes in under 3 minutes for 2,000-word input on standard internet | BMAD-SRC-002 §7 SM-4 |
| `NFR-002` | P0 | accepted | Source Fidelity Validation passes on first attempt for ≥ 80% of documents | BMAD-SRC-002 §7 SM-3 |
| `NFR-003` | P0 | accepted | 90% of submitted documents complete the full pipeline without terminal error | BMAD-SRC-002 §7 SM-2 |
| `NFR-004` | P0 | accepted | Input capped at 100,000 characters; empty inputs and unsupported file types rejected before processing | BMAD-SRC-002 §4.1 FR-1 |
| `NFR-005` | P1 | accepted | App is self-contained Windows 11 desktop app; no server; distributed via GitHub | BMAD-SRC-002 Platform |
| `NFR-006` | P0 | accepted | Token usage logged per-call to `.jsonl` in userData; logging failures never interrupt pipeline | BMAD-SRC-003 §Decision 5 |
| `NFR-007` | P0 | accepted | PDF is portrait, tablet-readable, opens in system default PDF viewer | BMAD-SRC-002 §4.5 FR-22 |
| `NFR-008` | P1 | accepted | Do not optimize speed at cost of fidelity rate; do not optimize token reduction at cost of quality | BMAD-SRC-002 §7 SM-C1, SM-C2 |

---

## Security Requirements

| ID | Priority | Status | Requirement | Source |
|---|---|---|---|---|
| `SEC-001` | P0 | implemented | API keys stored in Windows Credential Manager via `keytar` — never in electron-store or on disk in plaintext | BMAD-SRC-003 §Decision 1 |
| `SEC-002` | P1 | implemented | No API key string ever passes through `electron-store` | BMAD-SRC-003 §Decision 1 |

---

## Architecture Requirements

| ID | Priority | Status | Requirement | Source |
|---|---|---|---|---|
| `ARCH-001` | P0 | accepted | Monorepo with npm workspaces: `packages/core` (zero Electron deps), `packages/electron-app`, `packages/mcp-server` (scaffold) | BMAD-SRC-003 §Decision 2 Addendum |
| `ARCH-002` | P0 | accepted | All pipeline modules return `Result<T>` — no raw throws across module boundaries | BMAD-SRC-003 §Error Handling Pattern |
| `ARCH-003` | P0 | accepted | All IPC calls live exclusively in `packages/electron-app/src/main/ipc-bridge.ts`; `core` never imports from Electron | BMAD-SRC-003 §IPC Pattern |
| `ARCH-004` | P0 | accepted | All shared handoff contract types defined in `packages/core/src/types/index.ts`; never redefined locally | BMAD-SRC-003 §Implementation Patterns |
| `ARCH-005` | P0 | accepted | Orchestrator emits via Node EventEmitter (never Electron IPC); mental bucket threshold = 1,500 word constant in `rules.ts` | BMAD-SRC-003 §Decision 2 |
| `ARCH-006` | P0 | accepted | Tests co-located with source (`module.ts` / `module.test.ts`); all AI prompts in co-located `prompts.ts` | BMAD-SRC-003 §Test Placement |

---

## Integration Requirements

| ID | Priority | Status | Requirement | Source |
|---|---|---|---|---|
| `INT-001` | P0 | accepted | AI calls route through Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/google` + `ollama-ai-provider`) | BMAD-SRC-003 §Decision 1; corrected by `BUG-001` |
| `INT-002` | P0 | accepted | YouTube transcript extracted via `youtube-transcript` npm (no API key required) | BMAD-SRC-003 |
| `INT-003` | P0 | accepted | PDF generated via Playwright headless Chromium (HTML/CSS → PDF, A4 portrait, print-background enabled) | BMAD-SRC-003 §Decision 4 |
| `INT-004` | P0 | implemented | Non-sensitive config stored via `electron-store`; sensitive keys via `keytar` (OS keychain) | BMAD-SRC-003 §Decision 1 |
| `INT-005` | P0 | accepted | Windows native save dialog via `electron.dialog.showSaveDialog`; file open via `electron.shell.openPath` | BMAD-SRC-002 §4.6 |

---

## Operations Requirements

| ID | Priority | Status | Requirement | Source |
|---|---|---|---|---|
| `OPS-001` | P0 | implemented | GitHub Actions CI build runs on push and pull request using Node.js 20 on `windows-latest`; fails on workspace build or TypeScript errors | BMAD-SRC-006 Story 1.5 |

---

## Acceptance Criteria

### Content Intake (FR-001 to FR-004)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-001` | FR-001 | Valid paste | InputScreen, Paste Text tab active | I paste text and click Submit | Text stored as SourceContent `inputType: 'paste'`; pipeline begins |
| `AC-002` | FR-001 | Empty paste | InputScreen, Paste Text tab active | I submit with empty textarea | Inline error "Content required"; no processing |
| `AC-003` | FR-001 | Oversized paste | InputScreen | I paste > 100,000 chars | Inline character count error; Submit disabled; no processing |
| `AC-004` | FR-002 | Valid file | InputScreen, Import File tab active | I select a .md or .txt file | File content stored as SourceContent; treated identically to pasted text |
| `AC-005` | FR-002 | Unsupported file type | InputScreen, Import File tab | I select a file with any other extension | Inline error "Only .md and .txt files are supported"; no processing |
| `AC-006` | FR-002 | Empty file | InputScreen, Import File tab | I select a file with no content | Inline error "File is empty"; no processing |
| `AC-007` | FR-003 | Valid YouTube URL | InputScreen, YouTube URL tab | I paste a youtube.com/watch?v= or youtu.be/ URL and submit | Transcript extracted and pre-processed; stored as SourceContent `inputType: 'youtube'` |
| `AC-008` | FR-003 | No transcript | InputScreen, YouTube URL tab | I submit a URL for a video with no transcript | Inline error "No transcript available for this video"; no processing |
| `AC-009` | FR-003 | Invalid URL | InputScreen, YouTube URL tab | I enter a non-YouTube URL | Inline error "Please enter a valid YouTube URL"; no extraction attempted |
| `AC-010` | FR-004 | Title provided | InputScreen | I enter a title and submit | That title used as document title and default PDF filename |
| `AC-011` | FR-004 | No title provided | InputScreen | I leave title empty and submit | Validation/Utility slot derives title from first 500 chars of Source Content; derivation logged as `titleDerive` |

### Processing Pipeline (FR-005 to FR-007)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-012` | FR-005 | Stage display | Content submitted | Pipeline runs | ProcessingScreen shows active stage label updating: Extracting → Transforming → Validating → Rendering |
| `AC-013` | FR-005 | Retry display | Validation fails on attempt 1 | Retry begins | Stage label shows "Retrying transformation — attempt 2 of 3" |
| `AC-014` | FR-006 | Stage-level error | Pipeline stage fails | Error occurs | ErrorScreen names the failed stage explicitly (e.g. "Extraction Failed"); error message includes cause |
| `AC-015` | FR-006 | Pipeline halt | Any stage fails | Error surfaced | No subsequent stages run; user can restart |
| `AC-016` | FR-006 | No apologetic language | Error displayed | Any failure | Error message is direct; no "Sorry", "Unfortunately", or apologetic phrasing |
| `AC-017` | FR-007 | No partial PDF | Pipeline fails mid-run | Any stage errors | No PDF file written to disk |
| `AC-018` | FR-007 | App closed mid-run | App is closed during processing | Closed | No partial output persists on disk |

### Content Transformation (FR-008 to FR-014)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-019` | FR-008 | Determinism | Same Source Content | `selectTechniques()` called twice | Returns identical technique list both times |
| `AC-020` | FR-008 | Pre-AI selection | Any Source Content | Technique selection runs | Completes before any AI call is made |
| `AC-021` | FR-009 | BLUF always present | Any Source Content | Transformation completes | Reading Artifact opens with BLUF section |
| `AC-022` | FR-009 | Teach-not-label headings | Any Source Content | Transformation completes | All headings teach rather than label |
| `AC-023` | FR-009 | Cheat sheet always present | Any Source Content | Transformation completes | Reading Artifact closes with 60-second cheat sheet |
| `AC-024` | FR-010 | Buckets triggered by length | Source Content ≥ 1,500 words | Technique selection runs | `mental-buckets` in conditional list |
| `AC-025` | FR-010 | Buckets triggered by topics | Source Content with multiple distinct topics | Technique selection runs | `mental-buckets` in conditional list |
| `AC-026` | FR-010 | Buckets not triggered | Source Content < 1,500 words, single topic | Technique selection runs | `mental-buckets` not in conditional list |
| `AC-027` | FR-011 | Jargon detected | Technical/domain terms in Source Content | Technique selection runs | `jargon-translation` in conditional list |
| `AC-028` | FR-011 | Jargon translated inline | Jargon technique applied | Transformation completes | Detected terms translated at first use; not re-translated subsequently |
| `AC-029` | FR-011 | No jargon | No technical terms detected | Technique selection runs | `jargon-translation` not in conditional list; no translation boxes in output |
| `AC-030` | FR-012 | Facts trigger implication | Primarily factual/assertive content | Technique selection runs | `facts-implications` in conditional list |
| `AC-031` | FR-012 | Narrative skips implication | Opinion-led or narrative content | Technique selection runs | `facts-implications` not in conditional list |
| `AC-032` | FR-013 | No invented claims | Any Source Content | Transformation completes | Transformed output contains no factual claims absent from Source Content |
| `AC-033` | FR-014 | Audit available | Transformation completes | User requests technique audit | List of applied vs. skipped conditional techniques is accessible |
| `AC-034` | FR-014 | Audit not prominent | Any Reading Artifact | User views output | Technique audit is a secondary action (not displayed in main output view) |

### Source Fidelity Validation (FR-015 to FR-018)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-035` | FR-015 | Extraction before transformation | Any Source Content | Pipeline starts | Claim extraction runs once before any Transformer call |
| `AC-036` | FR-015 | Source not modified | Claim extraction runs | Extraction completes | Source Content is unchanged |
| `AC-037` | FR-016 | Validation pass | All claims accurately represented | Validation runs | `passed: true`; pipeline proceeds to Rendering |
| `AC-038` | FR-016 | Validation fail | Any claim absent, altered, or contradicted | Validation runs | `passed: false`; `failedClaims` lists which claims and why |
| `AC-039` | FR-017 | Auto retry | Validation fails on attempt 1 | Pipeline continues | Transformer called again automatically; user not prompted to intervene |
| `AC-040` | FR-017 | Max 3 attempts | Validation fails on attempts 1 and 2 | Third attempt starts | Third and final Transformer+Validator cycle runs |
| `AC-041` | FR-017 | Retry uses original source | Retry begins | Transformer called again | Retry uses original SourceContent and TechniqueList — not partial Transformed Content |
| `AC-042` | FR-018 | Halt after 3 failures | All 3 attempts fail validation | Third failure occurs | Pipeline halts; `pipeline:error` emitted |
| `AC-043` | FR-018 | Correct error message | 3 attempts failed | Error surfaced | Message: "Validation failed after 3 attempts — fidelity check could not be satisfied"; no PDF written |

### PDF Rendering (FR-019 to FR-022)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-044` | FR-019 | Style applied | Validated Transformed Content | Rendering runs | Output conforms to typography, color, layout rules in active Visual Style spec |
| `AC-045` | FR-019 | Content unchanged | Rendering runs | PDF produced | Renderer does not alter the text content of Transformed output |
| `AC-046` | FR-020 | Style selector present | InputScreen showing | User views submission form | StyleSelector shows "Orbital Light" (default, selected) and "Orbital Night" |
| `AC-047` | FR-020 | Orbital Light default | No style selected | User submits | Orbital Light applied to Reading Artifact |
| `AC-048` | FR-020 | Orbital Night produces styled PDF | Orbital Night selected | Rendering runs | PDF conforms to Orbital Night spec (Terminal Black base, acid-yellow accents) |
| `AC-049` | FR-021 | No pipeline changes for new style | New Visual Style added | Style registry updated | No changes to Intake, Transformation, or Validation required |
| `AC-050` | FR-021 | New style = spec + template + registry entry | New Visual Style added | Only three files modified | New spec file + new HTML template + one style-registry entry |
| `AC-051` | FR-022 | Valid PDF | Rendering completes | PDF buffer produced | Output file is a valid PDF (can be opened in standard PDF viewer) |
| `AC-052` | FR-022 | Portrait, tablet-readable | Rendering completes | PDF produced | A4 portrait; margins suitable for tablet reading |

### Output Delivery (FR-023 to FR-024)

| AC ID | FR | Scenario | Given | When | Then |
|---|---|---|---|---|---|
| `AC-053` | FR-023 | Save dialog opens | Pipeline completes | `pipeline:complete` emitted | Native Windows save dialog opens with default filename `{title}.pdf` |
| `AC-054` | FR-023 | File written only on confirm | Save dialog open | User confirms save location | PDF buffer written to disk at confirmed path |
| `AC-055` | FR-023 | Cancel = no file | Save dialog open | User cancels dialog | No file written; pipeline result remains available for session |
| `AC-056` | FR-024 | Save confirmation shown | File written | SuccessScreen shown | Displays "Reading Artifact Saved" + full save path |
| `AC-057` | FR-024 | Open file from confirmation | SuccessScreen shown | User clicks "Open File" | `shell.openPath(savedPath)` opens PDF in system default viewer |
