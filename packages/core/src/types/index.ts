// Implements ARCH-004: shared pipeline handoff contracts live in one core module.
export type SourceContent = {
  text: string
  inputType: 'paste' | 'file' | 'youtube'
  title?: string
}

export type FactualClaim = {
  id: string
  text: string
}

export type FailedClaim = {
  claim: FactualClaim
  reason: string
}

export type AlwaysTechnique =
  | 'BLUF'
  | 'teach-not-label-headings'
  | '60-second-cheat-sheet'

export type ConditionalTechnique =
  | 'mental-buckets'
  | 'jargon-translation'
  | 'facts-implications'

export type TechniqueList = {
  always: AlwaysTechnique[]
  conditional: ConditionalTechnique[]
}

export type SectionType =
  | 'BLUF'
  | 'body'
  | '60-second-cheat-sheet'
  | 'mental-bucket'
  | 'jargon-translation'
  | 'facts-implications'

export type TransformedContent = {
  title: string
  sections: ContentSection[]
  techniqueAudit: TechniqueAuditRecord
}

export type ContentSection = {
  type: SectionType
  heading?: string
  body: string
}

export type TechniqueAuditRecord = {
  applied: string[]
  skipped: string[]
  conditionLog: Record<string, string>
}

export type StageName =
  | 'Extracting'
  | 'Transforming'
  | 'Validating'
  | 'Rendering'

export type PipelineError = {
  stage: StageName
  cause: string
  retryable: boolean
}

export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: PipelineError }

export type TokenUsageEntry = {
  provider: string
  model: string
  in: number
  out: number
}

export type PipelineRunLog = {
  runId: string
  timestamp: string
  inputType: string
  sourceChars: number
  visualStyle: string
  outcome: 'success' | 'fidelity_failure' | 'error'
  attempts: number
  tokenUsage: Record<string, TokenUsageEntry | Record<string, TokenUsageEntry>>
  estimatedCostUSD: Record<string, number | string>
}

export type StyleName = 'orbital-light' | 'orbital-night'

export type StyleRegistryEntry = {
  specPath: string
  templatePath: string
}
