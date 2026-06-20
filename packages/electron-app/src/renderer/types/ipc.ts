// Implements ARCH-003: shared channel names for the Electron IPC boundary.
export const IPC_CHANNELS = {
  PIPELINE_STAGE_UPDATE: 'pipeline:stage-update',
  PIPELINE_RETRY: 'pipeline:retry',
  PIPELINE_SAVE_CANCELED: 'pipeline:save-canceled',
  PIPELINE_COMPLETE: 'pipeline:complete',
  PIPELINE_ERROR: 'pipeline:error',
  RUN_PIPELINE: 'pipeline:run',
  SAVE_FILE: 'file:save',
  OPEN_FILE: 'file:open',
  OPEN_EXTERNAL: 'file:open-external',
  PROCESS_TEXT: 'intake:process-text',
  PROCESS_YOUTUBE: 'intake:process-youtube',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  KEY_GET: 'key:get',
  KEY_SET: 'key:set',
  KEY_DELETE: 'key:delete',
  PROVIDER_TEST_CONNECTION: 'provider:test-connection',
} as const

export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
