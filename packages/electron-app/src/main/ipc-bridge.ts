// Implements ARCH-003: this is the only file that imports ipcMain from Electron.
import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../renderer/types/ipc'

export type IpcBridgeRegistration = () => void

let isRegistered = false

export const registerIpcBridge: IpcBridgeRegistration = () => {
  if (isRegistered) {
    return
  }

  ipcMain.on(IPC_CHANNELS.RUN_PIPELINE, () => undefined)

  ipcMain.handle(IPC_CHANNELS.SAVE_FILE, () => undefined)
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE, () => undefined)
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, () => undefined)
  ipcMain.handle(IPC_CHANNELS.SETTINGS_SET, () => undefined)
  ipcMain.handle(IPC_CHANNELS.KEY_GET, () => undefined)
  ipcMain.handle(IPC_CHANNELS.KEY_SET, () => undefined)

  isRegistered = true
}
