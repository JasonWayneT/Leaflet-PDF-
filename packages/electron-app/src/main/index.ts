// Implements ARCH-001: Electron main process entry point
import { app, BrowserWindow } from 'electron'
import path from 'node:path'
import { PipelineOrchestrator } from '@bookit/core'
import { registerIpcBridge } from './ipc-bridge'

// Injected by @electron-forge/plugin-vite at build time
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  const orchestrator = new PipelineOrchestrator({
    userDataPath: app.getPath('userData')
  })
  registerIpcBridge(orchestrator, mainWindow.webContents)

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
