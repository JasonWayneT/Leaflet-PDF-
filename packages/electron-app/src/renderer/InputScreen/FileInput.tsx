import React from 'react'

interface FileInputProps {
  fileName?: string
  error?: string
  onFileSelect: () => void
}

export default function FileInput({ fileName, error, onFileSelect }: FileInputProps) {
  return (
    <div className="input-panel" style={{ padding: '32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="file-input-box" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button className="secondary-button" onClick={onFileSelect} type="button">
          Select .md or .txt file
        </button>
        {fileName && <p className="field-hint" style={{ fontWeight: 'bold' }}>Selected: {fileName}</p>}
      </div>
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
