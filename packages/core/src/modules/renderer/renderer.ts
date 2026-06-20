import * as fs from 'fs'
import { getStyleEntry } from './style-registry'
import type { TransformedContent, StyleName, Result } from '../../types/index'

export async function render(
  transformedContent: TransformedContent,
  styleName: StyleName
): Promise<Result<Buffer>> {
  try {
    const registryEntry = getStyleEntry(styleName)
    if (!registryEntry) {
      throw new Error(`Style '${styleName}' not found in registry`)
    }

    const specContent = fs.readFileSync(registryEntry.specPath, 'utf8')
    const templateContent = fs.readFileSync(registryEntry.templatePath, 'utf8')

    // Parse colors from YAML frontmatter
    let cssVars = ''
    const yamlBlockMatch = specContent.match(/---\n([\s\S]+?)\n---/)
    if (yamlBlockMatch) {
      const colorsBlockMatch = yamlBlockMatch[1].match(/colors:\n([\s\S]+?)(?=\n[a-z]+:|$)/)
      if (colorsBlockMatch) {
        const lines = colorsBlockMatch[1].split('\n')
        for (const line of lines) {
          const m = line.match(/^\s+([a-zA-Z0-9_-]+):\s*"([^"]+)"/)
          if (m) {
            cssVars += `      --${m[1]}: ${m[2]};\n`
          }
        }
      }
    }

    // Inject CSS vars
    let html = templateContent.replace(
      /:root\s*\{[^}]*\}/,
      `:root {\n${cssVars}    }`
    )

    // Build sections
    const blufSections = transformedContent.sections.filter(s => s.type === 'BLUF')
    const blufHtml = blufSections.map(s => `
      <div class="bluf-section">
        ${s.body.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('')}
      </div>
    `).join('')

    const bodySections = transformedContent.sections.filter(s => s.type === 'body')
    const bodyHtml = bodySections.map(s => `
      ${s.heading ? `<h2>${s.heading}</h2>` : ''}
      ${s.body.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('')}
    `).join('')

    const cheatSheetSections = transformedContent.sections.filter(s => s.type === '60-second-cheat-sheet')
    const cheatSheetHtml = cheatSheetSections.map(s => `
      <div class="cheat-sheet-section">
        ${s.heading ? `<h2>${s.heading}</h2>` : ''}
        ${s.body.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('')}
      </div>
    `).join('')

    const conditionalSections = transformedContent.sections.filter(s => 
      s.type !== 'BLUF' && s.type !== 'body' && s.type !== '60-second-cheat-sheet'
    )
    const conditionalHtml = conditionalSections.map(s => `
      <div class="conditional-section">
        ${s.heading ? `<h2>${s.heading}</h2>` : ''}
        ${s.body.split('\n').filter(p => p.trim() !== '').map(p => `<p>${p}</p>`).join('')}
      </div>
    `).join('')

    html = html.replace('{{TITLE}}', transformedContent.title || 'Leaflet PDF Output')
    html = html.replace('{{BLUF_SECTION}}', blufHtml)
    html = html.replace('{{BODY_SECTIONS}}', bodyHtml)
    html = html.replace('{{CONDITIONAL_SECTIONS}}', conditionalHtml)
    html = html.replace('{{CHEAT_SHEET}}', cheatSheetHtml)

    const playwright = await import(/* @vite-ignore */ 'playwright')
    const browser = await playwright.chromium.launch({ headless: true })
    const page = await browser.newPage()
    
    // Set HTML content directly
    await page.setContent(html, { waitUntil: 'networkidle' })

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '24mm', right: '20mm', bottom: '24mm', left: '20mm' }
    })

    await browser.close()

    return {
      ok: true,
      value: pdfBuffer
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        stage: 'Rendering',
        cause: error instanceof Error ? error.message : String(error),
        retryable: false
      }
    }
  }
}
