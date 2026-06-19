# BUG-002 Electron Package Verification Blockers

## Metadata

- Bug ID: `BUG-002`
- Status: open
- Severity: P2
- Created: 2026-06-19
- Updated: 2026-06-19

## Summary

Workspace-level verification currently exposes Electron package build blockers that are outside Story 1.3 shared type definitions.

## Affected requirements

- `ARCH-001`
- `NFR-005`

## Observed behavior

`npm run build --workspaces --if-present` successfully compiles `@bookit/core`, starts the Electron Forge package flow, and completes Vite main/preload/renderer bundle generation. Packaging then fails because Electron Packager cannot find `packages/electron-app/.vite/build/main.js`.

Direct TypeScript verification with `npx tsc --noEmit --project packages/electron-app/tsconfig.json` also fails before type-checking application code because `forge.config.ts` and Vite config files are included while `rootDir` is `./src`.

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

- Result: open
- Last observed: 2026-06-19
