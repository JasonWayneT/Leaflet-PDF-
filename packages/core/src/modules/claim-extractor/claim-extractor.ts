import type { SourceContent, FactualClaim, Result } from '../../types/index'
import type { ProviderConfig, AiTextResponse } from '../../services/ai-client/ai-client'
import { aiClient } from '../../services/ai-client/ai-client'
import { buildClaimExtractorPrompt } from './prompts'
import { randomUUID } from 'crypto'

export async function extractClaims(
  sourceContent: SourceContent,
  providerConfig: ProviderConfig
): Promise<Result<{ claims: FactualClaim[], tokenUsage: AiTextResponse['usage'] }>> {
  if (!sourceContent.text.trim()) {
    return { ok: true, value: { claims: [], tokenUsage: { inputTokens: 0, outputTokens: 0 } } }
  }

  const prompt = buildClaimExtractorPrompt(sourceContent)
  const result = await aiClient.generateText(prompt, providerConfig)
  
  if (!result.ok) {
    return {
      ok: false,
      error: {
        stage: 'Extracting',
        cause: result.error.cause,
        retryable: result.error.retryable
      }
    }
  }

  try {
    let jsonStr = result.value.text.trim()
    if (jsonStr.startsWith('\`\`\`json')) {
      jsonStr = jsonStr.replace(/^\`\`\`json/, '')
      if (jsonStr.endsWith('\`\`\`')) {
        jsonStr = jsonStr.slice(0, -3)
      }
    } else if (jsonStr.startsWith('\`\`\`')) {
      jsonStr = jsonStr.replace(/^\`\`\`/, '')
      if (jsonStr.endsWith('\`\`\`')) {
        jsonStr = jsonStr.slice(0, -3)
      }
    }
    
    const parsed = JSON.parse(jsonStr) as FactualClaim[]
    const claims = parsed.map(c => ({
      id: c.id && c.id.length > 0 ? c.id : randomUUID(),
      text: c.text
    }))
    
    return {
      ok: true,
      value: {
        claims,
        tokenUsage: result.value.usage
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        stage: 'Extracting',
        cause: `Failed to parse claims JSON: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true
      }
    }
  }
}
