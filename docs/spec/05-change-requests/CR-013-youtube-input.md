# CR-013 — YouTube URL Input & Transcript Extraction (Story 3.3)

## Summary

Extend `packages/core/src/modules/intake/intake.ts` with:
1. `preprocessCaptions(raw: string): string` — pure function that strips timestamps, speaker labels, and filler tokens from raw YouTube transcript segments and restores sentence boundaries
2. `processYouTubeInput(url: string): Promise<Result<SourceContent>>` — validates the URL, calls `youtube-transcript`, preprocesses the result, and returns `SourceContent` with `inputType: 'youtube'`

`youtube-transcript` must be added to `@leafletpdf/core`'s dependencies (currently in `electron-app` only).

## Change type

Feature — extends existing core module; adds one dependency to `@leafletpdf/core`

## Requirements addressed

- `FR-003`: User can enter a YouTube URL; app extracts transcript as Source Content
- `AC-007`: Valid YouTube URL + transcript available → SourceContent with `inputType: 'youtube'`
- `AC-008`: No transcript available → `Result<never>` cause "No transcript available for this video. Try pasting the content manually."
- `AC-009`: Invalid URL → `Result<never>` cause "Please enter a valid YouTube URL" (before extraction)
- `ARCH-002`: Returns `Result<T>` — no raw throws across boundary
- `ARCH-004`: `SourceContent` imported from types, never redefined locally
- `ARCH-006`: Tests co-located with source

## Design

### URL validation (AC-009)
Pattern matches `youtube.com/watch?v=` and `youtu.be/` — runs before any network call.

### preprocessCaptions (spec requirement: pure, no AI)
Receives `TranscriptResponse[]` joined with spaces. Cleans:
- Timestamps (e.g. `[00:01:23]`, `(00:01)`)
- Speaker labels (e.g. `[SPEAKER]:`, `Speaker:`)
- Filler tokens: `[Music]`, `[Applause]`, `[inaudible]`, `uh`, `um` etc.
- Restores sentence boundaries: ensure capital after `.?!` followed by space

### Error mapping
- `YoutubeTranscriptNotAvailableError` / `YoutubeTranscriptDisabledError` / `YoutubeTranscriptVideoUnavailableError` → AC-008 message
- All other errors → cause string from error message

## Files affected

### Modified

- `packages/core/package.json` — add `youtube-transcript` dependency
- `packages/core/src/modules/intake/intake.ts` — add `preprocessCaptions` + `processYouTubeInput`
- `packages/core/src/modules/intake/intake.test.ts` — add URL + caption preprocessing test cases
- `packages/core/src/index.ts` — export `processYouTubeInput` and `preprocessCaptions`

## Implementation tasks

- [x] TASK-S33-01: Create CR-013 document
- [x] TASK-S33-02: Add `youtube-transcript` to `@leafletpdf/core` package.json
- [x] TASK-S33-03: Add `preprocessCaptions` and `processYouTubeInput` to `intake.ts`
- [x] TASK-S33-04: Extend `intake.test.ts` with YouTube scenarios
- [x] TASK-S33-05: Export new functions from `@leafletpdf/core`
- [x] TASK-S33-06: Run `npm install` + verify `tsc --noEmit` + full workspace build
- [x] TASK-S33-07: Update traceability matrix

## Verification

- `npm install` resolved `youtube-transcript@1.3.1` in `@leafletpdf/core` (workspace deduplicated) ✅
- `npx tsc --noEmit --project packages\core\tsconfig.json` ✅ passes
- `npm run build --workspaces --if-present` ✅ passes
- Source grep confirms `packages/core` has no `electron` import ✅
- `preprocessCaptions` is a pure function (regex only, no imports beyond string ops) ✅

## Status

`complete`
