# CR-010 — Settings Screen (Story 2.4)

## Summary

Implement the Settings screen for Epic 2 (BYOA Settings & AI Client). The Settings screen allows users to view their active provider, edit model slot assignments (Transformation and Validation/Utility), and reconfigure their AI provider without going through a full install cycle.

## Change type

Feature — new renderer component

## Requirements addressed

- `UX-DR8`: Settings screen with Providers section (status cards) and Model Slots section
- `SEC-001`, `SEC-002`: Settings screen must not expose or store API keys through electron-store
- `INT-004`: Settings interaction routes through existing settings-store and key-store abstractions
- `ARCH-003`: All IPC calls remain in ipc-bridge.ts; renderer only calls window.bookit.*

## Rationale

Story 2.3 (SetupWizard) implemented first-launch configuration. Story 2.4 provides ongoing access to review and adjust that configuration without losing work.

## Files affected

### New

- `packages/electron-app/src/renderer/SettingsScreen.tsx` — Settings screen component
- `packages/electron-app/src/renderer/SettingsScreen.test.tsx` — compile-time smoke test

### Modified

- `packages/electron-app/src/renderer/App.tsx` — add gear icon nav to toggle Settings visible state
- `packages/electron-app/src/renderer/styles.css` — add Settings layout classes

## Acceptance criteria mapping

From epics-stories.md Story 2.4:

- [ ] Providers section shows one status card per configured provider (provider name, connection status, masked API key indicator)
- [ ] Model Slots section shows Transformation and Validation/Utility rows with current provider + model name
- [ ] Each model slot row has an Edit button that opens an inline editor for provider and model name
- [ ] "Reconfigure Provider" action triggers the SetupWizard flow
- [ ] Ollama config note: "Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models."
- [ ] Settings changes persisted immediately on save (no Apply step)
- [ ] Settings accessible via gear icon from App.tsx
- [ ] No API key strings pass through settings-store (SEC-002 compliance)

## Implementation tasks

- [x] TASK-S24-01: Create CR-010 document
- [ ] TASK-S24-02: Add KEY_DELETE channel to IPC_CHANNELS and ipc-bridge.ts
- [ ] TASK-S24-03: Extend preload API with settings read helpers (modelSlots, providerConfig)
- [ ] TASK-S24-04: Build SettingsScreen.tsx with Providers + Model Slots sections
- [ ] TASK-S24-05: Add gear icon to App.tsx and wire screen toggle
- [ ] TASK-S24-06: Add Settings styles to styles.css
- [ ] TASK-S24-07: Write co-located SettingsScreen.test.tsx (compile-time smoke)
- [ ] TASK-S24-08: Verify TypeScript compilation passes across all packages
- [ ] TASK-S24-09: Update traceability matrix

## Verification

- `npx tsc --noEmit --project packages\electron-app\tsconfig.json` ✅ passes
- `npm run build --workspaces --if-present` ✅ passes (full package builds)
- Source grep confirms only `ipc-bridge.ts` imports `ipcMain` ✅
- Source grep confirms `packages/core` has no `electron` imports ✅
- `KEY_DELETE` handler added to `ipc-bridge.ts` and `preload.ts` ✅
- `SettingsScreen.tsx` does not store or display API key values ✅

## Status

`complete`

