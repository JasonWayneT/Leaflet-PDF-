// Implements FR-8, FR-9, FR-10, FR-11, FR-12
import type { SourceContent, TechniqueList, ConditionalTechnique } from '../../types/index'
import { MENTAL_BUCKET_THRESHOLD, JARGON_PATTERNS, FACTUAL_PATTERNS, TOPIC_SHIFT_PATTERNS } from './rules'

export function selectTechniques(sourceContent: SourceContent): TechniqueList {
  const text = sourceContent.text
  const wordCount = text.split(/\s+/).filter(word => word.length > 0).length

  const conditionLog: Record<string, string> = {}
  const conditional: ConditionalTechnique[] = []

  // Rule 1: Mental Buckets
  const hasMultipleTopics = TOPIC_SHIFT_PATTERNS.some(p => p.test(text))
  if (wordCount >= MENTAL_BUCKET_THRESHOLD) {
    conditional.push('mental-buckets')
    conditionLog['mental-buckets'] = `Included because word count (${wordCount}) exceeds threshold (${MENTAL_BUCKET_THRESHOLD})`
  } else if (hasMultipleTopics) {
    conditional.push('mental-buckets')
    conditionLog['mental-buckets'] = 'Included because multiple distinct topic shifts were detected in the text'
  } else {
    conditionLog['mental-buckets'] = `Excluded: word count (${wordCount}) is below threshold and no topic shifts detected`
  }

  // Rule 2: Jargon Translation
  const hasJargon = JARGON_PATTERNS.some(p => p.test(text))
  if (hasJargon) {
    conditional.push('jargon-translation')
    conditionLog['jargon-translation'] = 'Included because technical or domain-specific jargon was detected'
  } else {
    conditionLog['jargon-translation'] = 'Excluded: no technical jargon detected'
  }

  // Rule 3: Facts -> Implications
  const isFactual = FACTUAL_PATTERNS.some(p => p.test(text))
  if (isFactual) {
    conditional.push('facts-implications')
    conditionLog['facts-implications'] = 'Included because the content contains factual assertions or evidence-based language'
  } else {
    conditionLog['facts-implications'] = 'Excluded: content does not appear primarily factual or assertive'
  }

  return {
    always: ['BLUF', 'teach-not-label-headings', '60-second-cheat-sheet'],
    conditional,
    conditionLog
  }
}
