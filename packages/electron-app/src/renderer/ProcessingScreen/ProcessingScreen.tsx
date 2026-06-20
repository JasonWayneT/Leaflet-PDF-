import React, { useEffect, useState } from 'react'
import type { StageName } from '@leafletpdf/core'

export interface ProcessingScreenProps {
  onComplete: (filePath: string) => void
  onError: (stage: StageName, cause: string) => void
}

const STAGE_LABELS: Record<StageName, string> = {
  Extracting: 'Reading and extracting facts...',
  Transforming: 'Structuring and formatting...',
  Validating: 'Fidelity check in progress...',
  Rendering: 'Generating PDF artifact...',
}

export default function ProcessingScreen({ onComplete, onError }: ProcessingScreenProps): React.ReactElement {
  const [stage, setStage] = useState<StageName>('Extracting')
  const [retryMessage, setRetryMessage] = useState<string>('')
  const [isSaveCanceled, setIsSaveCanceled] = useState<boolean>(false)

  useEffect(() => {
    const unsubStage = window.leafletpdf.pipeline.onStageUpdate((payload) => {
      setStage(payload.stage)
      if (payload.stage !== 'Validating' && payload.stage !== 'Transforming') {
        setRetryMessage('')
      }
    })

    const unsubRetry = window.leafletpdf.pipeline.onRetry((payload) => {
      setRetryMessage(payload.message)
    })

    const unsubComplete = window.leafletpdf.pipeline.onComplete((payload) => {
      onComplete(payload.filePath)
    })

    const unsubError = window.leafletpdf.pipeline.onError((payload) => {
      onError(payload.stage, payload.cause)
    })

    const unsubSaveCanceled = window.leafletpdf.pipeline.onSaveCanceled(() => {
      setIsSaveCanceled(true)
    })

    return () => {
      unsubStage()
      unsubRetry()
      unsubComplete()
      unsubError()
      unsubSaveCanceled()
    }
  }, [onComplete, onError])

  let displayLabel = STAGE_LABELS[stage]
  if (retryMessage && (stage === 'Transforming' || stage === 'Validating')) {
    displayLabel += ` (${retryMessage})`
  }

  const handleRetrySave = () => {
    setIsSaveCanceled(false)
    window.leafletpdf.files.saveFile()
  }

  return (
    <main className="app-shell">
      <section className="setup-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center', padding: '64px 32px' }}>
        <h1 style={{ marginBottom: '24px' }}>Processing Content</h1>
        {!isSaveCanceled ? (
          <div className="processing-indicator" style={{ margin: '0 auto 32px auto', width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #ebe8f5', borderTopColor: '#3525cd', animation: 'spin 1s linear infinite' }} />
        ) : (
          <div style={{ marginBottom: '32px', color: '#5f6368' }}>
            Save canceled. The generated artifact is ready to be saved.
          </div>
        )}
        <p className="eyebrow" style={{ fontSize: '14px', letterSpacing: '0.05em', marginBottom: isSaveCanceled ? '24px' : '0' }}>
          {isSaveCanceled ? 'Waiting for save' : displayLabel}
        </p>
        {isSaveCanceled && (
          <button className="primary-button" onClick={handleRetrySave}>
            Retry Save
          </button>
        )}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </section>
    </main>
  )
}
