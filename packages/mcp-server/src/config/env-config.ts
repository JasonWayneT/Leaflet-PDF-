import type { ProviderConfig } from '@leafletpdf/core'
import os from 'os'
import path from 'path'

export type ResolvedProviderConfig = {
  transformation: ProviderConfig
  validation: ProviderConfig
}

export type McpConfig = {
  outputDir: string
  useSampling: boolean
  providerConfig: ResolvedProviderConfig | null
}

export function readConfig(): McpConfig {
  const transformProvider = process.env.LEAFLETPDF_TRANSFORM_PROVIDER || 'auto'
  const validateProvider = process.env.LEAFLETPDF_VALIDATE_PROVIDER || transformProvider

  const anthropicKey = process.env.LEAFLETPDF_ANTHROPIC_KEY
  const googleKey = process.env.LEAFLETPDF_GOOGLE_KEY
  const ollamaUrl = process.env.LEAFLETPDF_OLLAMA_URL || 'http://localhost:11434'

  const outputDir = process.env.LEAFLETPDF_OUTPUT_DIR || path.join(os.homedir(), 'Documents', 'LeafletPDF')

  // Sampling mode: explicit opt-in, or auto-detect when no API keys are configured
  const noDirectKeys = !anthropicKey && !googleKey
  const explicitSampling = transformProvider === 'mcp-sampling'
  const autoSampling = transformProvider === 'auto' && noDirectKeys && !process.env.LEAFLETPDF_OLLAMA_URL
  const useSampling = explicitSampling || autoSampling

  if (useSampling) {
    return { outputDir, useSampling: true, providerConfig: null }
  }

  // Resolve direct provider — fall back to anthropic if auto and a key is present
  const resolvedTransformProvider = (
    transformProvider === 'auto' || transformProvider === 'mcp-sampling'
      ? anthropicKey ? 'anthropic' : googleKey ? 'google' : 'ollama'
      : transformProvider
  ) as 'anthropic' | 'google' | 'ollama'

  const resolvedValidateProvider = (
    validateProvider === 'auto' || validateProvider === 'mcp-sampling'
      ? resolvedTransformProvider
      : validateProvider
  ) as 'anthropic' | 'google' | 'ollama'

  const transformModel =
    process.env.LEAFLETPDF_TRANSFORM_MODEL ||
    (resolvedTransformProvider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : 'default')

  const validateModel =
    process.env.LEAFLETPDF_VALIDATE_MODEL ||
    (resolvedValidateProvider === 'anthropic' ? 'claude-3-haiku-20240307' : 'default')

  const getProviderConfig = (provider: 'anthropic' | 'google' | 'ollama', model: string): ProviderConfig => {
    if (provider === 'anthropic') {
      if (!anthropicKey) throw new Error('LEAFLETPDF_ANTHROPIC_KEY is required for provider: anthropic')
      return { provider: 'anthropic', model, apiKey: anthropicKey }
    }
    if (provider === 'google') {
      if (!googleKey) throw new Error('LEAFLETPDF_GOOGLE_KEY is required for provider: google')
      return { provider: 'google', model, apiKey: googleKey }
    }
    return { provider: 'ollama', model, baseUrl: ollamaUrl }
  }

  return {
    outputDir,
    useSampling: false,
    providerConfig: {
      transformation: getProviderConfig(resolvedTransformProvider, transformModel),
      validation: getProviderConfig(resolvedValidateProvider, validateModel),
    },
  }
}
