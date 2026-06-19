import React from 'react'

interface UrlInputProps {
  url: string
  onChange: (url: string) => void
  error?: string
}

export default function UrlInput({ url, onChange, error }: UrlInputProps) {
  return (
    <div className="input-panel" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <input
        className="text-input"
        placeholder="https://youtube.com/watch?v=..."
        value={url}
        onChange={(e) => onChange(e.target.value)}
        type="text"
      />
      {error && <p className="error-text">{error}</p>}
    </div>
  )
}
