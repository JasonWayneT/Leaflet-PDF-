// Implements INT-001 and ARCH-002: one Result-returning AI client boundary.
import { generateText as vercelGenerateText } from 'ai'
import type { Result } from '../../types'
import { createAnthropicAdapter } from './providers/anthropic'
import { createGoogleAdapter } from './providers/google'
import { createOllamaAdapter } from './providers/ollama'

export type GenerateTextModel = Parameters<typeof vercelGenerateText>[0]['model']

export type ProviderConfig =
  | {
      provider: 'anthropic'
      model: string
      apiKey: string
      baseUrl?: never
      createMessage?: never
    }
  | {
      provider: 'google'
      model: string
      apiKey: string
      baseUrl?: never
      createMessage?: never
    }
  | {
      provider: 'ollama'
      model: string
      apiKey?: never
      baseUrl: string
      createMessage?: never
    }
  | {
      provider: 'mcp-sampling'
      model?: never
      apiKey?: never
      baseUrl?: never
      createMessage: (prompt: string) => Promise<AiTextResponse>
    }

export type AiTextResponse = {
  text: string
  usage: {
    inputTokens: number
    outputTokens: number
  }
}

export type ProviderAdapter<TConfig extends ProviderConfig = ProviderConfig> = {
  createModel(config: TConfig): GenerateTextModel
}

export type AiProviderAdapters = {
  anthropic: ProviderAdapter<Extract<ProviderConfig, { provider: 'anthropic' }>>
  google: ProviderAdapter<Extract<ProviderConfig, { provider: 'google' }>>
  ollama: ProviderAdapter<Extract<ProviderConfig, { provider: 'ollama' }>>
}

export type DirectProviderConfig = Extract<ProviderConfig, { provider: 'anthropic' | 'google' | 'ollama' }>

export type AiGenerateText = (input: {
  model: GenerateTextModel
  prompt: string
}) => Promise<{
  text: string
  usage: {
    inputTokens?: number
    outputTokens?: number
  }
}>

export type AiClient = {
  generateText(
    prompt: string,
    providerConfig: ProviderConfig
  ): Promise<Result<AiTextResponse>>
}

export type AiClientDependencies = {
  adapters: AiProviderAdapters
  generator: AiGenerateText
}

const pipelineError = (cause: string): Result<never> => ({
  ok: false,
  error: {
    stage: 'Transforming',
    cause,
    retryable: true,
  },
})

const defaultGenerator: AiGenerateText = async ({ model, prompt }) => {
  const response = await vercelGenerateText({ model, prompt })

  return {
    text: response.text,
    usage: {
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
    },
  }
}

export function createAiClient({
  adapters,
  generator,
}: AiClientDependencies): AiClient {
  return {
    async generateText(prompt, providerConfig) {
      try {
        if (providerConfig.provider === 'mcp-sampling') {
          const result = await providerConfig.createMessage(prompt)
          return { ok: true, value: result }
        }

        const directConfig = providerConfig as DirectProviderConfig
        const model =
          directConfig.provider === 'anthropic'
            ? adapters.anthropic.createModel(directConfig)
            : directConfig.provider === 'google'
              ? adapters.google.createModel(directConfig)
              : adapters.ollama.createModel(directConfig)

        const response = await generator({ model, prompt })

        return {
          ok: true,
          value: {
            text: response.text,
            usage: {
              inputTokens: response.usage.inputTokens ?? 0,
              outputTokens: response.usage.outputTokens ?? 0,
            },
          },
        }
      } catch (error) {
        return pipelineError(
          `AI generation failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },
  }
}

export const aiClient = createAiClient({
  adapters: {
    anthropic: createAnthropicAdapter(),
    google: createGoogleAdapter(),
    ollama: createOllamaAdapter(),
  },
  generator: defaultGenerator,
})
