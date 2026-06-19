import { describe, it, expect, vi } from 'vitest'
import { render } from './renderer'
import type { TransformedContent } from '../../types/index'
import * as path from 'path'

vi.mock('playwright', () => ({
  chromium: {
    launch: vi.fn().mockResolvedValue({
      newPage: vi.fn().mockResolvedValue({
        setContent: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockResolvedValue(Buffer.from('fake-pdf-content')),
      }),
      close: vi.fn().mockResolvedValue(undefined),
    }),
  },
}))

describe('Renderer', () => {
  it('renders a valid PDF buffer for orbital-light', async () => {
    const content: TransformedContent = {
      title: 'Renderer Test',
      sections: [
        { type: 'BLUF', body: 'This is the bottom line up front.' },
        { type: 'body', heading: 'Section 1', body: 'Body paragraph.' },
        { type: '60-second-cheat-sheet', body: 'Cheat sheet item.' }
      ],
      techniqueAudit: { applied: [], skipped: [], conditionLog: {} }
    }

    const result = await render(content, 'orbital-light')

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value).toBeInstanceOf(Buffer)
      expect(result.value.toString()).toBe('fake-pdf-content')
    }
  })

  it('fails gracefully for unknown styles', async () => {
    const content: TransformedContent = {
      title: 'Renderer Test',
      sections: [],
      techniqueAudit: { applied: [], skipped: [], conditionLog: {} }
    }

    const result = await render(content, 'unknown-style' as any)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.cause).toContain('not found in registry')
    }
  })
})
