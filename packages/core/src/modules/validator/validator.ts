import type { TransformedContent, FactualClaim, FailedClaim, Result } from '../../types/index'
import type { ProviderConfig, AiTextResponse } from '../../services/ai-client/ai-client'
import { aiClient } from '../../services/ai-client/ai-client'
import { buildValidatorPrompt } from './prompts'

export type ValidationResult = {
  passed: boolean
  failedClaims: FailedClaim[]
}

export async function validate(
  transformed: TransformedContent,
  claims: FactualClaim[],
  providerConfig: ProviderConfig
): Promise<Result<{ result: ValidationResult, tokenUsage: AiTextResponse['usage'] }>> {
  if (claims.length === 0) {
    return {
      ok: true,
      value: { result: { passed: true, failedClaims: [] }, tokenUsage: { inputTokens: 0, outputTokens: 0 } }
    }
  }

  const prompt = buildValidatorPrompt(transformed, claims)
  const result = await aiClient.generateText(prompt, providerConfig)
  
  if (!result.ok) {
    return {
      ok: false,
      error: {
        stage: 'Validating',
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

    const parsed = JSON.parse(jsonStr) as ValidationResult
    return {
      ok: true,
      value: {
        result: parsed,
        tokenUsage: result.value.usage
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        stage: 'Validating',
        cause: `Failed to parse validation JSON: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true
      }
    }
  }
}
