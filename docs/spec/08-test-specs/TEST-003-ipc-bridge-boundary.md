# TEST-003 IPC Bridge Boundary

## Requirement links

- `ARCH-003`
- `ARCH-005`

## Purpose

Prove that Story 1.4 defines the IPC channel contract once and keeps Electron `ipcMain` usage isolated to `packages/electron-app/src/main/ipc-bridge.ts`.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-003-A` | `ARCH-003` | Import `IPC_CHANNELS` and validate all Story 1.4 channel names | `packages/electron-app/src/renderer/types/ipc.test.ts` compiles under `tsc --noEmit` |
| `TEST-003-B` | `ARCH-003`, `ARCH-005` | Import bridge registration types from `main/ipc-bridge.ts` | `packages/electron-app/src/main/ipc-bridge.test.ts` compiles under `tsc --noEmit` |
| `TEST-003-C` | `ARCH-003` | Search `packages/` for `ipcMain` imports | Only `packages/electron-app/src/main/ipc-bridge.ts` imports `ipcMain` from `electron` |

## Commands

```powershell
npx tsc --noEmit --project packages\electron-app\tsconfig.json
npm run build --workspace=@bookit/electron-app
rg -n "ipcMain" packages
```

## Current result

- Status: passed
- Last run: 2026-06-19
