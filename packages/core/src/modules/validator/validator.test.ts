import { describe, it, expect, vi, beforeEach } from 'vitest'
import { validate } from './validator'
import { aiClient } from '../../services/ai-client/ai-client'
import type { TransformedContent, FactualClaim } from '../../types/index'

vi.mock('../../services/ai-client/ai-client', () => ({
  aiClient: {
    generateText: vi.fn(),
  },
}))

describe('Validator', () => {
  const providerConfig = { provider: 'anthropic', model: 'claude-haiku-4-5' }
  const transformed: TransformedContent = {
    title: 'Test',
    sections: [{ type: 'body', body: 'The sky is blue.' }],
    techniqueAudit: { applied: [], skipped: [], conditionLog: {} }
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('validates claims successfully when all are present', async () => {
    const claims: FactualClaim[] = [{ id: 'claim-1', text: 'The sky is blue.' }]

    const mockResponse = {
      ok: true,
      value: {
        text: '```json\n{\n  "passed": true,\n  "failedClaims": []\n}\n```',
        usage: { inputTokens: 50, outputTokens: 10 },
      },
    }

    vi.mocked(aiClient.generateText).mockResolvedValue(mockResponse as any)

    const result = await validate(transformed, claims, providerConfig as any)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.result.passed).toBe(true)
      expect(result.value.result.failedClaims).toHaveLength(0)
      expect(result.value.tokenUsage).toEqual({ inputTokens: 50, outputTokens: 10 })
    }
  })

  it('reports failed claims correctly', async () => {
    const claims: FactualClaim[] = [{ id: 'claim-1', text: 'The sky is red.' }]

    const mockResponse = {
      ok: true,
      value: {
        text: '```json\n{\n  "passed": false,\n  "failedClaims": [\n    {\n      "claim": { "id": "claim-1", "text": "The sky is red." },\n      "reason": "Contradicted by \'The sky is blue.\'"\n    }\n  ]\n}\n```',
        usage: { inputTokens: 50, outputTokens: 20 },
      },
    }

    vi.mocked(aiClient.generateText).mockResolvedValue(mockResponse as any)

    const result = await validate(transformed, claims, providerConfig as any)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.result.passed).toBe(false)
      expect(result.value.result.failedClaims).toHaveLength(1)
      expect(result.value.result.failedClaims[0].reason).toContain('Contradicted')
    }
  })

  it('returns passed automatically if there are no claims', async () => {
    const claims: FactualClaim[] = []
    const result = await validate(transformed, claims, providerConfig as any)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.result.passed).toBe(true)
    }
    expect(aiClient.generateText).not.toHaveBeenCalled()
  })

  it('wraps AI errors as Result<never>', async () => {
    const claims: FactualClaim[] = [{ id: 'claim-1', text: 'The sky is blue.' }]
    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: false,
      error: { stage: 'Validating', cause: 'API timeout', retryable: true },
    })

    const result = await validate(transformed, claims, providerConfig as any)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.cause).toBe('API timeout')
    }
  })
})
