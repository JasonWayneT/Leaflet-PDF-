// Implements ARCH-003: this is the only file that imports ipcMain from Electron.
import { ipcMain } from 'electron'
import { aiClient, type ProviderConfig } from '@bookit/core'
import { keyStore } from './key-store'
import { settingsStore, type SettingsSchema } from './settings-store'
import { IPC_CHANNELS } from '../renderer/types/ipc'
import type { ProviderTestPayload } from '../renderer/types/preload-api'

export type IpcBridgeRegistration = () => void

let isRegistered = false

export const registerIpcBridge: IpcBridgeRegistration = () => {
  if (isRegistered) {
    return
  }

  ipcMain.on(IPC_CHANNELS.RUN_PIPELINE, () => undefined)

  ipcMain.handle(IPC_CHANNELS.SAVE_FILE, () => undefined)
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE, () => undefined)
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_GET,
    (_event, key: keyof SettingsSchema) => settingsStore.get(key)
  )
  ipcMain.handle(
    IPC_CHANNELS.SETTINGS_SET,
    (_event, payload: { key: keyof SettingsSchema; value: SettingsSchema[keyof SettingsSchema] }) =>
      settingsStore.set(payload.key, payload.value)
  )
  ipcMain.handle(IPC_CHANNELS.KEY_GET, (_event, provider) =>
    keyStore.get(provider)
  )
  ipcMain.handle(IPC_CHANNELS.KEY_SET, (_event, payload) =>
    keyStore.set(payload.provider, payload.apiKey)
  )
  ipcMain.handle(
    IPC_CHANNELS.PROVIDER_TEST_CONNECTION,
    (_event, payload: ProviderTestPayload) => {
      const config: ProviderConfig =
        payload.provider === 'ollama'
          ? {
              provider: 'ollama',
              model: payload.model,
              baseUrl: payload.baseUrl,
            }
          : {
              provider: payload.provider,
              model: payload.model,
              apiKey: payload.apiKey,
            }

      return aiClient.generateText('ping', config)
    }
  )

  isRegistered = true
}
