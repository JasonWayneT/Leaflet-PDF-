import React from 'react'
import type { StageName } from '@bookit/core'

export interface ErrorScreenProps {
  stage: StageName
  cause: string
  onStartOver: () => void
}

const STAGE_TITLES: Record<StageName, string> = {
  Extracting: 'Extraction Failed',
  Transforming: 'Transformation Failed',
  Validating: 'Validation Failed',
  Rendering: 'Rendering Failed',
}

export default function ErrorScreen({ stage, cause, onStartOver }: ErrorScreenProps): React.ReactElement {
  return (
    <main className="app-shell">
      <section className="setup-card" style={{ maxWidth: '600px', width: '100%' }}>
        <div className="setup-header" style={{ marginBottom: '24px', borderBottom: '1px solid #ebe8f5', paddingBottom: '16px' }}>
          <span className="eyebrow" style={{ color: '#d93025' }}>PIPELINE ERROR</span>
          <h1 style={{ marginTop: '8px' }}>{STAGE_TITLES[stage]}</h1>
        </div>
        
        <div className="wizard-stack">
          <div style={{ background: '#fce8e6', border: '1px solid #d93025', borderRadius: '8px', padding: '16px', color: '#d93025', marginBottom: '32px' }}>
            <p style={{ margin: 0, fontWeight: 500, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{cause}</p>
          </div>
          
          <div className="button-row">
            <button className="primary-button" onClick={onStartOver}>
              Start Over
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
