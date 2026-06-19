import React, { useState, useEffect } from 'react'
import type { SourceContent, StyleName } from '@bookit/core'
import { processTextInput, processYouTubeInput } from '@bookit/core'
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
      const result = await window.bookit.files.openFile()
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

  const validateInput = async (): Promise<boolean> => {
    setError(undefined)
    
    if (activeMode === 'paste') {
      const result = processTextInput(text)
      if (!result.ok) {
        setError(result.error.cause)
        return false
      }
      setSourceContent(result.value)
      return true
    }
    
    if (activeMode === 'file') {
      if (!sourceContent) {
        setError("File is empty")
        return false
      }
      return true
    }
    
    if (activeMode === 'youtube') {
      if (!url.trim()) {
        setError("Please enter a valid YouTube URL")
        return false
      }
      setIsProcessingYoutube(true)
      try {
        const result = await processYouTubeInput(url)
        if (!result.ok) {
          setError(result.error.cause)
          return false
        }
        setSourceContent(result.value)
        return true
      } catch (err) {
        setError(String(err))
        return false
      } finally {
        setIsProcessingYoutube(false)
      }
    }
    
    return false
  }

  const handleSubmit = async () => {
    const isValid = await validateInput()
    if (!isValid) return
    
    // We expect validateInput to update sourceContent, but because React state updates are async,
    // we need to rely on the latest result. Actually, validateInput updates state but we can't read it
    // synchronously here. So let's re-evaluate here instead of reading from state.
    
    let finalSourceContent: SourceContent | undefined = undefined
    
    if (activeMode === 'paste') {
      const result = processTextInput(text)
      if (result.ok) finalSourceContent = result.value
    } else if (activeMode === 'file') {
      finalSourceContent = sourceContent
    } else if (activeMode === 'youtube') {
      // already processed by validateInput, but wait, if it just processed it, sourceContent state isn't updated yet.
      // So validateInput should return it. Let's refactor inline for now.
      const result = await processYouTubeInput(url)
      if (result.ok) finalSourceContent = result.value
    }
    
    if (!finalSourceContent) return

    const submissionContent = { ...finalSourceContent }
    if (title.trim()) {
      submissionContent.title = title.trim()
    }
    
    // Retrieve provider settings from the main process
    const settingsResult = await window.bookit.settings.get('providerConfig')
    if (!settingsResult.ok || !settingsResult.value) {
      setError('Provider configuration is missing. Please check your settings.')
      return
    }

    const providerConfig = settingsResult.value

    console.log("Submitting Pipeline:", { sourceContent: submissionContent, style })
    window.bookit.pipeline.run({
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
