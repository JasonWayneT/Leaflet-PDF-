// Implements ARCH-003: this is the only file that imports ipcMain from Electron.
import { ipcMain, dialog, shell, app } from 'electron'
import type { WebContents } from 'electron'
import { aiClient, processFileInput, processTextInput, processYouTubeInput, type ProviderConfig, PipelineOrchestrator, type PipelineInput } from '@leafletpdf/core'
import { keyStore } from './key-store'
import { settingsStore, type SettingsSchema } from './settings-store'
import { IPC_CHANNELS } from '../renderer/types/ipc'
import type { ProviderTestPayload } from '../renderer/types/preload-api'

export type IpcBridgeRegistration = (orchestrator: PipelineOrchestrator, webContents: WebContents) => void

let isRegistered = false
let latestPipelineResult: { title: string; pdfBuffer: Buffer } | null = null

export const registerIpcBridge: IpcBridgeRegistration = (orchestrator, webContents) => {
  if (isRegistered) {
    return
  }

  // Subscribe to Orchestrator events and forward to renderer
  orchestrator.on('pipeline:stage-update', (payload) => {
    webContents.send(IPC_CHANNELS.PIPELINE_STAGE_UPDATE, payload)
  })

  orchestrator.on('pipeline:retry', (payload) => {
    // Send human-readable text to renderer
    webContents.send(IPC_CHANNELS.PIPELINE_RETRY, {
      message: `Retrying transformation — attempt ${payload.attempt} of ${payload.max}`
    })
  })

  const handleSaveFile = async (webContentToUse: WebContents) => {
    if (!latestPipelineResult) return

    const lastSaveDirRes = settingsStore.get('lastSaveDirectory')
    const lastSaveDir = lastSaveDirRes.ok ? lastSaveDirRes.value : undefined
    const path = require('path')
    const defaultPath = lastSaveDir 
      ? path.join(lastSaveDir, `${latestPipelineResult.title}.pdf`) 
      : path.join(app.getPath('documents'), `${latestPipelineResult.title}.pdf`)

    const { canceled, filePath } = await dialog.showSaveDialog({
      title: 'Save Reading Artifact',
      defaultPath,
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
    })

    if (canceled || !filePath) {
      webContentToUse.send(IPC_CHANNELS.PIPELINE_SAVE_CANCELED)
    } else {
      const fs = require('fs')
      fs.writeFileSync(filePath, latestPipelineResult.pdfBuffer)
      settingsStore.set('lastSaveDirectory', path.dirname(filePath))
      webContentToUse.send(IPC_CHANNELS.PIPELINE_COMPLETE, { filePath })
    }
  }

  orchestrator.on('pipeline:complete', async (payload) => {
    latestPipelineResult = { title: payload.title, pdfBuffer: payload.pdfBuffer }
    await handleSaveFile(webContents)
  })

  orchestrator.on('pipeline:error', (payload) => {
    webContents.send(IPC_CHANNELS.PIPELINE_ERROR, payload)
  })

  ipcMain.handle(IPC_CHANNELS.RUN_PIPELINE, (_event, input: PipelineInput) => {
    // Fire and forget runPipeline
    orchestrator.runPipeline(input).catch((error) => {
      webContents.send(IPC_CHANNELS.PIPELINE_ERROR, {
        stage: 'Extracting',
        cause: error instanceof Error ? error.message : String(error)
      })
    })
  })
  ipcMain.handle(IPC_CHANNELS.SAVE_FILE, async () => {
    await handleSaveFile(webContents)
  })
  ipcMain.handle(IPC_CHANNELS.OPEN_FILE, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Text/Markdown', extensions: ['md', 'txt'] }],
    })

    if (canceled || filePaths.length === 0) {
      return { ok: true, value: null }
    }

    return processFileInput(filePaths[0])
  })
  ipcMain.handle(IPC_CHANNELS.PROCESS_TEXT, async (_event, text: string) => {
    return processTextInput(text)
  })
  ipcMain.handle(IPC_CHANNELS.PROCESS_YOUTUBE, async (_event, url: string) => {
    return processYouTubeInput(url)
  })
  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_event, filePath: string) => {
    try {
      const errorMessage = await shell.openPath(filePath)
      if (errorMessage) {
        return { ok: false, error: { stage: 'Rendering', cause: errorMessage, retryable: false } }
      }
      return { ok: true, value: undefined }
    } catch (error) {
      return { ok: false, error: { stage: 'Rendering', cause: error instanceof Error ? error.message : String(error), retryable: false } }
    }
  })
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
  ipcMain.handle(IPC_CHANNELS.KEY_DELETE, (_event, provider) =>
    keyStore.delete(provider)
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
