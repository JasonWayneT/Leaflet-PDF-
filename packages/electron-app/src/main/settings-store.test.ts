import type { Result } from '@leafletpdf/core'
import {
  createSettingsStore,
  type ModelSlotSettings,
  type ProviderSettings,
  type SettingsStoreDriver,
} from './settings-store'

// Implements SEC-002: compile-time coverage for non-sensitive settings only.
const values = new Map<string, unknown>()

const driver: SettingsStoreDriver = {
  get: (key) => values.get(key) as never,
  set: (key, value) => {
    values.set(key, value)
  },
  delete: (key) => {
    values.delete(key)
  },
}

const settingsStore = createSettingsStore(driver)

const providerSettings: ProviderSettings = {
  provider: 'ollama',
  baseUrl: 'http://localhost:11434',
}

const modelSlots: ModelSlotSettings = {
  transformation: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-6',
  },
  validation: {
    provider: 'anthropic',
    model: 'claude-haiku-4-5',
  },
}

const setProviderResult: Result<void> = settingsStore.set(
  'providerConfig',
  providerSettings
)
const setSlotsResult: Result<void> = settingsStore.set('modelSlots', modelSlots)
const getProviderResult: Result<ProviderSettings | undefined> =
  settingsStore.get('providerConfig')
const deleteResult: Result<void> = settingsStore.delete('lastSaveDirectory')

void [setProviderResult, setSlotsResult, getProviderResult, deleteResult]
