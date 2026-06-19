// Implements INT-001: Google provider adapter for the shared AI client.
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { ProviderAdapter, ProviderConfig } from '../ai-client'

type GoogleConfig = Extract<ProviderConfig, { provider: 'google' }>

export function createGoogleAdapter(): ProviderAdapter<GoogleConfig> {
  return {
    createModel(config) {
      return createGoogleGenerativeAI({ apiKey: config.apiKey })(config.model)
    },
  }
}
