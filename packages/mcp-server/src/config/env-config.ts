import type { ProviderConfig } from '@bookit/core'
import os from 'os'
import path from 'path'

export type McpConfig = {
  outputDir: string
  providerConfig: {
    transformation: ProviderConfig
    validation: ProviderConfig
  }
}

export function readConfig(): McpConfig {
  const transformProvider = (process.env.BOOKIT_TRANSFORM_PROVIDER || 'anthropic') as 'anthropic' | 'google' | 'ollama'
  const transformModel = process.env.BOOKIT_TRANSFORM_MODEL || (transformProvider === 'anthropic' ? 'claude-3-5-sonnet-20240620' : 'default')
  
  const validateProvider = (process.env.BOOKIT_VALIDATE_PROVIDER || transformProvider) as 'anthropic' | 'google' | 'ollama'
  const validateModel = process.env.BOOKIT_VALIDATE_MODEL || (validateProvider === 'anthropic' ? 'claude-3-haiku-20240307' : 'default')

  const anthropicKey = process.env.BOOKIT_ANTHROPIC_KEY
  const googleKey = process.env.BOOKIT_GOOGLE_KEY
  const ollamaUrl = process.env.BOOKIT_OLLAMA_URL || 'http://localhost:11434'

  const getProviderConfig = (provider: 'anthropic' | 'google' | 'ollama', model: string): ProviderConfig => {
    if (provider === 'anthropic') {
      if (!anthropicKey) {
        throw new Error('No API key found for provider: anthropic. Please set BOOKIT_ANTHROPIC_KEY.')
      }
      return { provider: 'anthropic', model, apiKey: anthropicKey }
    }
    if (provider === 'google') {
      if (!googleKey) {
        throw new Error('No API key found for provider: google. Please set BOOKIT_GOOGLE_KEY.')
      }
      return { provider: 'google', model, apiKey: googleKey }
    }
    if (provider === 'ollama') {
      return { provider: 'ollama', model, baseUrl: ollamaUrl }
    }
    throw new Error(`Unknown provider: ${provider}`)
  }

  let outputDir = process.env.BOOKIT_OUTPUT_DIR
  if (!outputDir) {
    outputDir = path.join(os.homedir(), 'Documents', 'Bookit')
  }

  return {
    outputDir,
    providerConfig: {
      transformation: getProviderConfig(transformProvider, transformModel),
      validation: getProviderConfig(validateProvider, validateModel)
    }
  }
}
