# Traceability Matrix — Leaflet PDF

## Matrix

| Requirement ID | Source | Feature spec | Acceptance criteria | Tasks | Module / Component | Status |
|---|---|---|---|---|---|---|
| `FR-001` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-001–003` | `TASK-001`, `TASK-005`, `CR-011` | `intake.ts`, `TextInput.tsx` | implemented |
| `FR-002` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-004–006` | `TASK-002`, `TASK-005`, `CR-012` | `intake.ts`, `FileInput.tsx` | implemented |
| `FR-003` | BMAD-SRC-002 §4.1 | `FEAT-001` | `AC-007–009` | `TASK-003`, `TASK-005`, `CR-013` | `intake.ts`, `UrlInput.tsx` | implemented |
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
| `NFR-004` | BMAD-SRC-002 §4.1 FR-1 | `FEAT-001` | `AC-002`, `AC-003`, `AC-005`, `AC-006` | `TASK-001`, `TASK-002`, `CR-011` | `intake.ts` | implemented |
| `NFR-005` | BMAD-SRC-002 Platform | Epic 9 | distribution test | — | `electron-builder` config | accepted |
| `NFR-006` | BMAD-SRC-003 §Decision 5 | `FEAT-003` | `TEST-012` | `TASK-012` | `token-logger.ts` | accepted |
| `NFR-007` | BMAD-SRC-002 §4.5 | `FEAT-005`, `FEAT-006` | `AC-051`, `AC-052`, `AC-057` | `TASK-017`, `TASK-019` | `renderer.ts`, `SuccessScreen.tsx` | accepted |
| `SEC-001` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-01`, `TASK-S21-03`, `TASK-S21-04` | `key-store.ts` | implemented |
| `SEC-002` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-02`-`TASK-S21-04` | `key-store.ts`, `settings-store.ts` | implemented |
| `ARCH-001` | BMAD-SRC-003 §Decision 2 Addendum | `FEAT-007` | monorepo init, `VERIFY-BUG-002-01`, `VERIFY-BUG-002-02` | `CR-001`, `CR-004` | `packages/` root, `package.json`, `tsconfig.base.json`, `packages/electron-app/package.json`, `packages/electron-app/tsconfig.json` | implemented |
| `ARCH-002` | BMAD-SRC-003 §Error Handling | all FEAT | `TEST-006`, all module tests | all TASK, `CR-008`, `TASK-S22-03` | all modules, `ai-client.ts` | accepted; AI client implemented |
| `ARCH-003` | BMAD-SRC-003 §IPC Pattern | `FEAT-002` | `TEST-003`, `TEST-008` | `TASK-007`, `CR-005`, `TASK-S14-01`-`TASK-S14-04` | `ipc-bridge.ts`, `renderer/types/ipc.ts` | implemented |
| `ARCH-004` | BMAD-SRC-003 §Types | all FEAT | `TEST-002`, all module tests | `CR-003`, `TASK-S13-01`-`TASK-S13-04` | `core/src/types/index.ts`, `core/src/index.ts` | implemented |
| `ARCH-005` | BMAD-SRC-003 §Decision 2 | `FEAT-002` | `TEST-006` | `TASK-006`, `TASK-007` | `pipeline-orchestrator.ts`, `ipc-bridge.ts` | accepted |
| `ARCH-006` | BMAD-SRC-003 §Test Placement | all FEAT | all module tests | all TASK | all `*.test.ts` files | accepted |
| `INT-001` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-006`, `TEST-022`, `VERIFY-BUG-001-01` | `TASK-021`, `CR-004`, `CR-008`, `TASK-S22-01`-`TASK-S22-04` | `ai-client.ts` + providers; Ollama adapter package is `ollama-ai-provider-v2` | implemented |
| `INT-002` | BMAD-SRC-003 | `FEAT-001` | `TEST-003` | `TASK-003` | `intake.ts` (youtube-transcript) | accepted |
| `INT-003` | BMAD-SRC-003 §Decision 4 | `FEAT-005` | `TEST-016`, `TEST-017` | `TASK-017` | `renderer.ts` (Playwright) | accepted |
| `INT-004` | BMAD-SRC-003 §Decision 1 | `FEAT-007` | `TEST-005`, `TEST-021` | `TASK-020`, `CR-007`, `TASK-S21-02` | `key-store.ts`, `settings-store.ts` | implemented |
| `STORY-2.3` | BMAD-SRC-006 Story 2.3 | `FEAT-007` | `TEST-007` | `CR-009`, `TASK-S23-01`-`TASK-S23-04` | `SetupWizard.tsx`, `App.tsx`, `preload.ts`, `ipc-bridge.ts` | implemented |
| `STORY-2.4` | BMAD-SRC-006 Story 2.4 | `FEAT-007` | `UX-DR8` | `CR-010`, `TASK-S24-01`-`TASK-S24-09` | `SettingsScreen.tsx`, `App.tsx` (gear icon), `preload.ts` (deleteKey), `ipc-bridge.ts` (KEY_DELETE), `styles.css` | implemented |
| `STORY-3.1` | BMAD-SRC-006 Story 3.1 | `FEAT-001` | `AC-001`–`AC-003` | `CR-011`, `TASK-S31-01`-`TASK-S31-06` | `core/modules/intake/intake.ts` (`processTextInput`, `SOURCE_CONTENT_CHAR_LIMIT`) | implemented |
| `STORY-3.2` | BMAD-SRC-006 Story 3.2 | `FEAT-001` | `AC-004`–`AC-006` | `CR-012`, `TASK-S32-01`-`TASK-S32-06` | `core/modules/intake/intake.ts` (`processFileInput`) | implemented |
| `STORY-3.3` | BMAD-SRC-006 Story 3.3 | `FEAT-001` | `AC-007`–`AC-009` | `CR-013`, `TASK-S33-01`-`TASK-S33-07` | `core/modules/intake/intake.ts` (`processYouTubeInput`, `preprocessCaptions`); `@leafletpdf/core` +`youtube-transcript` dep | implemented |
| `STORY-3.4` | BMAD-SRC-006 Story 3.4 | `FEAT-001` | `FR-001`–`FR-003` | `CR-014`, `TASK-S34-01`-`TASK-S34-06` | `core/modules/intake/intake.ts` (`deriveTitle`) | implemented |
| `STORY-3.5` | BMAD-SRC-006 Story 3.5 | `FEAT-001` | `UX-DR1`, `UX-DR2`, `UX-DR3` | `CR-015`, `TASK-S35-01`-`TASK-S35-06` | `InputScreen.tsx`, `TextInput.tsx`, `FileInput.tsx`, `UrlInput.tsx`, `StyleSelector.tsx` | implemented |
| `STORY-4.1` | BMAD-SRC-006 Story 4.1 | `FEAT-002` | `FR-017`, `FR-018` | `CR-016`, `TASK-S41-01`-`TASK-S41-05` | `core/orchestrator/pipeline-orchestrator.ts` | implemented |
| `STORY-4.2` | BMAD-SRC-006 Story 4.2 | `FEAT-002` | `FR-005`–`FR-007` | `CR-017`, `TASK-S42-01`-`TASK-S42-09` | `ipc-bridge.ts`, `preload.ts`, `preload-api.ts` | implemented |
| `STORY-4.3` | BMAD-SRC-006 Story 4.3 | `FEAT-002` | `UX-DR4`, `FR-5` | `CR-018`, `TASK-S43-01`-`TASK-S43-06` | `ProcessingScreen.tsx`, `App.tsx` | implemented |
| `STORY-4.4` | BMAD-SRC-006 Story 4.4 | `FEAT-002` | `UX-DR6` | `CR-018`, `TASK-S43-01`-`TASK-S43-06` | `SuccessScreen.tsx`, `App.tsx` | implemented |
| `STORY-4.5` | BMAD-SRC-006 Story 4.5 | `FEAT-002` | `UX-DR5`, `FR-6` | `CR-018`, `TASK-S43-01`-`TASK-S43-06` | `ErrorScreen.tsx`, `App.tsx` | implemented |
| `INT-005` | BMAD-SRC-002 §4.6 | `FEAT-006` | `TEST-019` | `TASK-018` | `ipc-bridge.ts` (dialog + shell) | accepted |
| `OPS-001` | BMAD-SRC-006 Story 1.5 | Epic 1 | `TEST-004` | `CR-006`, `TASK-S15-01`-`TASK-S15-03` | `.github/workflows/build.yml` | implemented |
| `STORY-5.1` | BMAD-SRC-006 Story 5.1 | `FEAT-003` | `FR-008`–`FR-012` | `CR-019`, `TASK-S51-01` | `technique-selector.ts`, `rules.ts` | implemented |
| `STORY-5.2` | BMAD-SRC-006 Story 5.2 | `FEAT-003` | `FR-013`, `FR-014` | `CR-019`, `TASK-S52-01` | `transformer.ts`, `prompts.ts` | implemented |
| `STORY-5.3` | BMAD-SRC-006 Story 5.3 | `FEAT-003` | `NFR-006`, `FR-014` | `CR-019`, `TASK-S53-01` | `token-logger.ts`, `pipeline-orchestrator.ts` | implemented |
| `STORY-6.1` | BMAD-SRC-006 Story 6.1 | `FEAT-004` | `FR-015` | `CR-020`, `TASK-S61-01` | `claim-extractor.ts`, `prompts.ts` | implemented |
| `STORY-6.2` | BMAD-SRC-006 Story 6.2 | `FEAT-004` | `FR-016`, `FR-017`, `FR-018` | `CR-020`, `TASK-S62-01` | `validator.ts`, `prompts.ts` | implemented |
| `STORY-7.1` | BMAD-SRC-006 Story 7.1 | `FEAT-005` | `FR-020`, `FR-022` | `CR-021`, `TASK-S71-01`-`TASK-S71-02` | `ORBITAL-LIGHT.md`, `orbital-light.html`, `ORBITAL-NIGHT.md`, `orbital-night.html` | implemented |
| `STORY-7.2` | BMAD-SRC-006 Story 7.2 | `FEAT-005` | `FR-019`, `FR-021` | `CR-021`, `TASK-S72-01`-`TASK-S72-02` | `style-registry.ts`, `renderer.ts` | implemented |
| `STORY-8.1` | BMAD-SRC-006 Story 8.1 | `FEAT-006` | `FR-023`, `FR-024` | `CR-022` | `ipc-bridge.ts`, `SuccessScreen.tsx`, `ProcessingScreen.tsx` | implemented |
| `STORY-9.1` | BMAD-SRC-006 Story 9.1 | all | `NFR-001`, `NFR-002`, `NFR-003` | `CR-023` | `pipeline-orchestrator.test.ts` (4 runtime vitest tests), `vitest.config.ts`, `build.yml` (test step) | implemented |
| `STORY-9.2` | BMAD-SRC-006 Story 9.2 | Epic 9 | `NFR-005` | `CR-023` | `forge.config.ts` (MakerSquirrel), `style-registry.ts` (co-located spec paths), `templates/orbital-light.md`, `templates/orbital-night.md`, `build.yml` (make job, main only) | implemented |
| `STORY-10.1` | PRD-MCP-addendum Story 10.1 | `FEAT-007` | `MCP-FR-001`, `MCP-FR-003` | `CR-024`, `TASK-MCP-01` | `mcp-server/package.json` | implemented |
| `STORY-10.2` | PRD-MCP-addendum Story 10.2 | `FEAT-007` | `MCP-FR-002` | `CR-024`, `TASK-MCP-02` | `env-config.ts` | implemented |
| `STORY-11.1` | PRD-MCP-addendum Story 11.1 | `FEAT-007` | `MCP-FR-001` | `CR-024`, `TASK-MCP-03` | `leafletpdf-transform.ts` | implemented |
| `STORY-11.2` | PRD-MCP-addendum Story 11.2 | `FEAT-007` | `MCP-FR-003`, `MCP-FR-004` | `CR-024`, `TASK-MCP-04` | `leafletpdf-transform.ts`, `server.ts` | implemented |
| `STORY-11.3` | PRD-MCP-addendum Story 11.3 | `FEAT-007` | `MCP-FR-005` | `CR-024`, `TASK-MCP-05` | `leafletpdf-transform.ts` | implemented |
| `STORY-11.4` | PRD-MCP-addendum Story 11.4 | `FEAT-007` | `MCP-FR-006` | `CR-024`, `TASK-MCP-06` | `leafletpdf-transform.ts` | implemented |
| `STORY-12.1` | PRD-MCP-addendum Story 12.1 | `FEAT-007` | `NFR-MCP-001` | `CR-024`, `TASK-MCP-07` | `MCP-SETUP.md` | implemented |
| `STORY-12.2` | PRD-MCP-addendum Story 12.2 | `FEAT-007` | `NFR-MCP-002` | `CR-024`, `TASK-MCP-07` | `MCP-SETUP.md` | implemented |
| `STORY-12.3` | PRD-MCP-addendum Story 12.3 | `FEAT-007` | `NFR-MCP-003` | `CR-024`, `TASK-MCP-07` | `MCP-SETUP.md` | implemented |
---

## Coverage checklist

- [x] Every P0 requirement has acceptance criteria
- [x] Every accepted requirement maps to at least one feature spec
- [x] Every accepted requirement maps to at least one implementation task
- [x] Every accepted requirement maps to at least one test or manual verification note
- [x] All ADRs map to affected requirements
- [x] Every task has `implemented` status — all stories 1.1–12.3 complete
- [ ] Every requirement has `verified` status — integration testing pending live run

## Gaps

None identified. All 24 FRs, 8 NFRs, 2 SEC, 6 ARCH, 5 INT requirements are mapped.
