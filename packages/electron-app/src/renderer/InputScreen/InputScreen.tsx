import React, { useState, useEffect } from 'react'
import type { SourceContent, StyleName } from '@leafletpdf/core'
import TextInput from './TextInput'
import FileInput from './FileInput'
import UrlInput from './UrlInput'
import StyleSelector from './StyleSelector'

type InputMode = 'paste' | 'file' | 'youtube'

interface InputScreenProps {
  onOpenSettings: () => void
  onSubmitPipeline: () => void
}

export default function InputScreen({ onOpenSettings, onSubmitPipeline }: InputScreenProps) {
  const [activeMode, setActiveMode] = useState<InputMode>('paste')
  
  const [text, setText] = useState('')
  const [url, setUrl] = useState('')
  const [fileName, setFileName] = useState<string | undefined>()
  
  const [title, setTitle] = useState('')
  const [style, setStyle] = useState<StyleName>('orbital-light')
  
  const [error, setError] = useState<string | undefined>()
  const [sourceContent, setSourceContent] = useState<SourceContent | undefined>()
  
  const [isProcessingYoutube, setIsProcessingYoutube] = useState(false)
  
  // Clear error and sourceContent when switching tabs or input
  useEffect(() => {
    setError(undefined)
    setSourceContent(undefined)
  }, [activeMode, text, url, fileName])

  const handleTabSwitch = (mode: InputMode) => {
    setActiveMode(mode)
    setText('')
    setUrl('')
    setFileName(undefined)
  }

  const handleFileSelect = async () => {
    try {
      const result = await window.leafletpdf.files.openFile()
      if (!result.ok) {
        setError(result.error.cause)
        return
      }
      if (result.value) { // Not canceled
        setFileName(result.value.title || 'Imported File')
        setSourceContent(result.value)
        setError(undefined)
      }
    } catch (err) {
      setError(String(err))
    }
  }

  const validateInput = async (): Promise<SourceContent | null> => {
    setError(undefined)

    if (activeMode === 'paste') {
      const result = await window.leafletpdf.intake.processText(text)
      if (!result.ok) {
        setError(result.error.cause)
        return null
      }
      return result.value
    }

    if (activeMode === 'file') {
      if (!sourceContent) {
        setError("File is empty")
        return null
      }
      return sourceContent
    }

    if (activeMode === 'youtube') {
      if (!url.trim()) {
        setError("Please enter a valid YouTube URL")
        return null
      }
      setIsProcessingYoutube(true)
      try {
        const result = await window.leafletpdf.intake.processYouTube(url)
        if (!result.ok) {
          setError(result.error.cause)
          return null
        }
        return result.value
      } catch (err) {
        setError(String(err))
        return null
      } finally {
        setIsProcessingYoutube(false)
      }
    }

    return null
  }

  const handleSubmit = async () => {
    const validatedContent = await validateInput()
    if (!validatedContent) return

    const submissionContent = { ...validatedContent }
    if (title.trim()) {
      submissionContent.title = title.trim()
    }

    const settingsResult = await window.leafletpdf.settings.get('providerConfig')
    if (!settingsResult.ok || !settingsResult.value) {
      setError('Provider configuration is missing. Please check your settings.')
      return
    }

    const providerConfig = settingsResult.value

    window.leafletpdf.pipeline.run({
      sourceContent: submissionContent,
      styleSelection: style,
      providerConfig: {
        transformation: providerConfig,
        validation: providerConfig
      }
    })

    onSubmitPipeline()
  }

  const isSubmitDisabled = 
    (activeMode === 'paste' && text.trim().length === 0) ||
    (activeMode === 'file' && !fileName) ||
    (activeMode === 'youtube' && url.trim().length === 0) ||
    !!error ||
    isProcessingYoutube

  return (
    <main className="app-shell">
      <section className="setup-card" style={{ maxWidth: '800px', width: '100%' }}>
        <div className="app-topbar">
          <span className="eyebrow">NEW DOCUMENT</span>
          <button
            aria-label="Open settings"
            className="icon-button"
            id="settings-gear-button"
            onClick={onOpenSettings}
            title="Settings"
            type="button"
          >
            ⚙
          </button>
        </div>
        
        <div className="setup-header" style={{ marginBottom: '24px', marginTop: '16px' }}>
          <h1 style={{ marginBottom: '16px' }}>Source Content</h1>
          <div className="step-row" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #ebe8f5', paddingBottom: '16px', marginBottom: '0' }}>
            <button
              className={`secondary-button ${activeMode === 'paste' ? 'selected' : ''}`}
              style={activeMode === 'paste' ? { background: '#f5f2ff', borderColor: '#3525cd', color: '#3525cd', fontWeight: 'bold', minHeight: '36px' } : { border: 'none', minHeight: '36px' }}
              onClick={() => handleTabSwitch('paste')}
            >
              PASTE TEXT
            </button>
            <button
              className={`secondary-button ${activeMode === 'file' ? 'selected' : ''}`}
              style={activeMode === 'file' ? { background: '#f5f2ff', borderColor: '#3525cd', color: '#3525cd', fontWeight: 'bold', minHeight: '36px' } : { border: 'none', minHeight: '36px' }}
              onClick={() => handleTabSwitch('file')}
            >
              IMPORT FILE
            </button>
            <button
              className={`secondary-button ${activeMode === 'youtube' ? 'selected' : ''}`}
              style={activeMode === 'youtube' ? { background: '#f5f2ff', borderColor: '#3525cd', color: '#3525cd', fontWeight: 'bold', minHeight: '36px' } : { border: 'none', minHeight: '36px' }}
              onClick={() => handleTabSwitch('youtube')}
            >
              YOUTUBE URL
            </button>
          </div>
        </div>
        
        <div className="wizard-stack">
          <div className="input-field">
            <label className="field-label" style={{ marginBottom: '8px' }}>DOCUMENT TITLE (OPTIONAL)</label>
            <input
              className="text-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="If left blank, a title will be derived automatically"
            />
          </div>
          
          {activeMode === 'paste' && <TextInput text={text} onChange={setText} error={error} />}
          {activeMode === 'file' && <FileInput fileName={fileName} error={error} onFileSelect={handleFileSelect} />}
          {activeMode === 'youtube' && <UrlInput url={url} onChange={setUrl} error={error} />}
          
          <StyleSelector value={style} onChange={setStyle} />
          
          <div className="button-row" style={{ marginTop: '32px' }}>
            <button
              className="primary-button"
              disabled={isSubmitDisabled}
              onClick={handleSubmit}
            >
              {isProcessingYoutube ? 'Extracting...' : 'Submit'}
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
