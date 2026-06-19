# Traceability Matrix — Bookit v2

## Matrix

| Requirement ID | Source | Feature spec | Acceptance criteria | Tasks | Module / Component | Status |
|---|---|---|---|---|---|---|
| `FR-001` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-001–003` | `TASK-001`, `TASK-005` | `intake.ts`, `TextInput.tsx` | accepted |
| `FR-002` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-004–006` | `TASK-002`, `TASK-005` | `intake.ts`, `FileInput.tsx` | accepted |
| `FR-003` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-007–009` | `TASK-003`, `TASK-005` | `intake.ts`, `UrlInput.tsx` | accepted |
| `FR-004` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-010–011` | `TASK-004` | `intake.ts` | accepted |
| `FR-005` | BMAD-SRC-002 §4.2 | `FEAT-002` | `AC-012–013` | `TASK-008` | `ProcessingScreen.tsx`, `StageProgress.tsx` | accepted |
| `FR-006` | BMAD-SRC-002 §4.2 | `FEAT-002` | `AC-014–016` | `TASK-006`, `TASK-009` | `pipeline-orchestrator.ts`, `ErrorScreen.tsx` | accepted |
| `FR-007` | BMAD-SRC-002 §4.2 | `FEAT-002` | `AC-017–018` | `TASK-006` | `pipeline-orchestrator.ts` | accepted |
| `FR-008` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-019–020` | `TASK-010` | `technique-selector.ts` | accepted |
| `FR-009` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-021–023` | `TASK-010`, `TASK-011` | `technique-selector.ts`, `transformer.ts` | accepted |
| `FR-010` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-024–026` | `TASK-010` | `technique-selector.ts`, `rules.ts` | accepted |
| `FR-011` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-027–029` | `TASK-010`, `TASK-011` | `technique-selector.ts`, `transformer.ts` | accepted |
| `FR-012` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-030–031` | `TASK-010` | `technique-selector.ts`, `rules.ts` | accepted |
| `FR-013` | BMAD-SRC-002 §4.3 | `FEAT-003`, `FEAT-004` | `AC-032` | `TASK-011`, `TASK-014` | `transformer.ts`, `validator.ts` | accepted |
| `FR-014` | BMAD-SRC-002 §4.3 | `FEAT-003` | `AC-033–034` | `TASK-010`, `TASK-011` | `technique-selector.ts`, `TransformedContent.techniqueAudit` | accepted |
| `FR-015` | BMAD-SRC-002 §4.4 | `FEAT-004` | `AC-035–036` | `TASK-013` | `claim-extractor.ts` | accepted |
| `FR-016` | BMAD-SRC-002 §4.4 | `FEAT-004` | `AC-037–038` | `TASK-014` | `validator.ts` | accepted |
| `FR-017` | BMAD-SRC-002 §4.4 | `FEAT-002`, `FEAT-004` | `AC-039–041` | `TASK-006` | `pipeline-orchestrator.ts` | accepted |
| `FR-018` | BMAD-SRC-002 §4.4 | `FEAT-004` | `AC-042–043` | `TASK-006`, `TASK-009` | `pipeline-orchestrator.ts`, `ErrorScreen.tsx` | accepted |
| `FR-019` | BMAD-SRC-002 §4.5 | `FEAT-005` | `AC-044–045` | `TASK-015`, `TASK-016`, `TASK-017` | `renderer.ts`, `style-registry.ts`, `orbital-light.html` | accepted |
| `FR-020` | BMAD-SRC-002 §4.5 | `FEAT-005` | `AC-046–048` | `TASK-005`, `TASK-015`, `TASK-017` | `StyleSelector.tsx`, `orbital-night.html`, `renderer.ts` | accepted |
| `FR-021` | BMAD-SRC-002 §4.5 | `FEAT-005` | `AC-049–050` | `TASK-016` | `style-registry.ts` | accepted |
| `FR-022` | BMAD-SRC-002 §4.5 | `FEAT-005`, `FEAT-006` | `AC-051–052` | `TASK-017` | `renderer.ts` | accepted |
| `FR-023` | BMAD-SRC-002 §4.6 | `FEAT-006` | `AC-053–055` | `TASK-018` | `ipc-bridge.ts` (save dialog) | accepted |
| `FR-024` | BMAD-SRC-002 §4.6 | `FEAT-006` | `AC-056–057` | `TASK-018`, `TASK-019` | `ipc-bridge.ts`, `SuccessScreen.tsx` | accepted |
| `NFR-001` | BMAD-SRC-002 §7 SM-4 | `FEAT-002` | manual perf test | — | all pipeline modules | accepted |
| `NFR-002` | BMAD-SRC-002 §7 SM-3 | `FEAT-004` | `TEST-015` | `TASK-013`, `TASK-014` | `claim-extractor.ts`, `validator.ts` | accepted |
| `NFR-003` | BMAD-SRC-002 §7 SM-2 | `FEAT-002` | `TEST-006` | `TASK-006` | `pipeline-orchestrator.ts` | accepted |
| `NFR-004` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-002`, `AC-003`, `AC-005`, `AC-006` | `TASK-001`, `TASK-002` | `intake.ts` | accepted |
| `NFR-005` | BMAD-SRC-002 Platform | Epic 9 | distribution test | — | `electron-builder` config | accepted |
| `NFR-006` | BMAD-SRC-003 §Decision 5 | `FEAT-003` | `TEST-012` | `TASK-012` | `token-logger.ts` | accepted |
| `NFR-007` | BMAD-SRC-002 §4.5 | `FEAT-005`, `FEAT-006` | `AC-051`, `AC-052`, `AC-057` | `TASK-017`, `TASK-019` | `renderer.ts`, `SuccessScreen.tsx` | accepted |
| `SEC-001` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-01`, `TASK-S21-03`, `TASK-S21-04` | `key-store.ts` | implemented |
| `SEC-002` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-02`-`TASK-S21-04` | `key-store.ts`, `settings-store.ts` | implemented |
| `ARCH-001` | BMAD-SRC-003 §Decision 2 Addendum | `FEAT-007` | monorepo init, `VERIFY-BUG-002-01`, `VERIFY-BUG-002-02` | `CR-001`, `CR-004` | `packages/` root, `package.json`, `tsconfig.base.json`, `packages/electron-app/package.json`, `packages/electron-app/tsconfig.json` | implemented |
| `ARCH-002` | BMAD-SRC-003 §Error Handling | all FEAT | all module tests | all TASK | all modules | accepted |
| `ARCH-003` | BMAD-SRC-003 §IPC Pattern | `FEAT-002` | `TEST-003`, `TEST-008` | `TASK-007`, `CR-005`, `TASK-S14-01`-`TASK-S14-04` | `ipc-bridge.ts`, `renderer/types/ipc.ts` | implemented |
| `ARCH-004` | BMAD-SRC-003 §Types | all FEAT | `TEST-002`, all module tests | `CR-003`, `TASK-S13-01`-`TASK-S13-04` | `core/src/types/index.ts`, `core/src/index.ts` | implemented |
| `ARCH-005` | BMAD-SRC-003 §Decision 2 | `FEAT-002` | `TEST-006` | `TASK-006`, `TASK-007` | `pipeline-orchestrator.ts`, `ipc-bridge.ts` | accepted |
| `ARCH-006` | BMAD-SRC-003 §Test Placement | all FEAT | all module tests | all TASK | all `*.test.ts` files | accepted |
| `INT-001` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-022`, `VERIFY-BUG-001-01` | `TASK-021`, `CR-004` | `ai-client.ts` + providers; Ollama adapter package is `ollama-ai-provider` | accepted |
| `INT-002` | BMAD-SRC-003 | `FEAT-001` | `TEST-003` | `TASK-003` | `intake.ts` (youtube-transcript) | accepted |
| `INT-003` | BMAD-SRC-003 §Decision 4 | `FEAT-005` | `TEST-016`, `TEST-017` | `TASK-017` | `renderer.ts` (Playwright) | accepted |
| `INT-004` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-02` | `key-store.ts`, `settings-store.ts` | implemented |
| `INT-005` | BMAD-SRC-002 §4.6 | `FEAT-006` | `TEST-019` | `TASK-018` | `ipc-bridge.ts` (dialog + shell) | accepted |
| `OPS-001` | BMAD-SRC-006 Story 1.5 | Epic 1 | `TEST-004` | `CR-006`, `TASK-S15-01`-`TASK-S15-03` | `.github/workflows/build.yml` | implemented |

---

## Coverage checklist

- [x] Every P0 requirement has acceptance criteria
- [x] Every accepted requirement maps to at least one feature spec
- [x] Every accepted requirement maps to at least one implementation task
- [x] Every accepted requirement maps to at least one test or manual verification note
- [x] All ADRs map to affected requirements
- [ ] Every task has `implemented` status — in progress (Story 1.1 complete; remaining stories pending)
- [ ] Every requirement has `verified` status — not yet (pre-implementation)

## Gaps

None identified. All 24 FRs, 8 NFRs, 2 SEC, 6 ARCH, 5 INT requirements are mapped.
