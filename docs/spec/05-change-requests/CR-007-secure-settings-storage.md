# Change Request: CR-007 Secure Settings Storage

## Metadata

- Change request ID: `CR-007`
- Type: feature
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Implement Story 2.1 by adding secure API key storage through `keytar` and non-sensitive settings persistence through `electron-store`, with the storage boundary enforced by separate main-process modules.

## Classification

- User-visible behavior change: no
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: medium

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `SEC-001` | implements | API keys stored through Windows Credential Manager via `keytar` |
| `SEC-002` | implements | Settings schema excludes API key fields from `electron-store` |
| `INT-004` | implements | Separates `electron-store` config from `keytar` credentials |

## Documentation updates required before code

- [x] Change request created
- [x] Traceability matrix updated
- [x] Test spec added

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S21-01` | `SEC-001` | Create `key-store.ts` wrapper for `keytar` set/get/delete under service `bookit-v2` | completed |
| `TASK-S21-02` | `SEC-002`, `INT-004` | Create typed `settings-store.ts` wrapper for non-sensitive settings only | completed |
| `TASK-S21-03` | `SEC-001`, `SEC-002`, `INT-004` | Add co-located compile tests with mocked storage drivers | completed |
| `TASK-S21-04` | `SEC-001`, `SEC-002` | Verify only `key-store.ts` references `keytar` and only `settings-store.ts` instantiates `electron-store` | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `TEST-005` | Key and settings storage contracts compile and enforce separate storage boundaries | passed |
| `VERIFY-S21-01` | `npm run build --workspace=@bookit/electron-app` passes | passed |
| `VERIFY-S21-02` | Source grep confirms keytar/electron-store boundary rules | passed |

## Final notes

- Implementation summary: Added `key-store.ts` with a `keytar` driver wrapper using service name `bookit-v2`, plus `settings-store.ts` with a typed non-sensitive settings schema backed by `electron-store`. Added co-located compile tests with mocked drivers.
- Tests run: `npx tsc --noEmit --project packages\electron-app\tsconfig.json` failed before implementation with missing storage modules, then passed; `npm run build --workspace=@bookit/electron-app` passed; `npm run build --workspaces --if-present` passed; source greps confirmed storage boundary ownership.
- Open risks: Storage behavior is covered by compile-time driver tests only until a runtime test runner is added; first real `keytar` and `electron-store` calls will be exercised by later settings UI / IPC stories.
