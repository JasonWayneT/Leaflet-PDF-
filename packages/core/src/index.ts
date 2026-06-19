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

// Implements FR-001, FR-002, FR-003, NFR-004: content intake module exports.
export {
  processTextInput,
  processFileInput,
  processYouTubeInput,
  preprocessCaptions,
  deriveTitle,
  SOURCE_CONTENT_CHAR_LIMIT,
} from './modules/intake/intake'

export * from './orchestrator/pipeline-orchestrator'
export * from './modules/claim-extractor/claim-extractor'
export * from './modules/technique-selector/technique-selector'
export * from './modules/transformer/transformer'
export * from './modules/validator/validator'
export * from './modules/renderer/renderer'
