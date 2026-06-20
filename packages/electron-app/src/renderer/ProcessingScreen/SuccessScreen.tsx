import React from 'react'

export interface SuccessScreenProps {
  filePath: string
  onStartOver: () => void
}

export default function SuccessScreen({ filePath, onStartOver }: SuccessScreenProps): React.ReactElement {
  const [openError, setOpenError] = React.useState<string | null>(null)

  const handleOpenFile = async () => {
    setOpenError(null)
    const result = await window.Leaflet PDF.files.openExternal(filePath)
    if (!result.ok) {
      setOpenError(result.error.cause)
    }
  }

  return (
    <main className="app-shell">
      <section className="setup-card" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#e6f4ea', color: '#137333', fontSize: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            ✓
          </div>
          <h1>Reading Artifact Saved</h1>
          <p style={{ marginTop: '16px', color: '#5f6368', wordBreak: 'break-all' }}>{filePath}</p>
        </div>

        {openError && (
          <div style={{ color: '#d93025', marginBottom: '16px', fontSize: '14px' }}>
            {openError}
          </div>
        )}

        <div className="button-row" style={{ justifyContent: 'center', gap: '16px' }}>
          <button className="secondary-button" onClick={onStartOver}>
            Process Another
          </button>
          <button className="primary-button" onClick={handleOpenFile}>
            Open File
          </button>
        </div>
      </section>
    </main>
  )
}
