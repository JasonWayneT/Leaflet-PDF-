import type { Result } from '../../types'
import {
  createAiClient,
  type AiClient,
  type AiGenerateText,
  type AiProviderAdapters,
  type AiTextResponse,
  type GenerateTextModel,
  type ProviderConfig,
} from './ai-client'

const calls: string[] = []
const fakeModel = {} as GenerateTextModel

const adapters: AiProviderAdapters = {
  anthropic: {
    createModel: (config) => {
      calls.push(`anthropic:${config.model}:${config.apiKey}`)
      return fakeModel
    },
  },
  google: {
    createModel: (config) => {
      calls.push(`google:${config.model}:${config.apiKey}`)
      return fakeModel
    },
  },
  ollama: {
    createModel: (config) => {
      calls.push(`ollama:${config.model}:${config.baseUrl}`)
      return fakeModel
    },
  },
}

const generator: AiGenerateText = async ({ model, prompt }) => {
  calls.push(`${model === fakeModel}:${prompt}`)
  return {
    text: 'pong',
    usage: {
      inputTokens: 2,
      outputTokens: 1,
    },
  }
}

const aiClient: AiClient = createAiClient({ adapters, generator })

const anthropicConfig: ProviderConfig = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5',
  apiKey: 'anthropic-key',
}

const googleConfig: ProviderConfig = {
  provider: 'google',
  model: 'gemini-2.5-flash',
  apiKey: 'google-key',
}

const ollamaConfig: ProviderConfig = {
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
}

const anthropicResult: Promise<Result<AiTextResponse>> = aiClient.generateText(
  'ping',
  anthropicConfig
)
const googleResult: Promise<Result<AiTextResponse>> = aiClient.generateText(
  'ping',
  googleConfig
)
const ollamaResult: Promise<Result<AiTextResponse>> = aiClient.generateText(
  'ping',
  ollamaConfig
)

const failingClient = createAiClient({
  adapters,
  generator: async () => {
    throw new Error('provider down')
  },
})

const failedResult: Promise<Result<AiTextResponse>> = failingClient.generateText(
  'ping',
  anthropicConfig
)

void [calls, anthropicResult, googleResult, ollamaResult, failedResult]
