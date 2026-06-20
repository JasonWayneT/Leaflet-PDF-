import { EventEmitter } from 'events'
import type { SourceContent, StyleName, StageName, TransformedContent } from '../types/index'
import type { ProviderConfig } from '../services/ai-client/ai-client'
import { deriveTitle } from '../modules/intake/intake'
import { extractClaims } from '../modules/claim-extractor/claim-extractor'
import { selectTechniques } from '../modules/technique-selector/technique-selector'
import { transform } from '../modules/transformer/transformer'
import { validate } from '../modules/validator/validator'
import { render } from '../modules/renderer/renderer'
import { logTokenUsage } from './token-logger'
import { randomUUID } from 'crypto'
import type { TokenUsageEntry, PipelineRunLog } from '../types/index'

export type PipelineInput = {
  sourceContent: SourceContent
  styleSelection: StyleName
  providerConfig: {
    transformation: ProviderConfig
    validation: ProviderConfig
  }
}

export interface PipelineEvents {
  'pipeline:stage-update': (payload: { stage: StageName }) => void
  'pipeline:retry': (payload: { attempt: number; max: number }) => void
  'pipeline:complete': (payload: { pdfBuffer: Buffer; title: string }) => void
  'pipeline:error': (payload: { stage: StageName; cause: string }) => void
}

export declare interface PipelineOrchestrator {
  on<U extends keyof PipelineEvents>(event: U, listener: PipelineEvents[U]): this
  emit<U extends keyof PipelineEvents>(event: U, ...args: Parameters<PipelineEvents[U]>): boolean
}

export class PipelineOrchestrator extends EventEmitter {
  private userDataPath: string

  constructor(config: { userDataPath: string }) {
    super()
    this.userDataPath = config.userDataPath
  }

  async runPipeline(input: PipelineInput): Promise<void> {
    const runId = randomUUID()
    const timestamp = new Date().toISOString()
    const tokenUsage: Record<string, TokenUsageEntry> = {}
    let outcome: PipelineRunLog['outcome'] = 'error'
    let attempts = 0
    let totalIn = 0
    let totalOut = 0

    const recordUsage = (step: string, usage: { inputTokens: number; outputTokens: number } | undefined, config: ProviderConfig) => {
      if (!usage) return
      tokenUsage[step] = {
        provider: config.provider,
        model: config.model ?? 'host-model',
        in: usage.inputTokens,
        out: usage.outputTokens
      }
      totalIn += usage.inputTokens
      totalOut += usage.outputTokens
    }

    try {
      const { sourceContent, styleSelection, providerConfig } = input
      const activeSourceContent = { ...sourceContent }

      // 1. deriveTitle
      if (!activeSourceContent.title) {
        this.emit('pipeline:stage-update', { stage: 'Extracting' })
        const titleResult = await deriveTitle(activeSourceContent.text, providerConfig.validation)
        if (!titleResult.ok) {
          this.emit('pipeline:error', { stage: 'Extracting', cause: titleResult.error.cause })
          return
        }
        activeSourceContent.title = titleResult.value.title
        recordUsage('titleDerive', titleResult.value.usage, providerConfig.validation)
      } else {
        this.emit('pipeline:stage-update', { stage: 'Extracting' })
      }

      // 2. extractClaims
      const claimsResult = await extractClaims(activeSourceContent, providerConfig.validation)
      if (!claimsResult.ok) {
        this.emit('pipeline:error', { stage: claimsResult.error.stage, cause: claimsResult.error.cause })
        return
      }
      const claims = claimsResult.value.claims
      recordUsage('claimExtract', claimsResult.value.tokenUsage, providerConfig.validation)

      // 3. selectTechniques
      this.emit('pipeline:stage-update', { stage: 'Transforming' })
      const techniques = selectTechniques(activeSourceContent)

      // 4. transform and 5. validate (with retry loop)
      let attempt = 1
      const MAX_ATTEMPTS = 3
      let validationPassed = false
      let finalTransformedContent: TransformedContent | null = null

      while (attempt <= MAX_ATTEMPTS) {
        if (attempt > 1) {
          this.emit('pipeline:retry', { attempt, max: MAX_ATTEMPTS })
          this.emit('pipeline:stage-update', { stage: 'Transforming' })
        }

        const transformResult = await transform(
          { sourceContent: activeSourceContent, techniques, claims },
          providerConfig.transformation
        )

        if (!transformResult.ok) {
          this.emit('pipeline:error', { stage: transformResult.error.stage, cause: transformResult.error.cause })
          return
        }
        recordUsage(`transform_${attempt}`, transformResult.value.usage, providerConfig.transformation)

        this.emit('pipeline:stage-update', { stage: 'Validating' })
        const validationResult = await validate(
          transformResult.value.content,
          claims,
          providerConfig.validation
        )

        if (!validationResult.ok) {
          this.emit('pipeline:error', { stage: validationResult.error.stage, cause: validationResult.error.cause })
          return
        }
        recordUsage(`validate_${attempt}`, validationResult.value.tokenUsage, providerConfig.validation)

        if (validationResult.value.result.passed) {
          validationPassed = true
          finalTransformedContent = transformResult.value.content
          break
        }

        attempt++
      }

      attempts = attempt

      if (!validationPassed || !finalTransformedContent) {
        outcome = 'fidelity_failure'
        this.emit('pipeline:error', {
          stage: 'Validating',
          cause: 'Validation failed after 3 attempts — fidelity check could not be satisfied',
        })
        return
      }

      // 9. render
      this.emit('pipeline:stage-update', { stage: 'Rendering' })
      const renderResult = await render(finalTransformedContent, styleSelection)

      if (!renderResult.ok) {
        this.emit('pipeline:error', { stage: renderResult.error.stage, cause: renderResult.error.cause })
        return
      }

      this.emit('pipeline:complete', { pdfBuffer: renderResult.value, title: activeSourceContent.title })
      outcome = 'success'
    } catch (error) {
      // Catch-all for unexpected throws so the app doesn't crash silently
      this.emit('pipeline:error', {
        stage: 'Extracting',
        cause: error instanceof Error ? error.message : String(error),
      })
    } finally {
      const estimatedCost = 0 // Stub
      tokenUsage['totals'] = { provider: '', model: '', in: totalIn, out: totalOut }
      logTokenUsage(this.userDataPath, {
        runId,
        timestamp,
        inputType: input.sourceContent.inputType,
        sourceChars: input.sourceContent.text.length,
        visualStyle: input.styleSelection,
        outcome,
        attempts: attempts === 0 ? 1 : attempts,
        tokenUsage,
        estimatedCostUSD: { actualCost: estimatedCost }
      })
    }
  }
}
