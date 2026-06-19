# Feature Spec: FEAT-001 — Content Intake

## Metadata

- **Feature ID:** `FEAT-001`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.1, `BMAD-SRC-006` Epic 3
- **Related requirements:** `FR-001`, `FR-002`, `FR-003`, `FR-004`, `NFR-004`, `ARCH-003`, `INT-002`

## Problem statement

The user supplies raw non-fiction content in one of three formats — pasted text, a local file, or a YouTube URL. The app must extract and prepare this content as Source Content before handing it to the pipeline. Input validation must happen before any processing begins. The YouTube path additionally requires transcript extraction and caption pre-processing.

## Goals

- `GOAL-001`: Accept all three input formats with a consistent submission UX
- `GOAL-002`: Validate input before pipeline begins — no processing starts on invalid input
- `GOAL-003`: Produce a clean `SourceContent` object regardless of input type

## Non-goals

- `NG-001`: Article/website URL scraping — Phase 2
- `NG-002`: Email/newsletter input — Phase 2
- `NG-003`: Input transformation or summarization — Intake only normalizes; it does not restructure

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-3.1` | P0 | As Jason, I want to paste raw text and submit it so I can transform any text I have on hand | `FR-001`, `NFR-004` |
| `STORY-3.2` | P0 | As Jason, I want to import a .md or .txt file so I can transform local documents without copy-paste | `FR-002`, `NFR-004` |
| `STORY-3.3` | P0 | As Jason, I want to paste a YouTube URL and have the transcript extracted for me | `FR-003`, `INT-002` |
| `STORY-3.4` | P1 | As Jason, I want to optionally provide a title, or have one derived for me | `FR-004` |
| `STORY-3.5` | P0 | As Jason, I want the InputScreen to surface all input methods and a style selector in one coherent view | `FR-020`, `ARCH-003` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-001` | Paste text input up to 100,000 chars |
| `FR-002` | .md / .txt file import |
| `FR-003` | YouTube URL → transcript extraction + pre-processing |
| `FR-004` | Optional title; AI-derived fallback |
| `NFR-004` | Input limits and validation before processing |
| `INT-002` | `youtube-transcript` npm for extraction |

## Acceptance criteria

See `02-requirements-registry.md` AC-001 through AC-011.

## Edge cases

- `AC-002`: Empty text paste → inline error "Content required"
- `AC-003`: Paste exceeds 100,000 chars → character count error, Submit disabled
- `AC-005`: Unsupported file type → "Only .md and .txt files are supported"
- `AC-006`: Empty file → "File is empty"
- `AC-008`: YouTube video has no transcript → "No transcript available for this video"
- `AC-009`: Non-YouTube URL → "Please enter a valid YouTube URL"
- Auto-generated YouTube captions: `preprocessCaptions()` strips timestamps, speaker labels, filler tokens before forming SourceContent

## UX and design notes

- Linked UX requirements: `UX-DR1` (three mutually exclusive input modes, tab/toggle), `UX-DR2` (StyleSelector), `UX-DR3` (Submit disabled until valid input; inline validation errors)
- Switching input tabs clears previous input and any inline errors
- Style selector appears below input area; title field above
- Submit button disabled until at least one non-whitespace character is present (text/URL) or a valid file is loaded

## Technical notes

- **Module:** `packages/core/src/modules/intake/intake.ts`
- **Component files:** `TextInput.tsx`, `FileInput.tsx`, `UrlInput.tsx`, `StyleSelector.tsx` under `renderer/components/InputScreen/`
- File reading via `fs.readFileSync` in main process, triggered by IPC from renderer
- `preprocessCaptions(raw: string): string` is a pure function in `intake.ts` — no AI, no side effects
- Title derivation uses `aiClient.generateText()` on the Validation/Utility slot; token usage logged as `titleDerive`
- Linked architecture: `ARCH-003` (IPC boundary), `ARCH-002` (Result<T> from all module functions)

## Component breakdown

> **Agent-completed during the Superpowers design phase.** Do not fill in until Superpowers design confirmation.

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-001` | `FR-001`, `NFR-004` | `intake.ts`: `processTextInput()` — validation + SourceContent | todo |
| `TASK-002` | `FR-002`, `NFR-004` | `intake.ts`: `processFileInput()` — file read, type/size validation | todo |
| `TASK-003` | `FR-003`, `INT-002` | `intake.ts`: `processYouTubeInput()` + `preprocessCaptions()` | todo |
| `TASK-004` | `FR-004` | `intake.ts`: `deriveTitle()` — AI call on Validation slot | todo |
| `TASK-005` | `FR-001–004`, `FR-020` | `InputScreen.tsx` + tab components + StyleSelector | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-001` | `FR-001`, `AC-001–003` | unit | processTextInput: valid, empty, oversized |
| `TEST-002` | `FR-002`, `AC-004–006` | unit | processFileInput: .md, .txt, wrong ext, empty |
| `TEST-003` | `FR-003`, `AC-007–009` | unit | processYouTubeInput: valid, no transcript, invalid URL |
| `TEST-004` | `FR-003` | unit | preprocessCaptions: noisy transcript → clean output |
| `TEST-005` | `FR-004`, `AC-010–011` | unit | deriveTitle: provided title, AI-derived (mocked) |

## Open questions

None. All open questions from BMAD §8 resolved in ARCHITECTURE.md.
