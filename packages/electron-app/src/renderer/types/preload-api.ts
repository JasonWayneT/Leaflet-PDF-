import type { Result, SourceContent, PipelineInput, StageName } from '@leafletpdf/core'
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
    deleteKey(provider: 'anthropic' | 'google' | 'ollama'): Promise<Result<void>>
  }
  files: {
    openFile(): Promise<Result<SourceContent | null>>
    openExternal(filePath: string): Promise<Result<void>>
    saveFile(): Promise<void>
  }
  intake: {
    processText(text: string): Promise<Result<SourceContent>>
    processYouTube(url: string): Promise<Result<SourceContent>>
  }
  pipeline: {
    run(input: PipelineInput): void
    onStageUpdate(callback: (payload: { stage: StageName }) => void): () => void
    onRetry(callback: (payload: { message: string }) => void): () => void
    onSaveCanceled(callback: () => void): () => void
    onComplete(callback: (payload: { filePath: string }) => void): () => void
    onError(callback: (payload: { stage: StageName; cause: string }) => void): () => void
  }
}

declare global {
  interface Window {
    leafletpdf: RendererApi
  }
}
