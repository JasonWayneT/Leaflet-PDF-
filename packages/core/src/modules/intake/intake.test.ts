// Implements ARCH-006: co-located compile-time test for intake module.
// Implements FR-001, NFR-004: verifies processTextInput type surface and result shapes.
// Implements FR-002, AC-004–006: verifies processFileInput type surface and result shapes.
// Implements FR-003, AC-007–009: verifies processYouTubeInput and preprocessCaptions.
import type { Result, SourceContent } from '../../types/index'
import {
  processTextInput,
  processFileInput,
  processYouTubeInput,
  preprocessCaptions,
  deriveTitle,
  SOURCE_CONTENT_CHAR_LIMIT,
} from './intake'
import type { ProviderConfig } from '../../services/ai-client/ai-client'

// ─── processTextInput ────────────────────────────────────────────────────────

// --- AC-001: valid paste input ---
const validText = 'The deterministic pipeline runs before any AI call.'
const validResult: Result<SourceContent> = processTextInput(validText)

if (validResult.ok) {
  const sc: SourceContent = validResult.value
  const _check: boolean = sc.inputType === 'paste'
  void _check
}

// --- AC-002: empty input rejected ---
const emptyResult: Result<SourceContent> = processTextInput('')
const whitespaceResult: Result<SourceContent> = processTextInput('   ')

if (!emptyResult.ok) {
  const _cause: string = emptyResult.error.cause
  void _cause
}

// --- AC-003: oversized input rejected ---
const oversizedText = 'x'.repeat(SOURCE_CONTENT_CHAR_LIMIT + 1)
const oversizedResult: Result<SourceContent> = processTextInput(oversizedText)

if (!oversizedResult.ok) {
  const _stage: string = oversizedResult.error.stage
  void _stage
}

// --- Boundary: exactly at the limit is valid ---
const limitText = 'y'.repeat(SOURCE_CONTENT_CHAR_LIMIT)
const limitResult: Result<SourceContent> = processTextInput(limitText)

// ─── processFileInput ────────────────────────────────────────────────────────

// --- AC-004: valid .md file — type signature check ---
const mdFileResult: Result<SourceContent> = processFileInput('/path/to/doc.md')
const txtFileResult: Result<SourceContent> = processFileInput('/path/to/doc.txt')

if (mdFileResult.ok) {
  const sc: SourceContent = mdFileResult.value
  const _check: boolean = sc.inputType === 'file'
  void _check
}

// --- AC-005: unsupported extension ---
const pdfResult: Result<SourceContent> = processFileInput('/path/to/doc.pdf')
const docxResult: Result<SourceContent> = processFileInput('/path/to/doc.docx')

if (!pdfResult.ok) {
  const _cause: string = pdfResult.error.cause
  const _stage: string = pdfResult.error.stage
  void [_cause, _stage]
}

// --- AC-006: empty file (extension passes, runtime content would be empty) ---
const emptyFileResult: Result<SourceContent> = processFileInput('/path/to/empty.md')

if (!emptyFileResult.ok) {
  const _retryable: boolean = emptyFileResult.error.retryable
  void _retryable
}

// ─── preprocessCaptions ──────────────────────────────────────────────────────

// Pure function — input is a noisy raw transcript string; output must be a string.
const noisyTranscript =
  '[Music] uh so today (00:01) we&amp;re going to talk about [inaudible] um the pipeline. ' +
  '[SPEAKER]: it runs deterministically. every time.'

const cleanTranscript: string = preprocessCaptions(noisyTranscript)
// Verify return type is string (compile-time check)
const _cleanIsString: boolean = typeof cleanTranscript === 'string'
void _cleanIsString

// Empty string in → empty string out
const _emptyClean: string = preprocessCaptions('')
void _emptyClean

// ─── processYouTubeInput ──────────────────────────────────────────────────────

// AC-007: valid URL — return type is Promise<Result<SourceContent>>
const validUrlPromise: Promise<Result<SourceContent>> =
  processYouTubeInput('https://www.youtube.com/watch?v=dQw4w9WgXcQ')

// AC-009: invalid URL — must still return Promise<Result<SourceContent>>
const invalidUrlPromise: Promise<Result<SourceContent>> =
  processYouTubeInput('https://example.com/not-youtube')

// Type-check the promise resolution shape
void validUrlPromise.then((result: Result<SourceContent>) => {
  if (result.ok) {
    const sc: SourceContent = result.value
    const _check: boolean = sc.inputType === 'youtube'
    void _check
  } else {
    const _cause: string = result.error.cause
    void _cause
  }
})

// youtu.be short-URL format must also satisfy the return type
const shortUrlPromise: Promise<Result<SourceContent>> =
  processYouTubeInput('https://youtu.be/dQw4w9WgXcQ')

// ─── deriveTitle ──────────────────────────────────────────────────────────────

// AC-3.4: valid call returns Promise<Result<string>>
const mockAiConfig: ProviderConfig = {
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  apiKey: 'test-key',
}

const derivedTitlePromise: Promise<Result<{ title: string; usage: { inputTokens: number; outputTokens: number; } }>> = deriveTitle(
  'A very long text that goes on...',
  mockAiConfig
)

// Type-check resolution shape
void derivedTitlePromise.then((result: Result<{ title: string; usage: { inputTokens: number; outputTokens: number; } }>) => {
  if (result.ok) {
    const _title: string = result.value.title
    void _title
  } else {
    const _cause: string = result.error.cause
    void _cause
  }
})

// Suppress unused-variable warnings
void [
  validResult, emptyResult, whitespaceResult, oversizedResult, limitResult,
  mdFileResult, txtFileResult, pdfResult, docxResult, emptyFileResult,
  invalidUrlPromise, shortUrlPromise, derivedTitlePromise,
]
