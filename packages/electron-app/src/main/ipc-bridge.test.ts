import type { IpcBridgeRegistration } from './ipc-bridge'
import { registerIpcBridge } from './ipc-bridge'

// Implements ARCH-003: compile-time coverage for the single IPC bridge entry point.
const registration: IpcBridgeRegistration = registerIpcBridge

void registration
