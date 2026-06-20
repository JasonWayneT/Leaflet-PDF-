# Change Request: CR-009 First-Launch Setup Wizard

## Metadata

- Change request ID: `CR-009`
- Type: feature
- Status: implemented
- Requested by: Jason (PM)
- Created: 2026-06-19
- Updated: 2026-06-19

## Request

Implement Story 2.3 by adding a first-launch setup wizard that appears when no provider configuration exists, collects provider credentials/configuration, tests the selected provider, stores settings/keys through the main-process storage boundary, and then shows the app's main screen.

## Classification

- User-visible behavior change: yes
- Requires new requirement ID: no
- Requires design update: no
- Requires tests: yes
- Requires migration: no
- Risk level: medium

## Impacted IDs

| ID | Impact type | Notes |
|---|---|---|
| `SEC-001` | uses | API key write routes through `keyStore` |
| `SEC-002` | uses | Provider settings exclude API key values |
| `INT-001` | uses | Test connection calls shared `aiClient` |
| `INT-004` | uses | Non-sensitive config routes through `settingsStore` |

## Documentation updates required before code

- [x] Change request created
- [x] Traceability matrix updated
- [x] Test spec added

## Proposed implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-S23-01` | `INT-004` | Expose settings/key/test-connection methods through preload and IPC bridge | completed |
| `TASK-S23-02` | `SEC-001`, `SEC-002` | Save provider config to settings-store and API keys to key-store only | completed |
| `TASK-S23-03` | `INT-001` | Test provider connection with minimal AI ping prompt | completed |
| `TASK-S23-04` | `SEC-001`, `INT-001` | Build `SetupWizard.tsx` multi-step flow and first-launch skip logic in `App.tsx` | completed |

## Verification

| Test ID | What it proves | Result |
|---|---|---|
| `TEST-007` | Setup wizard contracts compile and storage/IPC boundaries remain intact | passed |
| `VERIFY-S23-01` | `npm run build --workspace=@leafletpdf/electron-app` passes | passed |
| `VERIFY-S23-02` | Source grep confirms API keys do not pass through settings store | passed |

## Final notes

- Implementation summary: Added renderer preload API types, exposed setup/settings/provider-test methods from preload, wired IPC handlers to `settingsStore`, `keyStore`, and `aiClient`, and built a first-launch `SetupWizard.tsx` flow with provider choice, credential/base URL input, connection test, model-slot confirmation, persistence, and skip logic in `App.tsx`. Added `keytar` to Vite main externals so native module packaging works when the IPC bridge imports the key store.
- Tests run: `npx tsc --noEmit --project packages\electron-app\tsconfig.json` failed before implementation on missing setup modules, then passed; `npm run build --workspace=@leafletpdf/electron-app` initially exposed the native `keytar` bundling issue, then passed after externalization; `npm run build --workspaces --if-present` passed; source greps confirmed storage boundary ownership and no API key fields in `settings-store.ts`.
- Open risks: Visual/manual Electron launch verification has not been performed in this environment; real provider test calls require configured credentials or a running Ollama server.
