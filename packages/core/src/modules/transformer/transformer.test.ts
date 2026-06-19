import { describe, it, expect, vi, beforeEach } from 'vitest'
import { transform } from './transformer'
import { aiClient, type ProviderConfig } from '../../services/ai-client/ai-client'
import type { SourceContent, TechniqueList, FactualClaim } from '../../types/index'

vi.mock('../../services/ai-client/ai-client', () => ({
  aiClient: {
    generateText: vi.fn()
  }
}))

describe('Transformer Module', () => {
  const mockConfig: ProviderConfig = { provider: 'anthropic', model: 'claude-sonnet-4-6', apiKey: 'test' }
  const mockTechniques: TechniqueList = {
    always: ['BLUF', 'teach-not-label-headings', '60-second-cheat-sheet'],
    conditional: ['mental-buckets'],
    conditionLog: { 'mental-buckets': 'test' }
  }
  const mockContent: SourceContent = { text: 'test content', inputType: 'paste', title: 'Test Title' }
  const mockClaims: FactualClaim[] = [{ id: '1', text: 'claim 1' }]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('transforms content and returns structured JSON', async () => {
    const mockJson = JSON.stringify({
      title: 'Transformed Title',
      sections: [{ type: 'BLUF', body: 'Bluf text' }]
    })

    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: true,
      value: { text: mockJson, usage: { inputTokens: 10, outputTokens: 20 } }
    })

    const result = await transform({ sourceContent: mockContent, techniques: mockTechniques, claims: mockClaims }, mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.content.title).toBe('Transformed Title')
      expect(result.value.content.sections).toHaveLength(1)
      expect(result.value.content.techniqueAudit.applied).toContain('mental-buckets')
      expect(result.value.content.techniqueAudit.conditionLog).toEqual({ 'mental-buckets': 'test' })
      expect(result.value.usage.inputTokens).toBe(10)
    }
  })

  it('handles markdown wrapped JSON', async () => {
    const mockJson = '\`\`\`json\\n{"title":"Markdown Title","sections":[]}\\n\`\`\`'

    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: true,
      value: { text: mockJson, usage: { inputTokens: 10, outputTokens: 20 } }
    })

    const result = await transform({ sourceContent: mockContent, techniques: mockTechniques, claims: mockClaims }, mockConfig)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.content.title).toBe('Markdown Title')
    }
  })

  it('returns PipelineError on JSON parse failure', async () => {
    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: true,
      value: { text: 'Not JSON', usage: { inputTokens: 10, outputTokens: 20 } }
    })

    const result = await transform({ sourceContent: mockContent, techniques: mockTechniques, claims: mockClaims }, mockConfig)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.stage).toBe('Transforming')
      expect(result.error.cause).toContain('Failed to parse')
    }
  })

  it('returns PipelineError on AI Client error', async () => {
    vi.mocked(aiClient.generateText).mockResolvedValue({
      ok: false,
      error: { stage: 'Transforming', cause: 'Network error', retryable: true }
    })

    const result = await transform({ sourceContent: mockContent, techniques: mockTechniques, claims: mockClaims }, mockConfig)

    expect(result.ok).toBe(false)
  })
})
