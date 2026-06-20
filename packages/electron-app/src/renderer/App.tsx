import React from 'react'
import SetupWizard from './SetupWizard'
import SettingsScreen from './SettingsScreen'
import InputScreen from './InputScreen/InputScreen'
import ProcessingScreen from './ProcessingScreen/ProcessingScreen'
import ErrorScreen from './ProcessingScreen/ErrorScreen'
import SuccessScreen from './ProcessingScreen/SuccessScreen'
import type { StageName } from '@leafletpdf/core'
import './styles.css'

// Implements INT-004: first launch checks persisted provider configuration.
// Implements UX-DR8: settings accessible via gear icon from main app.
function App(): React.ReactElement {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConfigured, setIsConfigured] = React.useState(false)
  const [showSettings, setShowSettings] = React.useState(false)
  const [isReconfiguring, setIsReconfiguring] = React.useState(false)

  type PipelineState = 'input' | 'processing' | 'success' | 'error'
  const [pipelineState, setPipelineState] = React.useState<PipelineState>('input')
  const [pipelineError, setPipelineError] = React.useState<{stage: StageName, cause: string} | null>(null)
  const [pipelineSuccessPath, setPipelineSuccessPath] = React.useState<string | null>(null)

  React.useEffect(() => {
    let active = true

    window.leafletpdf.settings.get('providerConfig').then((result) => {
      if (!active) {
        return
      }

      setIsConfigured(result.ok && Boolean(result.value))
      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleSetupComplete = React.useCallback(() => {
    setIsConfigured(true)
    setIsReconfiguring(false)
    setShowSettings(false)
  }, [])

  const handleReconfigureProvider = React.useCallback(() => {
    setShowSettings(false)
    setIsReconfiguring(true)
    setIsConfigured(false)
  }, [])

  const handleStartPipeline = React.useCallback(() => {
    setPipelineState('processing')
    setPipelineError(null)
    setPipelineSuccessPath(null)
  }, [])

  const handlePipelineComplete = React.useCallback((filePath: string) => {
    setPipelineSuccessPath(filePath)
    setPipelineState('success')
  }, [])

  const handlePipelineError = React.useCallback((stage: StageName, cause: string) => {
    setPipelineError({ stage, cause })
    setPipelineState('error')
  }, [])

  const handleStartOver = React.useCallback(() => {
    setPipelineState('input')
    setPipelineError(null)
    setPipelineSuccessPath(null)
  }, [])

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="placeholder-card">
          <h1>Leaflet PDF</h1>
        </section>
      </main>
    )
  }

  if (!isConfigured || isReconfiguring) {
    return <SetupWizard onComplete={handleSetupComplete} />
  }

  if (showSettings) {
    return (
      <main className="app-shell app-shell--settings">
        <section className="settings-card">
          <div className="settings-card__topbar">
            <button
              aria-label="Close settings"
              className="settings-close-button"
              id="settings-close-button"
              onClick={() => setShowSettings(false)}
              type="button"
            >
              ✕
            </button>
          </div>
          <SettingsScreen onReconfigureProvider={handleReconfigureProvider} />
        </section>
      </main>
    )
  }

  if (pipelineState === 'processing') {
    return <ProcessingScreen onComplete={handlePipelineComplete} onError={handlePipelineError} />
  }

  if (pipelineState === 'success' && pipelineSuccessPath) {
    return <SuccessScreen filePath={pipelineSuccessPath} onStartOver={handleStartOver} />
  }

  if (pipelineState === 'error' && pipelineError) {
    return <ErrorScreen stage={pipelineError.stage} cause={pipelineError.cause} onStartOver={handleStartOver} />
  }

  return <InputScreen onOpenSettings={() => setShowSettings(true)} onSubmitPipeline={handleStartPipeline} />
}

export default App
