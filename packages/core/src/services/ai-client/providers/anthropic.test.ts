import type { ProviderConfig } from '../ai-client'
import { createAnthropicAdapter } from './anthropic'

const config: ProviderConfig = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5',
  apiKey: 'test-key',
}

const adapter = createAnthropicAdapter()
const model = adapter.createModel(config)

void model
