# Feature Spec: FEAT-004 — Source Fidelity Validation

## Metadata

- **Feature ID:** `FEAT-004`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-002` §4.4, `BMAD-SRC-003` §Decision 3, `BMAD-SRC-006` Epic 6
- **Related requirements:** `FR-013`, `FR-015`, `FR-016`, `FR-017`, `FR-018`, `NFR-002`, `ARCH-002`, `ARCH-006`, `INT-001`

## Problem statement

Bookit's core promise is that it restructures — not rewrites — content. This promise must be enforced mechanically. If Transformed Content drops, alters, or contradicts any factual claim from the source, the pipeline must catch it and retry before the user ever sees the output.

## Goals

- `GOAL-001`: Extract all factual claims from Source Content before Transformation begins
- `GOAL-002`: Verify every claim against Transformed Content after each Transformation attempt
- `GOAL-003`: Auto-retry on failure (up to 3 total attempts) without user intervention
- `GOAL-004`: Halt after 3 failures with a specific, actionable error

## Non-goals

- `NG-001`: Claim-level user review or override — validation is fully automated
- `NG-002`: Persisting failed claim details across sessions

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-6.1` | P0 | As a developer, I want a Claim Extractor that uses AI to extract semantic-level claims before Transformation | `FR-015`, `ARCH-002`, `ARCH-006`, `INT-001` |
| `STORY-6.2` | P0 | As a developer, I want a Validator that checks all claims and drives the retry loop in the Orchestrator | `FR-016–018`, `NFR-002`, `ARCH-002` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `FR-013` | No invented claims — enforced here mechanically |
| `FR-015` | Factual claim extraction (AI, Validation slot, semantic level, once per session) |
| `FR-016` | Post-transformation claim check |
| `FR-017` | Auto-retry on failure; max 3 total attempts |
| `FR-018` | Halt after 3 failures; no PDF written |
| `NFR-002` | Fidelity first-pass rate ≥ 80% |
| `ARCH-002` | `Result<T>` from all module functions |

## Acceptance criteria

See `02-requirements-registry.md` AC-035 through AC-043.

## Edge cases

- `AC-036`: Extraction does not modify Source Content
- `AC-041`: Retry uses original SourceContent — not partial Transformed Content
- `AC-043`: Specific error message "Validation failed after 3 attempts — fidelity check could not be satisfied"; no PDF written

## UX and design notes

- No direct UI for this feature beyond the ProcessingScreen stage label ("Validating")
- Retry display: "Retrying transformation — attempt 2 of 3" shown in ProcessingScreen (`AC-013`)
- On 3 failures: ErrorScreen shows "Validation Failed" with fidelity cause message

## Technical notes

- **ClaimExtractor:** `packages/core/src/modules/claim-extractor/claim-extractor.ts` + `prompts.ts`
- **Validator:** `packages/core/src/modules/validator/validator.ts` + `prompts.ts`
- Claim extraction prompt instructs semantic-level extraction: "extract the meaning, not the exact quoted string"
- Validation prompt checks semantic presence: "Is the meaning of this claim present and accurately represented?"
- Extraction runs **once per pipeline session** (before first Transformer call); Orchestrator does not re-run on retries
- Both modules return `Result<T>`; Orchestrator drives the retry loop
- Retry logic lives in Orchestrator (`FEAT-002`), not inside Validator

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-013` | `FR-015`, `ARCH-002`, `ARCH-006` | `claim-extractor.ts` + `prompts.ts`: AI call, parse FactualClaim[], return Result | todo |
| `TASK-014` | `FR-016–018`, `ARCH-002` | `validator.ts` + `prompts.ts`: check all claims, return passed/failedClaims | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-013` | `FR-015`, `AC-035–036` | unit | extractClaims: sample article → claims (mocked AI); source unchanged |
| `TEST-014` | `FR-016`, `AC-037–038` | unit | validate: all claims present → pass; missing claim → fail with failedClaims |
| `TEST-015` | `FR-017–018`, `AC-039–043` | unit | Orchestrator retry: fail×1→retry→pass; fail×3→halt with correct error |

## Open questions

None.
