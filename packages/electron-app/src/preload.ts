// Implements INT-004: renderer-to-main bridge for setup/settings workflows.
import { contextBridge, ipcRenderer } from 'electron'
import { IPC_CHANNELS } from './renderer/types/ipc'
import type {
  ProviderSetupPayload,
  ProviderTestPayload,
  RendererApi,
  SettingsKey,
  SettingsValue,
} from './renderer/types/preload-api'

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
  },
}

contextBridge.exposeInMainWorld('bookit', api)
