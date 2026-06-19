# TEST-007 First-Launch Setup Wizard

## Requirement links

- `SEC-001`
- `SEC-002`
- `INT-001`
- `INT-004`

## Purpose

Prove that Story 2.3 adds the first-launch setup wizard flow and wires provider setup through the existing secure storage and AI client boundaries.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-007-A` | `INT-004` | Renderer can call preload methods for settings, keys, and provider test | `preload-api.test.ts` compiles |
| `TEST-007-B` | `SEC-001`, `SEC-002` | Wizard save payload separates API key from provider settings | `SetupWizard.test.tsx` compiles |
| `TEST-007-C` | `INT-001` | Test connection payload maps to `aiClient.generateText()` provider config | `ipc-bridge.ts` compiles |
| `TEST-007-D` | `INT-004` | Existing provider config skips setup wizard | `App.test.tsx` compiles |

## Commands

```powershell
npx tsc --noEmit --project packages\electron-app\tsconfig.json
npm run build --workspace=@bookit/electron-app
```

## Current result

- Status: passed
- Last run: 2026-06-19
