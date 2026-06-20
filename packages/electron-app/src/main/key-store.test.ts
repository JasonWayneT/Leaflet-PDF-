import type { Result } from '@leafletpdf/core'
import {
  KEY_STORE_SERVICE_NAME,
  createKeyStore,
  type KeyStoreDriver,
  type ProviderName,
} from './key-store'

// Implements SEC-001: compile-time coverage for the keytar-backed key store contract.
const calls: Array<[string, string, string?]> = []

const driver: KeyStoreDriver = {
  setPassword: async (service, account, password) => {
    calls.push([service, account, password])
  },
  getPassword: async (service, account) => {
    calls.push([service, account])
    return `${service}:${account}`
  },
  deletePassword: async (service, account) => {
    calls.push([service, account])
    return true
  },
}

const provider: ProviderName = 'anthropic'
const keyStore = createKeyStore(driver)

const setResult: Promise<Result<void>> = keyStore.set(provider, 'test-key')
const getResult: Promise<Result<string | null>> = keyStore.get(provider)
const deleteResult: Promise<Result<void>> = keyStore.delete(provider)

void [KEY_STORE_SERVICE_NAME, calls, setResult, getResult, deleteResult]
