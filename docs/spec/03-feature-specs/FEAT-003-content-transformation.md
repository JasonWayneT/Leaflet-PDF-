# Feature Spec: FEAT-003 — Content Transformation

## Metadata

- **Feature ID:** `FEAT-003`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.3, `BMAD-SRC-003` §Decision 3, `BMAD-SRC-006` Epic 5
- **Related requirements:** `FR-008`, `FR-009`, `FR-010`, `FR-011`, `FR-012`, `FR-013`, `FR-014`, `NFR-006`, `ARCH-002`, `ARCH-004`, `ARCH-005`, `ARCH-006`, `INT-001`

## Problem statement

The core of Bookit's value is restructuring content using a cognitive science-backed Learning Design Framework. The AI must execute techniques, not decide which ones to apply — that decision is deterministic and rule-based. Without this separation, token usage is unbounded and output structure is unpredictable.

## Goals

- `GOAL-001`: Deterministic technique selection from rules — same input always produces the same technique list
- `GOAL-002`: AI executes the selected techniques — restructures (not summarizes, not adds content)
- `GOAL-003`: Token usage per run is logged for every AI call
- `GOAL-004`: Technique audit available on demand (session-only)

## Non-goals

- `NG-001`: User-configurable technique selection — Phase 3
- `NG-002`: AI-driven technique selection — always rule-based
- `NG-003`: Content summarization or compression

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-5.1` | P0 | As a developer, I want a stateless, deterministic Technique Selector before any AI call | `FR-008–012`, `FR-014`, `ARCH-005` |
| `STORY-5.2` | P0 | As a developer, I want a Transformer module that applies selected techniques via AI call | `FR-008–013`, `ARCH-002`, `ARCH-006`, `INT-001` |
| `STORY-5.3` | P1 | As a developer, I want every pipeline run to append a structured token log entry | `NFR-006` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-008` | Deterministic technique selection, pre-AI |
| `FR-009` | BLUF, teach-not-label headings, 60-second cheat sheet — always applied |
| `FR-010` | Mental buckets — conditional on length/topic count |
| `FR-011` | Jargon translation — conditional on term detection |
| `FR-012` | Facts→implications — conditional on content type (rule-based) |
| `FR-013` | No invented claims — enforced by Validator, constraint on Transformer prompt |
| `FR-014` | Technique audit record (session-only) |
| `NFR-006` | Token usage logged per-call to .jsonl |
| `ARCH-005` | Mental bucket threshold = 1,500 word constant in `rules.ts` |
| `ARCH-006` | Tests co-located; prompts in co-located `prompts.ts` |

## Acceptance criteria

See `02-requirements-registry.md` AC-019 through AC-034.

## Edge cases

- `AC-026`: Short, single-topic content → no mental buckets
- `AC-029`: No jargon detected → no translation boxes in output
- `AC-031`: Opinion-led or narrative content → no facts→implications pairings
- `AC-032`: Transformer instructed via prompt to not add/invent/remove claims — Validator enforces this mechanically

## UX and design notes

- `AC-033`, `AC-034`: Technique audit is secondary action — info panel or details view, not shown in main output
- No direct UI for this feature beyond the ProcessingScreen stage label ("Transforming")

## Technical notes

- **TechniqueSelector:** `packages/core/src/modules/technique-selector/technique-selector.ts` + `rules.ts`
- **Transformer:** `packages/core/src/modules/transformer/transformer.ts` + `prompts.ts`
- **Token Logger:** `packages/core/src/orchestrator/token-logger.ts`
- `MENTAL_BUCKET_THRESHOLD = 1500` constant in `rules.ts`
- Technique audit lives in `TechniqueAuditRecord` on `TransformedContent.techniqueAudit` (session-only; no persistence)
- Transformer calls Transformation model slot; token usage returned in `Result` value for Orchestrator to log
- All AI prompts in `transformer/prompts.ts` — never inline in `transformer.ts`
- `Result<T>` returned from both modules — no raw throws across boundaries

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-010` | `FR-008–012`, `FR-014`, `ARCH-005` | `technique-selector.ts` + `rules.ts`: all 3 always + 3 conditional rules | todo |
| `TASK-011` | `FR-008–013`, `ARCH-002`, `ARCH-006` | `transformer.ts` + `prompts.ts`: AI call with technique list | todo |
| `TASK-012` | `NFR-006` | `token-logger.ts`: append-only .jsonl log; silent failure on write error | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-009` | `FR-008`, `AC-019–020` | unit | selectTechniques: same input → same output; runs before any AI call |
| `TEST-010` | `FR-009–012`, `AC-021–031` | unit | All rule branches: short, long, multi-topic, jargon, factual, narrative |
| `TEST-011` | `FR-008–013`, `AC-032` | unit | Transformer: happy path (mocked AI); AI error → `Result<never>` |
| `TEST-012` | `NFR-006` | unit | token-logger: appends correct schema; write error caught silently |

## Open questions

None.
