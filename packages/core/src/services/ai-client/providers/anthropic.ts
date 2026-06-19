// Implements INT-001: Anthropic provider adapter for the shared AI client.
import { createAnthropic } from '@ai-sdk/anthropic'
import type { ProviderAdapter, ProviderConfig } from '../ai-client'

type AnthropicConfig = Extract<ProviderConfig, { provider: 'anthropic' }>

export function createAnthropicAdapter(): ProviderAdapter<AnthropicConfig> {
  return {
    createModel(config) {
      return createAnthropic({ apiKey: config.apiKey })(config.model)
    },
  }
}
