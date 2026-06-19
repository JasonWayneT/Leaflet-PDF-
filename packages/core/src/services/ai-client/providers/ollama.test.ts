import type { ProviderConfig } from '../ai-client'
import { createOllamaAdapter } from './ollama'

const config: ProviderConfig = {
  provider: 'ollama',
  model: 'llama3.2',
  baseUrl: 'http://localhost:11434',
}

const adapter = createOllamaAdapter()
const model = adapter.createModel(config)

void model
