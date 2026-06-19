// Implements SEC-002: electron-store persists non-sensitive settings only.
import type { Result } from '@bookit/core'
import Store from 'electron-store'
import type { ProviderName } from './key-store'

export type ProviderSettings = {
  provider: ProviderName
  baseUrl?: string
}

export type ModelSlot = {
  provider: ProviderName
  model: string
}

export type ModelSlotSettings = {
  transformation: ModelSlot
  validation: ModelSlot
}

export type SettingsSchema = {
  providerConfig?: ProviderSettings
  modelSlots?: ModelSlotSettings
  lastSaveDirectory?: string
}

export type SettingsStoreDriver = {
  get<K extends keyof SettingsSchema>(key: K): SettingsSchema[K]
  set<K extends keyof SettingsSchema>(key: K, value: SettingsSchema[K]): void
  delete<K extends keyof SettingsSchema>(key: K): void
}

export type SettingsStore = {
  get<K extends keyof SettingsSchema>(key: K): Result<SettingsSchema[K]>
  set<K extends keyof SettingsSchema>(
    key: K,
    value: SettingsSchema[K]
  ): Result<void>
  delete<K extends keyof SettingsSchema>(key: K): Result<void>
}

const settingsStoreError = (cause: string): Result<never> => ({
  ok: false,
  error: {
    stage: 'Extracting',
    cause,
    retryable: false,
  },
})

export function createSettingsStore(driver: SettingsStoreDriver): SettingsStore {
  return {
    get(key) {
      try {
        return { ok: true, value: driver.get(key) }
      } catch (error) {
        return settingsStoreError(
          `Settings lookup failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },

    set(key, value) {
      try {
        driver.set(key, value)
        return { ok: true, value: undefined }
      } catch (error) {
        return settingsStoreError(
          `Settings write failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },

    delete(key) {
      try {
        driver.delete(key)
        return { ok: true, value: undefined }
      } catch (error) {
        return settingsStoreError(
          `Settings deletion failed: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    },
  }
}

export const settingsStore = createSettingsStore(
  new Store<SettingsSchema>({
    name: 'bookit-settings',
  })
)
