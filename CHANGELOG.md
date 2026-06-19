# Changelog — [Project Name]

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [Unreleased]

> Entries accumulate here during active development. Move them into a versioned release when you ship.

### Added
- [DRAFT] Epic 1 foundation: npm workspaces monorepo, Electron/React app shell, shared core type contracts, IPC bridge skeleton, and GitHub Actions CI build workflow
- [DRAFT] Secure settings storage foundation: keytar-backed API key wrapper and typed electron-store wrapper for non-sensitive provider settings
- [DRAFT] Shared AI client foundation: Anthropic, Google, and Ollama provider adapters with Result-based error handling

### Fixed
- [DRAFT] BUG-002: Electron Forge packaging now uses the emitted Vite main bundle path and electron-app TypeScript checks include package-level config files
- [DRAFT] BUG-001: Ollama support now uses AI SDK v6-compatible `ollama-ai-provider-v2`

### Developer
- [DRAFT] CR-004: Working specs now reference `ollama-ai-provider` for Ollama integration; adapter behavior remains to be verified in Story 2.2

---

## [0.1.0] — YYYY-MM-DD

### Added
- [New feature or capability visible to a user]

### Changed
- [Modification to existing behavior]

### Fixed
- [Bug that was corrected]

### Removed
- [Feature or behavior that was intentionally removed]

### Security
- [Vulnerability fixed or security improvement made]

---

<!--
INSTRUCTIONS FOR AGENTS AND CONTRIBUTORS

1. Add new entries under [Unreleased] as you work — not after the fact.
2. On release: rename [Unreleased] to the version + date, add a fresh [Unreleased] above it.
3. Use ISO dates: YYYY-MM-DD.
4. Omit empty sections — if nothing was Removed, skip the Removed header.
5. One entry per line. Start with a capital letter, no period at the end.
6. Focus on user-facing changes. Skip internal refactors unless they affect behavior.
-->
