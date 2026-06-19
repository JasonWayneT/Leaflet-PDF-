// Implements INT-001: Ollama provider adapter via AI SDK v6-compatible package.
import { createOllama } from 'ollama-ai-provider-v2'
import type { ProviderAdapter, ProviderConfig } from '../ai-client'

type OllamaConfig = Extract<ProviderConfig, { provider: 'ollama' }>

export function createOllamaAdapter(): ProviderAdapter<OllamaConfig> {
  return {
    createModel(config) {
      return createOllama({ baseURL: config.baseUrl })(config.model)
    },
  }
}
