// Implements FR-13
import { aiClient, type ProviderConfig } from '../../services/ai-client/ai-client'
import type { Result, SourceContent, TechniqueList, FactualClaim, TransformedContent, ContentSection } from '../../types/index'
import { buildTransformerPrompt } from './prompts'

export type TransformerInput = {
  sourceContent: SourceContent
  techniques: TechniqueList
  claims: FactualClaim[]
}

export type TransformerResult = {
  content: TransformedContent
  usage: { inputTokens: number; outputTokens: number }
}

export async function transform(
  input: TransformerInput,
  config: ProviderConfig
): Promise<Result<TransformerResult>> {
  const { sourceContent, techniques, claims } = input

  const prompt = buildTransformerPrompt(sourceContent.text, techniques, claims)

  const aiResult = await aiClient.generateText(prompt, config)

  if (!aiResult.ok) {
    return { ok: false, error: aiResult.error }
  }

  try {
    // Strip possible markdown block quotes from the response
    let rawText = aiResult.value.text.trim()
    if (rawText.startsWith('\`\`\`json')) {
      rawText = rawText.replace(/^\`\`\`json\\n?/, '').replace(/\\n?\`\`\`$/, '')
    } else if (rawText.startsWith('\`\`\`')) {
      rawText = rawText.replace(/^\`\`\`\\n?/, '').replace(/\\n?\`\`\`$/, '')
    }

    const parsed = JSON.parse(rawText) as {
      title: string
      sections: ContentSection[]
    }

    if (!parsed.title || !Array.isArray(parsed.sections)) {
      throw new Error('Invalid JSON structure: missing title or sections array.')
    }

    const transformedContent: TransformedContent = {
      title: parsed.title || sourceContent.title || 'Untitled Document',
      sections: parsed.sections,
      techniqueAudit: {
        applied: [...techniques.always, ...techniques.conditional],
        skipped: [], // All conditional that were requested are applied
        conditionLog: techniques.conditionLog
      }
    }

    return {
      ok: true,
      value: {
        content: transformedContent,
        usage: aiResult.value.usage
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        stage: 'Transforming',
        cause: `Failed to parse transformed content as JSON: ${error instanceof Error ? error.message : String(error)}`,
        retryable: true
      }
    }
  }
}
