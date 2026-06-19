import type { ProviderConfig } from '../ai-client'
import { createGoogleAdapter } from './google'

const config: ProviderConfig = {
  provider: 'google',
  model: 'gemini-2.5-flash',
  apiKey: 'test-key',
}

const adapter = createGoogleAdapter()
const model = adapter.createModel(config)

void model
