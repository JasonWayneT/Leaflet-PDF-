import * as fs from 'fs'
import * as path from 'path'
import type { PipelineRunLog } from '../types/index'

export function logTokenUsage(
  userDataPath: string,
  logEntry: PipelineRunLog
): void {
  try {
    const logFilePath = path.join(userDataPath, 'leafletpdf-token-log.jsonl')
    const logLine = JSON.stringify(logEntry) + '\\n'
    fs.appendFileSync(logFilePath, logLine, 'utf8')
  } catch (error) {
    // Fire and forget - never interrupt the pipeline
    console.warn('Failed to append token log:', error)
  }
}
