import React from 'react'
import type { StyleName } from '@leafletpdf/core'

interface StyleSelectorProps {
  value: StyleName
  onChange: (style: StyleName) => void
}

export default function StyleSelector({ value, onChange }: StyleSelectorProps) {
  return (
    <div className="style-selector">
      <label className="field-label">VISUAL STYLE</label>
      <div className="style-options" style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
        <button
          className={`secondary-button ${value === 'orbital-light' ? 'selected' : ''}`}
          style={value === 'orbital-light' ? { background: '#f5f2ff', borderColor: '#3525cd', color: '#3525cd', fontWeight: 'bold' } : {}}
          onClick={() => onChange('orbital-light')}
          type="button"
        >
          Orbital Light
        </button>
        <button
          className={`secondary-button ${value === 'orbital-night' ? 'selected' : ''}`}
          style={value === 'orbital-night' ? { background: '#f5f2ff', borderColor: '#3525cd', color: '#3525cd', fontWeight: 'bold' } : {}}
          onClick={() => onChange('orbital-night')}
          type="button"
        >
          Orbital Night
        </button>
      </div>
    </div>
  )
}
