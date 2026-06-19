// Implements SEC-001: API keys are stored via keytar under the Bookit service name.
import type { Result } from '@bookit/core'
import * as keytar from 'keytar'

export const KEY_STORE_SERVICE_NAME = 'bookit-v2'

export type ProviderName = 'anthropic' | 'google' | 'ollama'

export type KeyStoreDriver = {
  setPassword(service: string, account: string, password: string): Promise<void>
  getPassword(service: string, account: string): Promise<string | null>
  deletePassword(service: string, account: string): Promise<boolean>
}

export type KeyStore = {
  set(provider: ProviderName, apiKey: string): Promise<Result<void>>
  get(provider: ProviderName): Promise<Result<string | null>>
  delete(provider: ProviderName): Promise<Result<void>>
}

const keyStoreError = (cause: string): Result<never> => ({
  ok: false,
  error: {
    stage: 'Extracting',
    cause,
    retryable: false,
  },
})

export function createKeyStore(driver: KeyStoreDriver): KeyStore {
  return {
    async set(provider, apiKey) {
      try {
        await driver.setPassword(KEY_STORE_SERVICE_NAME, provider, apiKey)
        return { ok: true, value: undefined }
      } catch (error) {
        return keyStoreError(
          `Credential storage failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },

    async get(provider) {
      try {
        const value = await driver.getPassword(KEY_STORE_SERVICE_NAME, provider)
        return { ok: true, value }
      } catch (error) {
        return keyStoreError(
          `Credential lookup failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },

    async delete(provider) {
      try {
        await driver.deletePassword(KEY_STORE_SERVICE_NAME, provider)
        return { ok: true, value: undefined }
      } catch (error) {
        return keyStoreError(
          `Credential deletion failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },
  }
}

export const keyStore = createKeyStore(keytar)
