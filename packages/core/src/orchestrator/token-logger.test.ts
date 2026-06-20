import { describe, it, expect, vi, afterEach } from 'vitest'
import { logTokenUsage } from './token-logger'
import * as fs from 'fs'
import * as path from 'path'

vi.mock('fs')

describe('Token Logger', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('appends stringified JSON to the correct file path', () => {
    const mockLog = { runId: 'test-uuid' } as any
    logTokenUsage('/fake/path', mockLog)

    expect(fs.appendFileSync).toHaveBeenCalledWith(
      path.join('/fake/path', 'leafletpdf-token-log.jsonl'),
      JSON.stringify(mockLog) + '\\n',
      'utf8'
    )
  })

  it('catches and ignores fs errors', () => {
    vi.mocked(fs.appendFileSync).mockImplementation(() => {
      throw new Error('Disk full')
    })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    
    expect(() => logTokenUsage('/fake/path', {} as any)).not.toThrow()
    expect(consoleSpy).toHaveBeenCalledWith('Failed to append token log:', expect.any(Error))
    
    consoleSpy.mockRestore()
  })
})
