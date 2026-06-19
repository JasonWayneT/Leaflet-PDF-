import React from 'react'

interface TextInputProps {
  text: string
  onChange: (text: string) => void
  error?: string
}

export default function TextInput({ text, onChange, error }: TextInputProps) {
  return (
    <div className="input-panel">
      <textarea
        className="text-input"
        placeholder="Paste your source content here..."
        value={text}
        onChange={(e) => onChange(e.target.value)}
        rows={12}
        style={{ resize: 'vertical' }}
      />
      {error && <p className="error-text" style={{ marginTop: '8px' }}>{error}</p>}
      <p className="field-hint" style={{ marginTop: '8px', textAlign: 'right' }}>
        {text.length.toLocaleString()} / 100,000 characters
      </p>
    </div>
  )
}
