---
title: "PRD: Bookit v2"
created: 2026-06-18
updated: 2026-06-18
status: draft
version: 0.1
---

# PRD: Bookit v2

## 0. Document Purpose

This PRD defines the functional requirements for Bookit v2 — a personal content transformation desktop application. It is written for the developer building the system and for downstream workflow artifacts (architecture, epics, stories). Requirements are grouped by feature; FRs are globally numbered for stable reference. The upstream product context lives in `docs/product-brief.md`. Architecture decisions, roadmap items, and implementation guidance live in `docs/addendum.md`.

---

## 1. Vision

Bookit is a personal content transformation tool. It takes raw non-fiction content — pasted text, markdown files, plain text files, or a YouTube URL — and produces a structured, visually designed PDF built for reading away from a screen.

The problem it solves is environmental. Valuable learning content arrives in formats optimized for platforms, not for readers. Wiki pages, Medium articles, YouTube transcripts, and documentation are written to be indexed and scanned. They are not designed to be taken somewhere — to a tablet, a park bench, a coffee shop — and read with the kind of attention a well-produced publication earns.

Bookit changes where and how you can learn from content you care about. It applies a cognitive science-backed pedagogical framework to reorganize any input for comprehension: surfacing key ideas first, translating jargon in context, pairing facts with their implications, and closing with a summary. It does not rewrite or summarize — it restructures. Every factual claim in the output is validated against the source. Then it renders the result in a chosen Visual Style. The v2 MVP ships with Orbital Light as the default and only style; additional styles are planned for future releases. The output is a Reading Artifact — not a formatted document.

---

## 2. Target User

### 2.1 Jobs To Be Done

- Transform content I want to learn from into a format I actually want to read
- Take learning material somewhere away from my desk — tablet, coffee shop, park — without losing quality or structure
- Consume dense non-fiction content (articles, documentation, transcripts) without fighting the monotony of raw formatting
- Have a reading experience that feels immersive, not just functional — visual design as part of engagement, not decoration

### 2.2 Non-Users (v2 MVP)

Anyone other than the primary user — Bookit v2 is a single-user personal utility tool.

### 2.3 Key User Journeys

**UJ-1. Jason transforms a YouTube video into a Reading Artifact.**
- **Persona + context:** Jason, a product professional, finishes a YouTube explainer on a technical topic and wants to read it properly at leisure rather than rewatch it at his desk.
- **Entry state:** App is open on Windows desktop. YouTube URL is copied.
- **Path:**
  1. Pastes YouTube URL into the URL input field
  2. Optionally enters a document title
  3. Submits — watches stage progress: Extracting → Transforming → Validating → Rendering
  4. Save dialog opens — chooses output location and confirms
- **Climax:** A PDF is saved that reads like a designed report — bold section headers, structured content, cheat sheet at the end. He moves it to his tablet.
- **Resolution:** Jason reads the PDF at a coffee shop, away from his desk, on his own schedule.
- **Edge case:** The YouTube video has no available transcript. The application informs him and does not proceed. He can paste the content manually instead.

---

## 3. Glossary

- **Source Content** — the raw input material supplied by the user. May be pasted text, a `.md` file, a `.txt` file, or a YouTube URL. The Source Content is the authoritative record for fidelity validation.
- **Transcript** — the text extracted from a YouTube video. A specific form of Source Content. May be auto-generated (noisy) or manually captioned.
- **Transformation** — the process of restructuring Source Content using the Learning Design Framework. Transformation changes the organization and presentation of information; it does not alter, remove, or add factual claims.
- **Learning Design Framework** — the set of pedagogical techniques applied during Transformation: BLUF (bottom line up front), mental buckets, jargon translation, facts → implications, teach-not-label headings, and the 60-second cheat sheet.
- **Factual Claim** — a discrete assertion of fact extracted from the Source Content. The atomic unit of Source Fidelity Validation.
- **Source Fidelity Validation** — the process of checking that every Factual Claim present in the Source Content is accurately represented in the Transformed output. Passes if no claim is altered, omitted, or contradicted. Fails otherwise.
- **Visual Style** — a named, self-contained design template applied during Rendering. Defines typography, color palette, layout rules, and component shapes. Orbital Light and Orbital Night are the v2 MVP Visual Styles.
- **Orbital Light** — v2 MVP Visual Style. Light-ground editorial design: white/off-white base, bold display typography (Anton), clean body text (Hanken Grotesk), monospaced utility labels (JetBrains Mono), sharp corners, thick borders, blue accent for emphasis. Same structural language as Orbital Night in a print/tablet-friendly colorway. Fully specified in `ORBITAL-LIGHT.md`.
- **Orbital Night** — v2 MVP Visual Style. Dark-ground tactical design: Terminal Black (#131313) base, Acid Yellow (#c7f300) and white accents, same typography and structural elements as Orbital Light. Optimised for screen reading. Fully specified in `ORBITAL-NIGHT.md`.
- **Rendering** — the process of applying a Visual Style to Transformed content to produce a Reading Artifact.
- **Reading Artifact** — the final output PDF. Structured, visually designed, and formatted for reading on a tablet or printed page away from a screen.

---

## 4. Features

### 4.1 Content Intake

**Description:** The entry point for every Bookit session. The user supplies Source Content through one of three methods: pasting text directly, importing a `.md` or `.txt` file, or entering a YouTube URL. The application extracts and prepares the Source Content for the Transformation pipeline. No processing begins until the user explicitly submits. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Paste text input
The user can paste raw text into the application as Source Content and submit it for processing.

**Consequences (testable):**
- Application accepts plain text input up to 100,000 characters
- Submitted text is stored as Source Content and passed to the Transformation pipeline
- Empty submissions are rejected with an inline error before processing begins

#### FR-2: File import
The user can import a `.md` or `.txt` file from the local filesystem as Source Content.

**Consequences (testable):**
- Application accepts `.md` and `.txt` formats only
- File content is extracted as plain text and treated identically to pasted text
- Unsupported file types are rejected with a clear error message before processing begins
- Empty files are rejected before processing begins

#### FR-3: YouTube URL input
The user can enter a YouTube URL and the application extracts the video's Transcript as Source Content.

**Consequences (testable):**
- Application accepts standard YouTube URL formats (`youtube.com/watch?v=` and `youtu.be/`)
- Transcript is extracted and stored as Source Content if available
- If no Transcript exists for the video, the user is informed and processing does not begin
- Invalid or non-YouTube URLs are rejected before extraction is attempted

#### FR-4: Document title
The user can optionally provide a title for the Reading Artifact before submitting.

**Consequences (testable):**
- If a title is provided, it is used as the document title in the Reading Artifact
- If no title is provided, the application derives a title from the Source Content `[ASSUMPTION: AI-derived from first 500 characters]`

---

### 4.2 Processing Pipeline

**Description:** After Source Content is submitted, Bookit runs a four-stage pipeline — Extracting, Transforming, Validating, Rendering — and displays the active stage to the user in real time. Each stage completes before the next begins. If any stage fails, the pipeline halts immediately, names the failed stage, and surfaces an actionable error. No partial output is produced on failure. Realizes UJ-1.

**Functional Requirements:**

#### FR-5: Stage progress display
The user can see which pipeline stage is currently running throughout processing.

**Consequences (testable):**
- Application displays one of four named states: Extracting, Transforming, Validating, Rendering
- Active stage updates as each stage completes
- Progress state is visible for the full duration of processing

#### FR-6: Stage-level failure reporting
When a pipeline stage fails, the user is informed which stage failed and why.

**Consequences (testable):**
- Error message names the failed stage explicitly (e.g., "Validation failed" not "Something went wrong")
- Error message includes the reason where one can be determined
- Pipeline halts on failure; no subsequent stages run
- User can restart from the beginning after a failure

#### FR-7: No partial output on failure
A Reading Artifact is only produced when all four stages complete successfully.

**Consequences (testable):**
- No PDF file is written to disk if any stage fails or is interrupted
- If the application is closed mid-pipeline, no partial output persists

**Notes:** The pipeline must be architected as independent modules with defined handoff contracts — see `docs/addendum.md`. This is the structural requirement that makes stage-level error reporting (FR-6) meaningful.

---

### 4.3 Content Transformation

**Description:** The core pipeline stage. Bookit applies the Learning Design Framework to restructure Source Content for comprehension. Which techniques are applied is determined by rules evaluated against the Source Content before any AI call is made — the AI does not decide which techniques to use, only how to execute the ones the rules select. This keeps token usage bounded and output structure predictable. Realizes UJ-1.

**Functional Requirements:**

#### FR-8: Deterministic technique selection
The application evaluates Source Content against a defined ruleset before transformation begins and selects which Learning Design Framework techniques to apply.

**Consequences (testable):**
- Technique selection completes before any AI call is made
- The same Source Content always produces the same technique selection
- Technique selection rules are documented in the architecture spec, not embedded in AI prompts

#### FR-9: Always-applied techniques
BLUF, teach-not-label headings, and the 60-second cheat sheet are applied to every document regardless of content properties.

**Consequences (testable):**
- Every Reading Artifact opens with a BLUF section
- Every heading in the Reading Artifact teaches rather than labels
- Every Reading Artifact closes with a 60-second cheat sheet
- No Source Content is exempt from these three techniques

#### FR-10: Conditional technique — mental buckets
Mental buckets are applied when Source Content exceeds a defined length threshold or contains multiple distinct topics.

**Consequences (testable):**
- Content meeting the threshold is organized into named category sections
- Content below the threshold is structured without buckets
- Bucket names are derived from the content, not from a fixed list
- `[ASSUMPTION: threshold defined in architecture spec]`

#### FR-11: Conditional technique — jargon translation
Jargon translation is applied when technical or domain-specific terms are detected in the Source Content.

**Consequences (testable):**
- Detected terms are translated inline at first use
- Terms are not re-translated on subsequent appearances
- If no jargon is detected, no translation boxes appear in the output

#### FR-12: Conditional technique — facts → implications
Facts are paired with their implications when the Source Content is primarily factual or assertive in nature.

**Consequences (testable):**
- Factual claims in the output are followed by a stated implication
- Opinion-led or narrative content does not receive implication pairings
- `[ASSUMPTION: content-type classification is rule-based, not AI-driven]`

#### FR-13: Source Content fidelity during transformation
The AI executing transformation does not add factual claims, invent examples, or remove information from the Source Content.

**Consequences (testable):**
- Transformed output contains no factual claims absent from the Source Content
- All information present in the Source Content is represented in the Transformed output
- Enforced by Source Fidelity Validation (§4.4), not the transformation prompt alone

#### FR-14: Technique audit record
The application records which techniques were applied to each document and makes this accessible to the user on demand.

**Consequences (testable):**
- User can access a list of applied techniques for any completed Reading Artifact
- The list indicates which conditional techniques were applied and which were skipped
- Technique audit is accessible via a secondary action (info panel or details view) — not displayed prominently in the main output view
- `[NON-GOAL for MVP]` User-configurable technique selection is a Phase 3 roadmap item

---

### 4.4 Source Fidelity Validation

**Description:** The validation stage runs after every Transformation attempt. It extracts Factual Claims from the Source Content before transformation begins — anchoring them as the reference set — then checks the Transformed output against every claim. If any claim is missing, altered, or contradicted, validation fails and the Transformation stage is retried. After 3 total attempts, the pipeline halts. No Reading Artifact is produced from a document that has not passed validation. This stage is what makes FR-13 enforceable.

**Functional Requirements:**

#### FR-15: Factual claim extraction
Before Transformation begins, the application extracts and stores all Factual Claims from the Source Content as the reference set for validation.

**Consequences (testable):**
- Extraction runs once per processing session, before any Transformation attempt
- The reference set is stored for the full duration of the pipeline run
- Extraction does not modify the Source Content

#### FR-16: Transformed output validation
After each Transformation attempt, every Factual Claim in the reference set is checked against the Transformed output.

**Consequences (testable):**
- Validation passes only when all Factual Claims are present and accurately represented in the output
- Validation fails if any claim is absent, altered, or contradicted
- Validation result (pass/fail + which claims failed) is logged internally

#### FR-17: Automatic retry on validation failure
When validation fails, the pipeline automatically retries the Transformation stage without user intervention.

**Consequences (testable):**
- Up to 2 retries are attempted after the initial failure (3 total attempts)
- Each retry is a fresh Transformation call against the original Source Content
- The progress display updates to show the retry is in progress (e.g., "Retrying transformation — attempt 2 of 3")
- The user is not prompted to intervene during retries

#### FR-18: Pipeline halt after max retries
If all 3 Transformation attempts fail validation, the pipeline halts and surfaces a specific error.

**Consequences (testable):**
- Error message identifies the stage ("Validation failed after 3 attempts")
- Error message indicates fidelity as the cause
- No Reading Artifact is written to disk
- User can restart from the beginning

---

### 4.5 PDF Rendering

**Description:** The final pipeline stage. Bookit applies a Visual Style to the Transformed and validated content to produce a Reading Artifact. For v2 MVP, two Visual Styles ship: Orbital Light (light ground, white base) and Orbital Night (dark ground, Terminal Black base). The rendering system must accommodate additional styles without structural changes — these two styles are the first in a system, not hardcoded output formats. Canonical specifications: `ORBITAL-LIGHT.md` and `ORBITAL-NIGHT.md`.

**Functional Requirements:**

#### FR-19: Apply Visual Style to Transformed content
The application renders Transformed content using the active Visual Style to produce a Reading Artifact.

**Consequences (testable):**
- Output conforms to the typography, color, layout, and component rules defined in the active Visual Style spec
- For v2 MVP, Orbital Light is the active Visual Style for all documents
- Rendering does not alter the content of the Transformed output — only its visual presentation

#### FR-20: Orbital Light and Orbital Night as v2 styles
Both Orbital Light (light ground) and Orbital Night (dark ground) ship in v2. The user selects their preferred style at submission time. Default is Orbital Light.

**Consequences (testable):**
- A style selector (dropdown or toggle) appears in the submission UI
- Orbital Light is selected by default
- Selecting Orbital Night applies the dark-ground colorway to the Reading Artifact
- Both styles produce valid, fully-styled PDFs conforming to their respective Visual Style specs
- `[NON-GOAL for MVP]` Visual Styles beyond Orbital Light and Orbital Night are a Phase 3 roadmap item

#### FR-21: Style system extensibility
The rendering architecture supports additional Visual Styles without requiring changes to the pipeline or other features.

**Consequences (testable):**
- Adding a new Visual Style requires only a new style spec file and a corresponding renderer module
- No changes to Intake, Transformation, or Validation are required when a new style is added
- The Orbital Light renderer is isolated from the pipeline logic

#### FR-22: PDF output
The rendered Reading Artifact is produced as a valid PDF file.

**Consequences (testable):**
- Output file is a valid PDF
- PDF is formatted for tablet reading (portrait orientation, readable at standard tablet screen sizes)
- PDF filename is derived from the document title (FR-4)

---

### 4.6 Output Delivery

**Description:** When the pipeline completes successfully, Bookit prompts the user to choose where to save the Reading Artifact. No file is written until the user confirms a save location.

**Functional Requirements:**

#### FR-23: User-directed save location
After successful pipeline completion, the application presents a save dialog for the user to choose the output location and filename.

**Consequences (testable):**
- Native Windows save dialog opens on pipeline completion
- Default filename is derived from the document title (FR-4)
- User can rename the file before saving
- File is written only after the user confirms the save location
- If the user cancels the dialog, no file is written and the pipeline result remains available until the application session ends

#### FR-24: Save confirmation
The user receives confirmation when the Reading Artifact has been successfully written to disk.

**Consequences (testable):**
- Success state is displayed after file write completes
- Confirmation indicates the save path
- User can open the file directly from the confirmation `[ASSUMPTION: opens in system default PDF viewer]`

---

## 5. Non-Goals (Explicit)

- **Not a summarization tool** — Bookit does not compress or condense content; every fact in the source appears in the output
- **Not a writing tool** — Bookit does not generate original content; it restructures what the user provides
- **Not a multi-user platform** — v2 is a single-user personal utility; no accounts, sharing, or collaboration
- **Not a content library** — no document history, saved sessions, or content management in v2
- **Not a cloud service** — runs locally on Windows; no server, no hosted processing, no cloud storage
- **Not a browser extension** — standalone desktop application only
- **Not designed for fiction or creative writing** — Learning Design Framework applies to non-fiction, factual content
- **Not a web scraper** — article and website URL input is not supported in v2
- **Not an email client** — newsletter and email input is not supported in v2
- **No CLI interface in v2** — command-line access is a roadmap item for Hermes integration

---

## 6. MVP Scope

### 6.1 In Scope

- Paste text input (up to 100,000 characters)
- `.md` and `.txt` file import
- YouTube URL input with transcript extraction
- Optional document title with AI-derived fallback
- Four-stage processing pipeline with real-time stage display
- Stage-level error reporting and recovery
- Deterministic technique selection + AI execution of Learning Design Framework
- Always-applied techniques: BLUF, teach-not-label headings, 60-second cheat sheet
- Conditional techniques: mental buckets, jargon translation, facts → implications
- Source Fidelity Validation with automatic retry (max 3 attempts)
- PDF rendering in Orbital Light or Orbital Night Visual Style (user-selected at submission)
- User-directed save with native Windows save dialog
- Technique audit accessible via secondary action
- Windows desktop application, self-contained, distributed via GitHub

### 6.2 Out of Scope for MVP

- Article and website URL scraping — Phase 2
- Email and newsletter input — Phase 2 `[NOTE FOR PM: high-value for daily brief use case; revisit after MVP validation]`
- Multiple Visual Style templates — Phase 3
- User-configurable technique selection — Phase 3
- Critical thinking / alternatives layer — Phase 4
- CLI interface — Phase 5 (Hermes integration)
- Hermes / Gmail integration — Phase 5
- Document history or session persistence across app restarts
- Offline mode (AI API requires internet)
- Mac or cross-platform support

---

## 7. Success Metrics

**Primary**

- **SM-1: Habitual use** — Bookit is used at least once per week for 4 consecutive weeks after launch. This is the primary signal that the tool has earned a place in the workflow. Validates FR-1 through FR-24.
- **SM-2: Pipeline success rate** — 90% of submitted documents complete the full pipeline without a terminal error. Validates FR-5 through FR-7, FR-17, FR-18.

**Secondary**

- **SM-3: Fidelity first-pass rate** — Source Fidelity Validation passes on the first attempt for at least 80% of documents. Validates FR-15, FR-16. A lower rate indicates transformation prompt quality issues.
- **SM-4: Time to Reading Artifact** — Full pipeline completes in under 3 minutes for a 2,000-word input on a standard internet connection. Validates FR-5.

**Counter-metrics (do not optimize)**

- **SM-C1: Do not optimize processing speed at the cost of fidelity pass rate.** A fast pipeline that fails validation frequently is worse than a slower one that consistently passes. SM-4 is secondary to SM-3.
- **SM-C2: Do not optimize token reduction at the cost of output quality.** Cost savings that degrade the usefulness of the Reading Artifact undermine the core value proposition. Token efficiency is a constraint, not a primary goal.

---

## 8. Open Questions

1. What word/character count threshold triggers mental bucket application? (To be defined in architecture spec — impacts FR-10)
2. What method is used for Factual Claim extraction — dedicated AI call, rule-based NLP, or hybrid? (Architecture decision with significant token budget impact — impacts FR-15)
3. Is there a maximum supported input length beyond the 100,000-character soft limit in FR-1?
4. What AI provider and model is used for transformation and fidelity validation? (Architecture decision — affects cost, quality, and latency)
5. Does the technique audit record (FR-14) persist across sessions or exist only for the current session?
6. Are auto-generated YouTube captions pre-processed (filler word removal, punctuation restoration) before Transformation — or does Transformation handle raw caption noise?
7. Is there a target maximum page count or file size for the Reading Artifact?

---

## 9. Assumptions Index

- **§4.1 FR-4** — Document title is AI-derived from the first 500 characters of Source Content when the user provides no title
- **§4.3 FR-10** — Mental bucket length threshold is defined in the architecture spec, not the PRD
- **§4.3 FR-12** — Content-type classification (factual vs. narrative) is rule-based, not an AI call
- **§4.6 FR-24** — "Open file" shortcut after save opens the PDF in the system default PDF viewer
- **Platform** — User content sent to the AI API for processing is acceptable to the user; no additional privacy measures are required for v2 single-user use

---

## Platform

- **Target OS:** Windows 11
- **Distribution:** GitHub — self-contained, no server required
- **AI API dependency:** Internet connection required for Transformation and Fidelity Validation; offline mode not supported
- **Local-first:** All user content and output files are stored locally; only Source Content is sent to the AI API for processing

---

## Aesthetic and Tone

- **Visual output:** Defined by the active Visual Style spec. For v2, see `ORBITAL-LIGHT.md`
- **UI language:** Minimal, functional, and technical in register — consistent with the Orbital Light aesthetic
- **Error messages:** Direct and specific — name the stage, name the cause. No apologetic language.
- **Labels:** Short; uppercase where consistent with Orbital Light conventions
- **Prototype reference:** `C:\Users\Jason\Desktop\Jason\Projects\BookitV2\screen.png` (Google Stitch mockup)

---

## Constraints and Guardrails

- **Token budget:** Deterministic technique selection (FR-8) is the primary mechanism for bounding AI calls. No hard token limit is defined for v2, but token usage per pipeline run must be instrumented and logged to inform future limits.
- **Fidelity as a hard constraint:** A Reading Artifact that fails Source Fidelity Validation must never be delivered to the user, regardless of other quality signals. This is non-negotiable.
- **No hallucination from the rendering layer:** The Rendering stage must not alter or supplement content — it applies visual style only.
- **API key management:** The user must supply their own AI API key. Key storage and handling must follow standard secure local storage practices for desktop applications.
