# TEST-005 Secure Settings Storage

## Requirement links

- `SEC-001`
- `SEC-002`
- `INT-004`

## Purpose

Prove that Story 2.1 keeps API keys in the keychain wrapper and non-sensitive settings in the electron-store wrapper, without local type redefinition or cross-boundary storage leakage.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-005-A` | `SEC-001` | Key store set/get/delete uses service `bookit-v2` and provider account names | `packages/electron-app/src/main/key-store.test.ts` compiles with mocked keytar driver |
| `TEST-005-B` | `SEC-002`, `INT-004` | Settings store accepts provider/model/base URL config but has no API key field | `packages/electron-app/src/main/settings-store.test.ts` compiles with mocked settings driver |
| `TEST-005-C` | `SEC-001`, `SEC-002` | Source search verifies storage boundary ownership | `keytar` appears only in `key-store.ts`; `new Store` appears only in `settings-store.ts` |

## Commands

```powershell
npx tsc --noEmit --project packages\electron-app\tsconfig.json
npm run build --workspace=@bookit/electron-app
```

## Current result

- Status: passed
- Last run: 2026-06-19
