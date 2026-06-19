import { describe, it, expect, vi, beforeEach } from 'vitest'
import { extractClaims } from './claim-extractor'
import { aiClient } from '../../services/ai-client/ai-client'
import type { SourceContent } from '../../types/index'

vi.mock('../../services/ai-client/ai-client', () => ({
  aiClient: {
    generateText: vi.fn(),
  },
}))

describe('Claim Extractor', () => {
  const providerConfig = { provider: 'anthropic', model: 'claude-haiku-4-5' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('extracts claims successfully from valid text', async () => {
    const sourceContent: SourceContent = {
      text: 'The sky is blue. Water boils at 100 degrees Celsius.',
      inputType: 'paste',
    }

    const mockResponse = {
      ok: true,
      value: {
        text: '```json\n[\n  { "id": "claim-1", "text": "The sky is blue." },\n  { "id": "claim-2", "text": "Water boils at 100 degrees Celsius." }\n]\n```',
        usage: { inputTokens: 10, outputTokens: 20 },
      },
    }

    vi.mocked(aiClient.generateText).mockResolvedValue(mockResponse as any)

    const result = await extractClaims(sourceContent, providerConfig as any)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.claims).toHaveLength(2)
      expect(result.value.claims[0].text).toBe('The sky is blue.')
      expect(result.value.tokenUsage).toEqual({ inputTokens: 10, outputTokens: 20 })
    }
  })

  it('handles empty content gracefully without calling AI', async () => {
    const sourceContent: SourceContent = { text: '   ', inputType: 'paste' }
    const result = await extractClaims(sourceContent, providerConfig as any)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.claims).toHaveLength(0)
    }
    expect(aiClient.generateText).not.toHaveBeenCalled()
  })

  it('wraps AI errors as Result<never>', async () => {
    const sourceContent: SourceContent = { text: 'Valid content', inputType: 'paste' }
    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: false,
      error: { stage: 'Extracting', cause: 'API timeout', retryable: true },
    })

    const result = await extractClaims(sourceContent, providerConfig as any)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.cause).toBe('API timeout')
    }
  })

  it('handles malformed JSON from AI', async () => {
    const sourceContent: SourceContent = { text: 'Valid content', inputType: 'paste' }
    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: true,
      value: { text: 'Not a JSON array', usage: { inputTokens: 1, outputTokens: 1 } },
    } as any)

    const result = await extractClaims(sourceContent, providerConfig as any)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.cause).toContain('Failed to parse claims JSON')
    }
  })
})
