# Feature Spec: FEAT-007 — BYOA Settings & AI Client

## Metadata

- **Feature ID:** `FEAT-007`
- **Status:** accepted
- **Created:** 2026-06-18
- **Source artifacts:** `BMAD-SRC-003` §Decision 1, `BMAD-SRC-006` Epic 2
- **Related requirements:** `SEC-001`, `SEC-002`, `ARCH-001`, `INT-001`, `INT-004`

## Problem statement

Bookit makes AI calls on the user's behalf using the user's own API key. The key must be stored securely in the OS keychain — never on disk in plaintext. The app needs a first-launch wizard and ongoing settings screen so the user can configure and reconfigure their provider without friction.

## Goals

- `GOAL-001`: API keys stored securely in Windows Credential Manager (never in electron-store)
- `GOAL-002`: Two model slots (Transformation / Validation+Utility) configurable per provider
- `GOAL-003`: First-launch wizard gets the user configured before they reach the InputScreen
- `GOAL-004`: Settings screen allows provider and model slot changes at any time

## Non-goals

- `NG-001`: Web app API key security architecture — roadmap item
- `NG-002`: Shared/team API key management — single-user only
- `NG-003`: OpenRouter committed to v2 scope — possible add, not committed

## Users and stories

| Story ID | Priority | User story | Requirements |
|---|---|---|---|
| `STORY-2.1` | P0 | As Jason, I want my API keys stored in Windows Credential Manager so they never appear on disk in plaintext | `SEC-001`, `SEC-002`, `INT-004` |
| `STORY-2.2` | P0 | As a developer, I want a shared AI client that routes `generateText()` calls to the correct provider via Vercel AI SDK | `INT-001`, `ARCH-001`, `ARCH-002` |
| `STORY-2.3` | P0 | As Jason, I want a guided setup wizard on first launch so I can configure my provider before using the app | `SEC-001`, `INT-001` |
| `STORY-2.4` | P1 | As Jason, I want a Settings screen where I can view and edit provider + model slot config at any time | `INT-001`, `INT-004` |

## Requirements covered

| Requirement ID | Summary |
|---|---|
| `SEC-001` | API keys in Windows Credential Manager via `keytar` |
| `SEC-002` | No API key string ever passes through `electron-store` |
| `INT-001` | Vercel AI SDK — unified `generateText()` interface |
| `INT-004` | `electron-store` for non-sensitive config; `keytar` for keys |
| `ARCH-001` | `core` has zero Electron deps; `key-store.ts` and `settings-store.ts` in `electron-app` |
| `ARCH-002` | AI client returns `Result<T>`; provider errors wrapped, not thrown |

## Acceptance criteria

**SEC-001 / SEC-002 — Secure key storage:**
- Given I save an API key via settings UI
- When `keyStore.set(provider, apiKey)` is called
- Then key is stored in Windows Credential Manager under service name `bookit-v2`
- And no API key ever passes through `electron-store`

**INT-001 — AI client routing:**
- Given a `ProviderConfig { provider, model, apiKey?, baseUrl? }`
- When `aiClient.generateText(prompt, config)` is called
- Then the correct Vercel AI SDK adapter is invoked (anthropic / google / ollama)
- And response returns `{ text, usage: { inputTokens, outputTokens } }`
- And provider errors return `Result<never>` — never thrown across boundary

**First-launch wizard (FR-implied):**
- Given first launch (no providerConfig in settings-store)
- Then SetupWizard shown instead of InputScreen
- And wizard: Cloud or Local → provider → API key / base URL → test connection → model auto-assignment
- And after completion, InputScreen shown; subsequent launches skip wizard

**Settings screen:**
- Given app is configured
- When Settings opened
- Then Providers section with status cards; Model Slots section with Transformation + Validation/Utility rows; each editable
- And Ollama shows guidance note: "Minimum 8GB VRAM recommended"

## Edge cases

- Test connection failure during wizard → error shown inline; wizard does not advance
- Reconfigure Provider re-triggers wizard flow for that provider
- Ollama configuration: requires `baseUrl` (not API key); guidance note about model families

## UX and design notes

- Linked UX requirements: `UX-DR7` (SetupWizard), `UX-DR8` (Settings screen: Providers + Model Slots)
- Settings accessible via gear icon or menu item from `App.tsx`
- Settings changes persisted immediately on save — no "Apply" step
- Ollama note: "Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models."

## Technical notes

- `packages/electron-app/src/main/key-store.ts` — only file that calls `keytar`
- `packages/electron-app/src/main/settings-store.ts` — only file that instantiates `electron-store`
- `packages/core/src/services/ai-client/` — providers: `anthropic.ts`, `google.ts`, `ollama.ts`
- `core` never imports from `electron`; key/settings stores live exclusively in `electron-app/main/`
- Default model assignment: Anthropic → Transformation: `claude-sonnet-4-6`, Validation: `claude-haiku-4-5`

## Component breakdown

> **Agent-completed during the Superpowers design phase.**

**Approved for build:** [ ] Yes

## Implementation tasks

| Task ID | Requirement IDs | Description | Status |
|---|---|---|---|
| `TASK-020` | `SEC-001`, `SEC-002`, `INT-004` | `key-store.ts`: keytar wrapper (get/set/delete); `settings-store.ts`: electron-store wrapper | todo |
| `TASK-021` | `INT-001`, `ARCH-002` | `ai-client.ts` + `providers/`: unified generateText(), all 3 adapters, Result<T> errors | todo |
| `TASK-022` | `SEC-001`, `INT-001` | `SetupWizard.tsx`: 5-step wizard, test connection, model auto-assignment | todo |
| `TASK-023` | `INT-001`, `INT-004` | `Settings.tsx` + `ProviderCard.tsx` + `ModelSlot.tsx`: view/edit provider + slots | todo |

## Verification plan

| Test ID | Requirement/AC IDs | Test type | Expected result |
|---|---|---|---|
| `TEST-021` | `SEC-001`, `SEC-002` | unit | keyStore: set/get/delete via keytar (mocked); no key in electron-store |
| `TEST-022` | `INT-001`, `ARCH-002` | unit | aiClient: anthropic/google/ollama adapters (mocked); provider error → Result<never> |
| `TEST-023` | first-launch flow | integration | SetupWizard shown on first launch; InputScreen shown after completion |

## Open questions

None.
