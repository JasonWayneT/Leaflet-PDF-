import { selectTechniques } from './technique-selector'
import type { SourceContent } from '../../types/index'
import { describe, it, expect } from 'vitest'

describe('Technique Selector', () => {
  it('includes always techniques', () => {
    const input: SourceContent = { text: 'short simple text', inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.always).toEqual(['BLUF', 'teach-not-label-headings', '60-second-cheat-sheet'])
  })

  it('excludes conditionals for short simple text', () => {
    const input: SourceContent = { text: 'A short text about nothing in particular.', inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toEqual([])
  })

  it('includes mental-buckets when word count exceeds threshold', () => {
    // Generate > 1500 words
    const text = Array(1600).fill('word').join(' ')
    const input: SourceContent = { text, inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toContain('mental-buckets')
  })

  it('includes mental-buckets when multiple topics are detected', () => {
    const input: SourceContent = { text: 'Some text. On the other hand, more text.', inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toContain('mental-buckets')
  })

  it('includes jargon-translation when jargon is detected', () => {
    const input: SourceContent = { text: 'This uses an API to fetch data.', inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toContain('jargon-translation')
  })

  it('includes facts-implications when factual language is detected', () => {
    const input: SourceContent = { text: 'The data indicates that this is true.', inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toContain('facts-implications')
  })

  it('includes all conditionals when all conditions are met', () => {
    const text = Array(1600).fill('word').join(' ') + ' The API data indicates that...'
    const input: SourceContent = { text, inputType: 'paste' }
    const result = selectTechniques(input)
    expect(result.conditional).toContain('mental-buckets')
    expect(result.conditional).toContain('jargon-translation')
    expect(result.conditional).toContain('facts-implications')
  })
})
