# Change Request: CR-006 CI Build Workflow

## Metadata

- Change request ID: `CR-006`
- Type: operations
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Implement Story 1.5 by adding a GitHub Actions workflow that runs on push and pull request, uses Node.js 20 on `windows-latest`, installs dependencies with `npm ci`, and fails when workspace build/type verification fails.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: yes (`OPS-001`)
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: low

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `OPS-001` | implements | Adds CI build verification for push and pull request |
| `NFR-005` | supports | Supports Windows desktop distribution quality gate |

## Documentation updates required before code

- [x] `OPS-001` added to requirements registry
- [x] Change request created
- [x] Traceability matrix updated
- [x] Test spec added

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S15-01` | `OPS-001` | Create `.github/workflows/build.yml` with Story 1.5 trigger, OS, Node, install, and build steps | completed |
| `TASK-S15-02` | `OPS-001`, `NFR-005` | Run local equivalent of CI build command | completed |
| `TASK-S15-03` | `OPS-001` | Verify workflow file content matches acceptance criteria | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `TEST-004` | CI workflow exists and matches Story 1.5 acceptance criteria | passed |
| `VERIFY-S15-01` | `npm ci` can install from lockfile | passed |
| `VERIFY-S15-02` | `npm run build --workspaces --if-present` passes locally | passed |

## Final notes

- Implementation summary: Added `.github/workflows/build.yml` named `CI Build`, running on `push` and `pull_request`, using Node.js 20 on `windows-latest`, with `npm ci` followed by `npm run build --workspaces --if-present`.
- Tests run: `npm ci` passed; `npm run build --workspaces --if-present` passed; workflow file inspection confirmed Story 1.5 trigger, runner, Node, install, and build criteria.
- Open risks: `npm audit --omit=dev --json` reports two low-severity runtime findings through `ollama-ai-provider` / `@ai-sdk/provider-utils` with no fix available; Story 2.2 should re-check provider package status while implementing the AI client.
