import type {
  ProviderSetupPayload,
  ProviderTestPayload,
  RendererApi,
} from './preload-api'

// Implements INT-004: renderer contract for settings/key/test connection IPC calls.
const setupPayload: ProviderSetupPayload = {
  providerConfig: {
    provider: 'anthropic',
  },
  apiKey: 'test-key',
  modelSlots: {
    transformation: {
      provider: 'anthropic',
      model: 'claude-sonnet-4-6',
    },
    validation: {
      provider: 'anthropic',
      model: 'claude-haiku-4-5',
    },
  },
}

const testPayload: ProviderTestPayload = {
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
}

declare const api: RendererApi

const providerConfigResult = api.settings.get('providerConfig')
const setupResult = api.provider.saveSetup(setupPayload)
const testResult = api.provider.testConnection(testPayload)

void [setupPayload, testPayload, providerConfigResult, setupResult, testResult]
