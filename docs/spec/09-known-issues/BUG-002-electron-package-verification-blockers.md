# BUG-002 Electron Package Verification Blockers

## Metadata

- Bug ID: `BUG-002`
- Status: resolved
- Severity: P2
- Created: 2026-06-19
- Updated: 2026-06-19
- Fixed in: `CR-004`

## Summary

Workspace-level verification currently exposes Electron package build blockers that are outside Story 1.3 shared type definitions.

## Affected requirements

- `ARCH-001`
- `NFR-005`

## Observed behavior

Before `CR-004`, `npm run build --workspaces --if-present` successfully compiled `@bookit/core`, started the Electron Forge package flow, and completed Vite main/preload/renderer bundle generation. Packaging then failed because Electron Packager could not find `packages/electron-app/.vite/build/main.js`.

Direct TypeScript verification with `npx tsc --noEmit --project packages/electron-app/tsconfig.json` also failed before type-checking application code because `forge.config.ts` and Vite config files were included while `rootDir` was `./src`.

## Root cause

Forge Vite emitted the main bundle to `.vite/build/index.js`, while `packages/electron-app/package.json` declared `.vite/build/main.js`. Separately, the TypeScript project explicitly included package-level config files while restricting `rootDir` to `./src`.

## Fix

- `packages/electron-app/package.json` now uses `"main": ".vite/build/index.js"`.
- `packages/electron-app/tsconfig.json` now uses `"rootDir": "."`.

## Expected behavior

Workspace build verification should compile or package all packages without configuration-level failures.

## Reproduction

```powershell
npm run build --workspaces --if-present
npx tsc --noEmit --project packages\electron-app\tsconfig.json
```

## Regression acceptance criterion

`npm run build --workspaces --if-present` completes without Electron package entry-point errors, or the workspace build script is adjusted to use a TypeScript-only check until Story 1.5 establishes CI build semantics.

## Verification

- Result: resolved
- Last run: 2026-06-19
- Evidence: `npm run build --workspace=@bookit/electron-app`, `npx tsc --noEmit --project packages\electron-app\tsconfig.json`, and `npm run build --workspaces --if-present` all passed.
