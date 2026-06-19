import type { Result } from '@bookit/core'
import type { ModelSlotSettings, ProviderSettings } from '../../main/settings-store'

export type SettingsKey = keyof {
  providerConfig?: ProviderSettings
  modelSlots?: ModelSlotSettings
  lastSaveDirectory?: string
}

export type SettingsValue<K extends SettingsKey> = K extends 'providerConfig'
  ? ProviderSettings | undefined
  : K extends 'modelSlots'
    ? ModelSlotSettings | undefined
    : K extends 'lastSaveDirectory'
      ? string | undefined
      : never

export type ProviderSetupPayload = {
  providerConfig: ProviderSettings
  apiKey?: string
  modelSlots: ModelSlotSettings
}

export type ProviderTestPayload =
  | {
      provider: 'anthropic'
      model: string
      apiKey: string
    }
  | {
      provider: 'google'
      model: string
      apiKey: string
    }
  | {
      provider: 'ollama'
      model: string
      baseUrl: string
    }

export type RendererApi = {
  settings: {
    get<K extends SettingsKey>(key: K): Promise<Result<SettingsValue<K>>>
    set<K extends SettingsKey>(
      key: K,
      value: SettingsValue<K>
    ): Promise<Result<void>>
  }
  provider: {
    saveSetup(payload: ProviderSetupPayload): Promise<Result<void>>
    testConnection(payload: ProviderTestPayload): Promise<Result<unknown>>
  }
}

declare global {
  interface Window {
    bookit: RendererApi
  }
}
