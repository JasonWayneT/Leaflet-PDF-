import React from 'react'
import SetupWizard from './SetupWizard'
import './styles.css'

// Implements INT-004: first launch checks persisted provider configuration.
function App(): React.ReactElement {
  const [isLoading, setIsLoading] = React.useState(true)
  const [isConfigured, setIsConfigured] = React.useState(false)

  React.useEffect(() => {
    let active = true

    window.bookit.settings.get('providerConfig').then((result) => {
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

  if (isLoading) {
    return (
      <main className="app-shell">
        <section className="placeholder-card">
          <h1>Bookit v2</h1>
        </section>
      </main>
    )
  }

  if (!isConfigured) {
    return <SetupWizard onComplete={() => setIsConfigured(true)} />
  }

  return (
    <main className="app-shell">
      <section className="placeholder-card">
        <span className="eyebrow">NEW DOCUMENT</span>
        <h1>Bookit v2</h1>
        <p>Ready.</p>
      </section>
    </main>
  )
}

export default App
