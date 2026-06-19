// Implements ARCH-004: downstream packages import shared handoff contracts from @bookit/core.
export type * from './types/index'
export { aiClient, createAiClient } from './services/ai-client/ai-client'
export type {
  AiClient,
  AiGenerateText,
  AiProviderAdapters,
  AiTextResponse,
  GenerateTextModel,
  ProviderAdapter,
  ProviderConfig,
} from './services/ai-client/ai-client'
