import { IPC_CHANNELS } from './ipc'

// Implements ARCH-003: compile-time coverage for the renderer IPC channel contract.
const expectedChannels = {
  PIPELINE_STAGE_UPDATE: 'pipeline:stage-update',
  PIPELINE_RETRY: 'pipeline:retry',
  PIPELINE_COMPLETE: 'pipeline:complete',
  PIPELINE_ERROR: 'pipeline:error',
  RUN_PIPELINE: 'pipeline:run',
  SAVE_FILE: 'file:save',
  OPEN_FILE: 'file:open',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  KEY_GET: 'key:get',
  KEY_SET: 'key:set',
  PROVIDER_TEST_CONNECTION: 'provider:test-connection',
} as const

const channelContract: typeof expectedChannels = IPC_CHANNELS

void channelContract
