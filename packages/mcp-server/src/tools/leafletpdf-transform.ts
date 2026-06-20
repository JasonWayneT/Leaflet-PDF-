import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import {
  PipelineOrchestrator,
  processTextInput,
  processFileInput,
  processYouTubeInput
} from '@leafletpdf/core'
import type { ProviderConfig, Result, SourceContent, StageName, StyleName } from '@leafletpdf/core'
import type { ResolvedProviderConfig } from '../config/env-config'

export type TransformArgs = {
  content?: string
  filePath?: string
  style?: string
  title?: string
  outputDir?: string
  verbose?: boolean
}

export type TransformResult = {
  filePath?: string
  title?: string
  style?: string
  attempts?: number
  tokenSummary?: { input: number; output: number }
  stages?: Record<string, string>
  error?: {
    stage: string
    cause: string
    retryable: boolean
  }
}

async function getNextFilename(dir: string, title: string): Promise<string> {
  const safeTitle = title.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_').toLowerCase() || 'document'
  let filename = `${safeTitle}.pdf`
  let counter = 2
  
  await fs.mkdir(dir, { recursive: true })

  while (true) {
    try {
      await fs.access(path.join(dir, filename))
      filename = `${safeTitle}_(${counter}).pdf`
      counter++
    } catch {
      // File does not exist, we can use it
      return path.join(dir, filename)
    }
  }
}

export async function handleTransform(
  args: TransformArgs,
  outputDir: string,
  providerConfig: ResolvedProviderConfig
): Promise<TransformResult> {
  if (args.content && args.filePath) {
    return { error: { stage: 'Configuration', cause: 'content and filePath are mutually exclusive', retryable: false } }
  }
  if (!args.content && !args.filePath) {
    return { error: { stage: 'Configuration', cause: 'Either content or filePath must be provided', retryable: false } }
  }
  
  const styleSelection: StyleName = (args.style === 'orbital-night' ? 'orbital-night' : 'orbital-light')

  let sourceContent: SourceContent
  try {
    let result: Result<SourceContent>
    if (args.filePath) {
      result = await processFileInput(args.filePath)
    } else if (args.content) {
      if (args.content.match(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/)) {
        result = await processYouTubeInput(args.content)
      } else {
        result = processTextInput(args.content)
      }
    } else {
      throw new Error('Unreachable')
    }
    
    if (!result.ok) {
      return { error: result.error }
    }
    sourceContent = result.value
    
    if (args.title) {
      sourceContent.title = args.title
    }
  } catch (error: any) {
    return { error: { stage: 'Intake', cause: error.message, retryable: false } }
  }

  const orchestrator = new PipelineOrchestrator({
    // We override userDataPath for MCP to write to the outputDir or Documents
    userDataPath: path.join(os.homedir(), 'Documents', 'LeafletPDF')
  })

  let attempts = 0
  const stageTimings: Record<string, number> = {}
  let currentStage: string | null = null
  let currentStageStart = 0

  orchestrator.on('pipeline:stage-update', ({ stage }) => {
    if (currentStage) {
      stageTimings[currentStage] = (stageTimings[currentStage] || 0) + (Date.now() - currentStageStart)
    }
    currentStage = stage.toLowerCase()
    currentStageStart = Date.now()
  })

  orchestrator.on('pipeline:retry', ({ attempt }) => {
    attempts = attempt
  })

  return new Promise<TransformResult>((resolve) => {
    orchestrator.on('pipeline:complete', async ({ pdfBuffer, title }) => {
      if (currentStage) {
        stageTimings[currentStage] = (stageTimings[currentStage] || 0) + (Date.now() - currentStageStart)
      }

      const outDir = args.outputDir || outputDir
      const savedPath = await getNextFilename(outDir, title)
      await fs.writeFile(savedPath, pdfBuffer)

      // Token counts are logged to leafletpdf-token-log.jsonl but not surfaced via pipeline events.
      const result: TransformResult = {
        filePath: savedPath,
        title,
        style: styleSelection,
        attempts: Math.max(1, attempts),
        tokenSummary: { input: 0, output: 0 }
      }

      if (args.verbose) {
        result.stages = {}
        for (const [s, ms] of Object.entries(stageTimings)) {
          result.stages[s] = `${(ms / 1000).toFixed(1)}s`
        }
      }

      resolve(result)
    })

    orchestrator.on('pipeline:error', ({ stage, cause }) => {
      resolve({
        error: {
          stage,
          cause,
          retryable: false // Could be determined by stage, but generally false for terminal pipeline errors
        }
      })
    })

    sourceContent.inputType = 'mcp'

    orchestrator.runPipeline({
      sourceContent,
      styleSelection,
      providerConfig
    }).catch(err => {
      resolve({ error: { stage: 'Execution', cause: err.message, retryable: false } })
    })
  })
}
