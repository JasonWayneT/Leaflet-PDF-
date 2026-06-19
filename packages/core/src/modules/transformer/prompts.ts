import type { FactualClaim, TechniqueList } from '../../types/index'

export function buildTransformerPrompt(
  text: string,
  techniques: TechniqueList,
  claims: FactualClaim[]
): string {
  const techniqueNames = [...techniques.always, ...techniques.conditional]
  
  return `You are an expert document structurer. Your task is to rewrite and structure the provided Source Content according to specific techniques.

CRITICAL CONSTRAINTS:
1. You MUST NOT add, invent, or remove factual claims. The provided factual claims must remain perfectly true and represented in your output.
2. Return ONLY a valid JSON object. Do not wrap it in markdown block quotes (e.g. \`\`\`json). Just return the raw JSON object.

REQUIRED TECHNIQUES TO APPLY:
${techniqueNames.map(t => `- ${t}`).join('\n')}

STRUCTURE OF THE OUTPUT JSON:
{
  "title": "A short, descriptive title for the document",
  "sections": [
    {
      "type": "BLUF",
      "heading": "BLUF",
      "body": "Bottom Line Up Front summary."
    },
    {
      "type": "body",
      "heading": "A teach-not-label heading",
      "body": "Body text"
    },
    // ...other body sections...
    {
      "type": "60-second-cheat-sheet",
      "heading": "60-Second Cheat Sheet",
      "body": "Quick actionable summary."
    }
    // Include 'mental-bucket', 'jargon-translation', or 'facts-implications' section types if they are listed in REQUIRED TECHNIQUES.
  ]
}

SOURCE CONTENT:
${text}

FACTUAL CLAIMS TO PRESERVE:
${claims.map(c => `[${c.id}] ${c.text}`).join('\n')}
`
}
