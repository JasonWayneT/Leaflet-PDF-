import type {
  AlwaysTechnique,
  ConditionalTechnique,
  ContentSection,
  FactualClaim,
  FailedClaim,
  PipelineError,
  PipelineRunLog,
  Result,
  SectionType,
  SourceContent,
  StageName,
  StyleName,
  StyleRegistryEntry,
  TechniqueAuditRecord,
  TechniqueList,
  TokenUsageEntry,
  TransformedContent,
} from '@leafletpdf/core'

// Implements ARCH-004: compile-time coverage for the public shared type surface.
const sourceContent: SourceContent = {
  text: 'Leaflet PDF preserves source fidelity.',
  inputType: 'paste',
  title: 'Source Fidelity',
}

const claim: FactualClaim = {
  id: 'claim-1',
  text: 'Leaflet PDF preserves source fidelity.',
}

const failedClaim: FailedClaim = {
  claim,
  reason: 'Claim not represented in transformed output.',
}

const alwaysTechnique: AlwaysTechnique = 'BLUF'
const conditionalTechnique: ConditionalTechnique = 'mental-buckets'
const sectionType: SectionType = 'body'

const techniqueList: TechniqueList = {
  always: [alwaysTechnique, 'teach-not-label-headings', '60-second-cheat-sheet'],
  conditional: [conditionalTechnique, 'jargon-translation', 'facts-implications'],
  conditionLog: { 'mental-buckets': 'test' }
}

const contentSection: ContentSection = {
  type: sectionType,
  heading: 'Fidelity is structural',
  body: 'Validation happens before rendering.',
}

const techniqueAudit: TechniqueAuditRecord = {
  applied: ['BLUF'],
  skipped: ['jargon-translation'],
  conditionLog: {
    'mental-buckets': 'Skipped because source content is short and single-topic.',
  },
}

const transformedContent: TransformedContent = {
  title: 'Source Fidelity',
  sections: [contentSection],
  techniqueAudit,
}

const stageName: StageName = 'Validating'
const pipelineError: PipelineError = {
  stage: stageName,
  cause: failedClaim.reason,
  retryable: true,
}

const successResult: Result<TransformedContent> = {
  ok: true,
  value: transformedContent,
}

const failedResult: Result<TransformedContent> = {
  ok: false,
  error: pipelineError,
}

const tokenUsage: TokenUsageEntry = {
  provider: 'anthropic',
  model: 'claude-haiku-4-5',
  in: 120,
  out: 12,
}

const styleName: StyleName = 'orbital-light'
const styleRegistryEntry: StyleRegistryEntry = {
  specPath: 'styles/orbital-light.md',
  templatePath: 'templates/orbital-light.html',
}

const pipelineRunLog: PipelineRunLog = {
  runId: 'run-1',
  timestamp: '2026-06-19T00:00:00.000Z',
  inputType: sourceContent.inputType,
  sourceChars: sourceContent.text.length,
  visualStyle: styleName,
  outcome: 'success',
  attempts: 1,
  tokenUsage: {
    claimExtract: tokenUsage,
    totals: {
      provider: 'anthropic',
      model: 'totals',
      in: 120,
      out: 12,
    },
  },
  estimatedCostUSD: {
    total: 0.01,
  },
}

void [
  sourceContent,
  failedClaim,
  techniqueList,
  successResult,
  failedResult,
  pipelineRunLog,
  styleRegistryEntry,
]
