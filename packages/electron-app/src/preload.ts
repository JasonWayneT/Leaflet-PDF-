// Implements INT-004: renderer-to-main bridge for setup/settings workflows.
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from './renderer/types/ipc'
import type {
  ProviderSetupPayload,
  ProviderTestPayload,
  RendererApi,
  SettingsKey,
  SettingsValue,
} from './renderer/types/preload-api'
import type { PipelineInput, StageName } from '@leafletpdf/core'

const api: RendererApi = {
  settings: {
    get: <K extends SettingsKey>(key: K) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET, key),
    set: <K extends SettingsKey>(key: K, value: SettingsValue<K>) =>
      ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, { key, value }),
  },
  provider: {
    async saveSetup(payload: ProviderSetupPayload) {
      if (payload.apiKey) {
        const keyResult = await ipcRenderer.invoke(IPC_CHANNELS.KEY_SET, {
          provider: payload.providerConfig.provider,
          apiKey: payload.apiKey,
        })

        if (!keyResult.ok) {
          return keyResult
        }
      }

      const providerResult = await ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, {
        key: 'providerConfig',
        value: payload.providerConfig,
      })

      if (!providerResult.ok) {
        return providerResult
      }

      return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SET, {
        key: 'modelSlots',
        value: payload.modelSlots,
      })
    },
    testConnection: (payload: ProviderTestPayload) =>
      ipcRenderer.invoke(IPC_CHANNELS.PROVIDER_TEST_CONNECTION, payload),
    deleteKey: (provider: 'anthropic' | 'google' | 'ollama') =>
      ipcRenderer.invoke(IPC_CHANNELS.KEY_DELETE, provider),
  },
  files: {
    openFile: () => ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE),
    openExternal: (filePath: string) => ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, filePath),
    saveFile: () => ipcRenderer.invoke(IPC_CHANNELS.SAVE_FILE),
  },
  intake: {
    processText: (text: string) => ipcRenderer.invoke(IPC_CHANNELS.PROCESS_TEXT, text),
    processYouTube: (url: string) => ipcRenderer.invoke(IPC_CHANNELS.PROCESS_YOUTUBE, url),
  },
  pipeline: {
    run: (input: PipelineInput) => ipcRenderer.invoke(IPC_CHANNELS.RUN_PIPELINE, input),
    onStageUpdate: (callback) => {
      const handler = (_event: IpcRendererEvent, payload: { stage: StageName }) => callback(payload)
      ipcRenderer.on(IPC_CHANNELS.PIPELINE_STAGE_UPDATE, handler)
      return () => { ipcRenderer.off(IPC_CHANNELS.PIPELINE_STAGE_UPDATE, handler) }
    },
    onRetry: (callback) => {
      const handler = (_event: IpcRendererEvent, payload: { message: string }) => callback(payload)
      ipcRenderer.on(IPC_CHANNELS.PIPELINE_RETRY, handler)
      return () => { ipcRenderer.off(IPC_CHANNELS.PIPELINE_RETRY, handler) }
    },
    onSaveCanceled: (callback) => {
      const handler = (_event: IpcRendererEvent) => callback()
      ipcRenderer.on(IPC_CHANNELS.PIPELINE_SAVE_CANCELED, handler)
      return () => { ipcRenderer.off(IPC_CHANNELS.PIPELINE_SAVE_CANCELED, handler) }
    },
    onComplete: (callback) => {
      const handler = (_event: IpcRendererEvent, payload: { filePath: string }) => callback(payload)
      ipcRenderer.on(IPC_CHANNELS.PIPELINE_COMPLETE, handler)
      return () => { ipcRenderer.off(IPC_CHANNELS.PIPELINE_COMPLETE, handler) }
    },
    onError: (callback) => {
      const handler = (_event: IpcRendererEvent, payload: { stage: StageName; cause: string }) => callback(payload)
      ipcRenderer.on(IPC_CHANNELS.PIPELINE_ERROR, handler)
      return () => { ipcRenderer.off(IPC_CHANNELS.PIPELINE_ERROR, handler) }
    }
  }
}

contextBridge.exposeInMainWorld('leafletpdf', api)
