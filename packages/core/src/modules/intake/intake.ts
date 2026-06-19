// Implements FR-001: paste text input validation and SourceContent formation.
// Implements FR-002: file import validation and SourceContent formation.
// Implements FR-003: YouTube URL input, transcript extraction, and caption preprocessing.
// Implements NFR-004: input capped at 100,000 characters; empty input rejected.
import * as fs from 'fs'
import * as path from 'path'
import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptNotAvailableError,
  YoutubeTranscriptVideoUnavailableError,
} from 'youtube-transcript'
import { aiClient, type ProviderConfig } from '../../services/ai-client/ai-client'
import type { Result, SourceContent } from '../../types/index'

/** Maximum allowed source content length in characters. (NFR-004) */
export const SOURCE_CONTENT_CHAR_LIMIT = 100_000

const intakeError = (cause: string): Result<never> => ({
  ok: false,
  error: {
    stage: 'Extracting',
    cause,
    retryable: false,
  },
})

/**
 * Validates raw pasted text and wraps it as SourceContent.
 *
 * Implements AC-001: valid paste → SourceContent with inputType 'paste'.
 * Implements AC-002: empty text → Result<never> with cause "Content required".
 * Implements AC-003: oversized text → Result<never> with character count in cause.
 */
export function processTextInput(text: string): Result<SourceContent> {
  // AC-002: reject empty or whitespace-only input
  if (text.trim().length === 0) {
    return intakeError('Content required')
  }

  // AC-003: reject input exceeding the character cap
  if (text.length > SOURCE_CONTENT_CHAR_LIMIT) {
    return intakeError(
      `Input exceeds the ${SOURCE_CONTENT_CHAR_LIMIT.toLocaleString()}-character limit (${text.length.toLocaleString()} characters). Trim the content and try again.`
    )
  }

  // AC-001: valid paste — wrap as SourceContent
  return {
    ok: true,
    value: {
      text,
      inputType: 'paste',
    },
  }
}

/** Supported file extensions for file import (FR-002). */
const SUPPORTED_EXTENSIONS = new Set(['.md', '.txt'])

/**
 * Reads and validates a local file as SourceContent.
 *
 * Implements AC-004: valid .md/.txt file → SourceContent with inputType 'file'.
 * Implements AC-005: unsupported extension → Result<never> with "Only .md and .txt files are supported".
 * Implements AC-006: empty file → Result<never> with "File is empty".
 *
 * File reading uses Node fs (no Electron dependency — called from main process via IPC).
 */
export function processFileInput(filePath: string): Result<SourceContent> {
  // AC-005: reject unsupported file extensions
  const ext = path.extname(filePath).toLowerCase()
  if (!SUPPORTED_EXTENSIONS.has(ext)) {
    return intakeError('Only .md and .txt files are supported')
  }

  // Read file — catch OS / permission errors
  let content: string
  try {
    content = fs.readFileSync(filePath, 'utf-8')
  } catch (error) {
    return intakeError(
      `File could not be read: ${error instanceof Error ? error.message : String(error)}`
    )
  }

  // AC-006: reject empty files
  if (content.trim().length === 0) {
    return intakeError('File is empty')
  }

  // NFR-004: apply the same character cap as paste text
  if (content.length > SOURCE_CONTENT_CHAR_LIMIT) {
    return intakeError(
      `File exceeds the ${SOURCE_CONTENT_CHAR_LIMIT.toLocaleString()}-character limit (${content.length.toLocaleString()} characters). Split the file and process each part separately.`
    )
  }

  // AC-004: valid file — wrap as SourceContent
  return {
    ok: true,
    value: {
      text: content,
      inputType: 'file',
    },
  }
}

// ─── YouTube URL Input ────────────────────────────────────────────────────────

/**
 * Regex matching valid YouTube watch and short URLs.
 * Implements AC-009: URL validation runs before any network call.
 */
const YOUTUBE_URL_PATTERN =
  /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+)/i

/**
 * Strips noise from a raw YouTube transcript and restores sentence flow.
 *
 * Implements spec requirement: pure function — no AI, no side effects.
 * Operations (in order):
 *  1. Decode HTML entities (&amp; → &, &#39; → ')
 *  2. Remove bracket annotations ([Music], [Applause], [inaudible], [SPEAKER]:)
 *  3. Remove parenthetical timestamps ((00:01), (00:01:23))
 *  4. Remove standalone filler words (uh, um, uh-huh) — word-boundary matched
 *  5. Collapse excess whitespace
 *  6. Ensure capital letter after sentence-ending punctuation
 */
export function preprocessCaptions(raw: string): string {
  let text = raw

  // 1. HTML entity decoding
  text = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // 2. Bracket annotations: [Music], [Applause], [inaudible], [SPEAKER NAME]:
  text = text.replace(/\[[^\]]{1,50}\]:?/gi, '')

  // 3. Parenthetical timestamps: (00:01), (1:23:45)
  text = text.replace(/\(\d{1,2}:\d{2}(:\d{2})?\)/g, '')

  // 4. Standalone filler words
  text = text.replace(/\b(uh-huh|uh|um|hmm|hm)\b/gi, '')

  // 5. Collapse whitespace and trim
  text = text.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

  // 6. Capitalise first letter after sentence-ending punctuation + space
  text = text.replace(/([.?!])\s+([a-z])/g, (_match, punct: string, letter: string) =>
    `${punct} ${letter.toUpperCase()}`
  )

  return text
}

/**
 * Validates a YouTube URL, fetches the transcript, preprocesses captions,
 * and returns SourceContent with inputType 'youtube'.
 *
 * Implements AC-007: valid URL + transcript → SourceContent with inputType 'youtube'.
 * Implements AC-008: no transcript → Result<never> with "No transcript available..." message.
 * Implements AC-009: invalid URL → Result<never> before any network call.
 */
export async function processYouTubeInput(url: string): Promise<Result<SourceContent>> {
  // AC-009: URL validation before any network call
  if (!YOUTUBE_URL_PATTERN.test(url.trim())) {
    return intakeError('Please enter a valid YouTube URL')
  }

  // Fetch transcript — map known error classes to user-facing messages
  let segments: Array<{ text: string }>
  try {
    segments = await YoutubeTranscript.fetchTranscript(url.trim())
  } catch (error) {
    if (
      error instanceof YoutubeTranscriptNotAvailableError ||
      error instanceof YoutubeTranscriptDisabledError ||
      error instanceof YoutubeTranscriptVideoUnavailableError
    ) {
      // AC-008: no transcript available
      return intakeError(
        'No transcript available for this video. Try pasting the content manually.'
      )
    }
    // Network or unexpected error — surface as retryable
    return {
      ok: false,
      error: {
        stage: 'Extracting',
        cause:
          error instanceof Error
            ? `Transcript fetch failed: ${error.message}`
            : 'Transcript fetch failed: unknown error',
        retryable: true,
      },
    }
  }

  // Join segment texts and preprocess
  const rawText = segments.map((s) => s.text).join(' ')
  const cleanText = preprocessCaptions(rawText)

  // Treat empty result after preprocessing as no transcript
  if (cleanText.trim().length === 0) {
    return intakeError(
      'No transcript available for this video. Try pasting the content manually.'
    )
  }

  // AC-007: valid transcript — wrap as SourceContent
  return {
    ok: true,
    value: {
      text: cleanText,
      inputType: 'youtube',
    },
  }
}

// ─── AI Derivation ────────────────────────────────────────────────────────────

/**
 * Derives a short, descriptive title from the provided text using the AI client.
 * 
 * Implements Story 3.4: only sends the first 500 characters to conserve tokens.
 * Returns a Promise resolving to a Result<string>.
 * Any token usage logging is deferred to the caller/orchestrator.
 */
export async function deriveTitle(
  text: string,
  aiConfig: ProviderConfig
): Promise<Result<{ title: string; usage: { inputTokens: number; outputTokens: number } }>> {
  // Use a 500 character snippet to derive the title
  const sample = text.trim().slice(0, 500)
  
  if (sample.length === 0) {
    return {
      ok: true,
      value: { title: 'Untitled Document', usage: { inputTokens: 0, outputTokens: 0 } },
    }
  }

  const prompt = `Based on the following text snippet, provide a concise, descriptive title (maximum 60 characters). Respond ONLY with the title, with no quotes, prefixes, or conversational filler.\n\nText:\n${sample}`

  const response = await aiClient.generateText(prompt, aiConfig)

  if (!response.ok) {
    // Propagate the AI error result as Result<never>
    return response
  }

  return {
    ok: true,
    value: { title: response.value.text.trim(), usage: response.value.usage },
  }
}
