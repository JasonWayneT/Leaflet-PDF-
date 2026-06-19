// Implements ARCH-006: co-located runtime tests for orchestrator module.
// Implements FR-005, FR-006, FR-007, FR-017, FR-018, NFR-001, NFR-002, NFR-003.
// Tests use vi.mock to avoid real AI calls.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PipelineOrchestrator, type PipelineInput } from './pipeline-orchestrator'
import type { ProviderConfig } from '../services/ai-client/ai-client'

// --- Mock all pipeline modules so no real AI or filesystem calls are made ---

vi.mock('../modules/intake/intake', () => ({
  deriveTitle: vi.fn(),
}))

vi.mock('../modules/claim-extractor/claim-extractor', () => ({
  extractClaims: vi.fn(),
}))

vi.mock('../modules/technique-selector/technique-selector', () => ({
  selectTechniques: vi.fn(),
}))

vi.mock('../modules/transformer/transformer', () => ({
  transform: vi.fn(),
}))

vi.mock('../modules/validator/validator', () => ({
  validate: vi.fn(),
}))

vi.mock('../modules/renderer/renderer', () => ({
  render: vi.fn(),
}))

vi.mock('./token-logger', () => ({
  logTokenUsage: vi.fn(),
}))

// --- Import mocked functions after vi.mock declarations ---

import { deriveTitle } from '../modules/intake/intake'
import { extractClaims } from '../modules/claim-extractor/claim-extractor'
import { selectTechniques } from '../modules/technique-selector/technique-selector'
import { transform } from '../modules/transformer/transformer'
import { validate } from '../modules/validator/validator'
import { render } from '../modules/renderer/renderer'

// --- Shared fixtures ---

const mockConfig: ProviderConfig = {
  provider: 'anthropic',
  model: 'claude-3-haiku-20240307',
  apiKey: 'test-key',
}

const baseInput: PipelineInput = {
  sourceContent: {
    text: 'The mitochondria is the powerhouse of the cell.',
    inputType: 'paste',
    title: 'Biology 101',
  },
  styleSelection: 'orbital-light',
  providerConfig: {
    transformation: mockConfig,
    validation: mockConfig,
  },
}

const mockClaims = [{ id: '1', text: 'The mitochondria is the powerhouse of the cell.' }]

const mockTransformedContent = {
  title: 'Biology 101',
  sections: [{ type: 'BLUF' as const, body: 'Summary paragraph.' }],
  techniqueAudit: { applied: ['BLUF'], skipped: [], conditionLog: {} },
}

const mockTechniques = {
  always: ['BLUF' as const, 'teach-not-label-headings' as const, '60-second-cheat-sheet' as const],
  conditional: [],
  conditionLog: {},
}

const mockPdfBuffer = Buffer.from('%PDF-1.4 mock')

// Helper to collect all events emitted by an orchestrator run
function collectEvents(orchestrator: PipelineOrchestrator): {
  complete: Array<{ pdfBuffer: Buffer; title: string }>
  errors: Array<{ stage: string; cause: string }>
  retries: Array<{ attempt: number; max: number }>
  stages: Array<{ stage: string }>
  wait: () => Promise<void>
} {
  const complete: Array<{ pdfBuffer: Buffer; title: string }> = []
  const errors: Array<{ stage: string; cause: string }> = []
  const retries: Array<{ attempt: number; max: number }> = []
  const stages: Array<{ stage: string }> = []

  orchestrator.on('pipeline:complete', (p) => complete.push(p))
  orchestrator.on('pipeline:error', (p) => errors.push(p))
  orchestrator.on('pipeline:retry', (p) => retries.push(p))
  orchestrator.on('pipeline:stage-update', (p) => stages.push(p))

  const wait = () => new Promise<void>((resolve) => setImmediate(resolve))

  return { complete, errors, retries, stages, wait }
}

// --- Tests ---

describe('PipelineOrchestrator', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('happy path: emits pipeline:complete with a PDF buffer when all modules succeed', async () => {
    // Implements FR-007: PDF only emitted on full success
    vi.mocked(extractClaims).mockResolvedValue({
      ok: true,
      value: { claims: mockClaims, tokenUsage: { inputTokens: 10, outputTokens: 5 } },
    })
    vi.mocked(selectTechniques).mockReturnValue(mockTechniques)
    vi.mocked(transform).mockResolvedValue({
      ok: true,
      value: { content: mockTransformedContent, usage: { inputTokens: 100, outputTokens: 200 } },
    })
    vi.mocked(validate).mockResolvedValue({
      ok: true,
      value: {
        result: { passed: true, failedClaims: [] },
        tokenUsage: { inputTokens: 20, outputTokens: 10 },
      },
    })
    vi.mocked(render).mockResolvedValue({
      ok: true,
      value: mockPdfBuffer,
    })

    const orchestrator = new PipelineOrchestrator({ userDataPath: '/tmp/test' })
    const { complete, errors, wait } = collectEvents(orchestrator)

    await orchestrator.runPipeline(baseInput)
    await wait()

    expect(errors).toHaveLength(0)
    expect(complete).toHaveLength(1)
    expect(complete[0].title).toBe('Biology 101')
    expect(Buffer.isBuffer(complete[0].pdfBuffer)).toBe(true)
  })

  it('fidelity retry: validator fails on attempt 1, passes on attempt 2 — emits pipeline:retry then pipeline:complete', async () => {
    // Implements FR-017: auto-retry on validation failure
    // Implements AC-013: ProcessingScreen shows retry label
    vi.mocked(extractClaims).mockResolvedValue({
      ok: true,
      value: { claims: mockClaims, tokenUsage: { inputTokens: 10, outputTokens: 5 } },
    })
    vi.mocked(selectTechniques).mockReturnValue(mockTechniques)
    vi.mocked(transform).mockResolvedValue({
      ok: true,
      value: { content: mockTransformedContent, usage: { inputTokens: 100, outputTokens: 200 } },
    })
    // First call fails validation, second call passes
    vi.mocked(validate)
      .mockResolvedValueOnce({
        ok: true,
        value: {
          result: {
            passed: false,
            failedClaims: [{ claim: mockClaims[0], reason: 'Claim not found in output' }],
          },
          tokenUsage: { inputTokens: 20, outputTokens: 10 },
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        value: {
          result: { passed: true, failedClaims: [] },
          tokenUsage: { inputTokens: 20, outputTokens: 10 },
        },
      })
    vi.mocked(render).mockResolvedValue({
      ok: true,
      value: mockPdfBuffer,
    })

    const orchestrator = new PipelineOrchestrator({ userDataPath: '/tmp/test' })
    const { complete, errors, retries, wait } = collectEvents(orchestrator)

    await orchestrator.runPipeline(baseInput)
    await wait()

    expect(errors).toHaveLength(0)
    expect(retries).toHaveLength(1)
    expect(retries[0].attempt).toBe(2)
    expect(retries[0].max).toBe(3)
    expect(complete).toHaveLength(1)
  })

  it('3 validation failures: emits pipeline:error with the correct halt message and no PDF', async () => {
    // Implements FR-018: halt after 3 failed attempts
    // Implements AC-042, AC-043
    vi.mocked(extractClaims).mockResolvedValue({
      ok: true,
      value: { claims: mockClaims, tokenUsage: { inputTokens: 10, outputTokens: 5 } },
    })
    vi.mocked(selectTechniques).mockReturnValue(mockTechniques)
    vi.mocked(transform).mockResolvedValue({
      ok: true,
      value: { content: mockTransformedContent, usage: { inputTokens: 100, outputTokens: 200 } },
    })
    vi.mocked(validate).mockResolvedValue({
      ok: true,
      value: {
        result: {
          passed: false,
          failedClaims: [{ claim: mockClaims[0], reason: 'Claim not found' }],
        },
        tokenUsage: { inputTokens: 20, outputTokens: 10 },
      },
    })

    const orchestrator = new PipelineOrchestrator({ userDataPath: '/tmp/test' })
    const { complete, errors, retries, wait } = collectEvents(orchestrator)

    await orchestrator.runPipeline(baseInput)
    await wait()

    expect(complete).toHaveLength(0)
    expect(retries).toHaveLength(2) // attempts 2 and 3
    expect(errors).toHaveLength(1)
    expect(errors[0].stage).toBe('Validating')
    expect(errors[0].cause).toContain('Validation failed after 3 attempts')
    expect(render).not.toHaveBeenCalled()
  })

  it('module error: transformer failure emits pipeline:error immediately with no retry', async () => {
    // Implements FR-006: names the failed stage; pipeline halts
    // Implements AC-014, AC-015
    vi.mocked(extractClaims).mockResolvedValue({
      ok: true,
      value: { claims: mockClaims, tokenUsage: { inputTokens: 10, outputTokens: 5 } },
    })
    vi.mocked(selectTechniques).mockReturnValue(mockTechniques)
    vi.mocked(transform).mockResolvedValue({
      ok: false,
      error: {
        stage: 'Transforming',
        cause: 'AI API rate limit exceeded',
        retryable: false,
      },
    })

    const orchestrator = new PipelineOrchestrator({ userDataPath: '/tmp/test' })
    const { complete, errors, retries, wait } = collectEvents(orchestrator)

    await orchestrator.runPipeline(baseInput)
    await wait()

    expect(complete).toHaveLength(0)
    expect(retries).toHaveLength(0)
    expect(errors).toHaveLength(1)
    expect(errors[0].stage).toBe('Transforming')
    expect(errors[0].cause).toBe('AI API rate limit exceeded')
    expect(validate).not.toHaveBeenCalled()
    expect(render).not.toHaveBeenCalled()
  })
})
