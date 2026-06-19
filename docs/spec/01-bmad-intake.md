# BMAD Intake — Bookit v2

## Source artifacts

| Source ID | BMAD artifact | Date | Location | Status |
|---|---|---|---|---|
| `BMAD-SRC-001` | Product Brief | 2026-06-18 | `docs/product-brief.md` | imported |
| `BMAD-SRC-002` | PRD (24 FRs) | 2026-06-18 | `docs/PRD.md` | imported |
| `BMAD-SRC-003` | Architecture (8 decisions) | 2026-06-18 | `docs/ARCHITECTURE.md` | imported |
| `BMAD-SRC-004` | Addendum (roadmap, open Qs) | 2026-06-18 | `docs/addendum.md` | imported |
| `BMAD-SRC-005` | Decision Log (22 decisions) | 2026-06-18 | `docs/.decision-log.md` | imported |
| `BMAD-SRC-006` | Epics & Stories (9 epics, 22 stories) | 2026-06-18 | `docs/epics-stories.md` | imported |

## Artifact mapping

| BMAD output | Destination spec |
|---|---|
| PRD (FR-1 to FR-24) | `02-requirements-registry.md`, `03-feature-specs/FEAT-001` through `FEAT-007` |
| PRD (NFRs / success metrics) | `02-requirements-registry.md` (NFR-001 to NFR-008) |
| Architecture decisions | `07-decisions/ADR-001` through `ADR-006`, `02-requirements-registry.md` (ARCH-001 to ARCH-006) |
| Epics & stories | `03-feature-specs/` (user stories, acceptance criteria) |
| Architecture (SEC) | `02-requirements-registry.md` (SEC-001), `07-decisions/ADR-004` |

## Normalization notes

**Requirements imported:**
- 24 functional requirements (FR-001 to FR-024) from `docs/PRD.md` — all accepted at P0 (core pipeline) or P1 (configuration/delivery)
- 8 non-functional requirements (NFR-001 to NFR-008) derived from PRD success metrics and constraints
- 6 architecture requirements (ARCH-001 to ARCH-006) derived from `docs/ARCHITECTURE.md` decisions
- 1 security requirement (SEC-001) from API key handling decision
- 5 integration requirements (INT-001 to INT-005) from external dependency decisions

**Assumptions converted to explicit requirements:**
- `[ASSUMPTION §4.1 FR-4]` Document title AI-derived from first 500 characters → explicitly captured in FR-004 acceptance criteria
- `[ASSUMPTION §4.3 FR-10]` Mental bucket threshold → captured as ARCH-004 (config constant 1,500 words in `rules.ts`)
- `[ASSUMPTION §4.3 FR-12]` Content-type classification is rule-based → captured in FR-012 acceptance criteria
- `[ASSUMPTION §4.6 FR-24]` "Open file" uses system default PDF viewer → captured in FR-024 acceptance criteria

**Conflicts found:**
- None between PRD and Architecture. ARCHITECTURE.md resolves all 7 open questions from PRD §8.

**Open questions remaining after BMAD:**
- Orbital Light `accent-blue: #0052ff` is estimated — verify against original design reference before HTML template implementation (flagged in ARCHITECTURE.md §Decision 4)
- Google login design doc (Jason has it; parked pending share)
- OpenRouter as provider not committed to v2 scope

## Import log

| Date | Source IDs | Result |
|---|---|---|
| 2026-06-18 | BMAD-SRC-001 through BMAD-SRC-006 | All 24 FRs, 8 NFRs, 6 ARCH, 1 SEC, 5 INT requirements normalized into registry |
