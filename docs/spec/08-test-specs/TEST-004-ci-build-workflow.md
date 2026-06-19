# TEST-004 CI Build Workflow

## Requirement links

- `OPS-001`
- `NFR-005`

## Purpose

Prove that Story 1.5 adds a GitHub Actions workflow that runs on push and pull request, installs dependencies reproducibly, and fails if any workspace build fails.

## Test cases

| Test ID | Requirement IDs | Scenario | Verification |
|---|---|---|---|
| `TEST-004-A` | `OPS-001` | Workflow exists at `.github/workflows/build.yml` | File inspection |
| `TEST-004-B` | `OPS-001` | Workflow runs on `push` and `pull_request` | File inspection |
| `TEST-004-C` | `OPS-001` | Workflow uses `windows-latest` and Node.js 20 | File inspection |
| `TEST-004-D` | `OPS-001` | Workflow runs `npm ci` then `npm run build --workspaces --if-present` | File inspection and local command execution |

## Commands

```powershell
npm ci
npm run build --workspaces --if-present
```

## Current result

- Status: passed
- Last run: 2026-06-19
