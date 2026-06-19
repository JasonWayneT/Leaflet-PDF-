import type { FactualClaim, TransformedContent } from '../../types/index'

export function buildValidatorPrompt(transformed: TransformedContent, claims: FactualClaim[]): string {
  const transformedText = JSON.stringify(transformed, null, 2)
  const claimsText = JSON.stringify(claims, null, 2)

  return `You are a strict validation AI evaluating document fidelity.
Your task is to determine if every factual claim extracted from the original source is accurately represented in the transformed output.

Extracted Factual Claims:
---
${claimsText}
---

Transformed Output:
---
${transformedText}
---

For each claim, check if its meaning is present and not contradicted in the transformed output.

Return your response strictly as a JSON object with this exact schema:
{
  "passed": boolean,
  "failedClaims": [
    {
      "claim": { "id": "claim-1", "text": "The earth revolves around the sun." },
      "reason": "Explain why this claim was absent or contradicted."
    }
  ]
}

If all claims are accurately represented, set "passed": true and leave "failedClaims" empty.
If ANY claim is absent, altered, or contradicted, set "passed": false and include it in "failedClaims".

Do not include any text outside the JSON object. Output only the JSON.`
}
