# ADR-004 — keytar for API Key Storage (Windows Credential Manager)

## Status

accepted

## Context

Leaflet PDF stores the user's AI API key locally. The key grants access to external AI APIs and must not appear on disk in plaintext. The app targets Windows 11. The storage solution must be compatible with Electron and integrate with the OS-native keychain.

## Decision

`keytar` stores API keys in Windows Credential Manager (OS keychain). Non-sensitive config (provider type, model name, base URL, slot assignments) is stored in `electron-store`. The two stores are strictly separated — no API key string ever passes through `electron-store`.

## Requirement links

- `SEC-001`
- `SEC-002`
- `INT-004`

## Consequences

### Positive

- Keys stored in Windows Credential Manager — OS-level protection
- Keys never appear on disk in plaintext or in any log file
- `electron-store` handles non-sensitive config without the overhead of a keychain call

### Negative

- `keytar` has a native Node add-on — must be rebuilt for the target Electron version during packaging
- Windows Credential Manager access requires the app to run on the user's account (not elevated)

### Neutral

- Service name in Credential Manager: `Leaflet PDF-v2`
- `key-store.ts` is the only file that imports `keytar`; `settings-store.ts` is the only file that instantiates `electron-store`

## Alternatives considered

| Option | Why rejected |
|---|---|
| electron-store (encrypted) | Encryption key must be stored somewhere — shifts the problem; Credential Manager is purpose-built for this |
| Plaintext JSON file | Unacceptable — key visible on disk to any process with file system access |
| Environment variable | Not persistent across launches; requires user to set it externally each time |
