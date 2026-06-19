import type { SourceContent } from '../../types/index'

export function buildClaimExtractorPrompt(sourceContent: SourceContent): string {
  return `You are a strict, objective analyst tasked with extracting factual claims from a text.
Extract the meaning of each factual assertion, not the exact quoted string.

Focus only on factual, objective claims. Do not extract opinions, stylistic choices, or rhetorical questions.

Source Content:
---
${sourceContent.text}
---

Return your result as a strictly valid JSON array of objects. Each object must have exactly two keys:
- "id": A unique string (you may generate a UUID or sequential ID like "claim-1")
- "text": The extracted factual claim

Example output:
\`\`\`json
[
  {
    "id": "claim-1",
    "text": "The earth revolves around the sun."
  }
]
\`\`\`

Do not include any text outside the JSON array. Output only the JSON.`
}
