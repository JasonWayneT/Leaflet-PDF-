import React, { useMemo, useState } from 'react'
import type {
  ProviderSetupPayload,
  ProviderTestPayload,
} from './types/preload-api'
import type { ModelSlotSettings, ProviderSettings } from '../main/settings-store'
import './styles.css'

type ProviderChoice = ProviderSettings['provider']
type WizardStep = 'provider' | 'credentials' | 'confirm'

export type SetupWizardProps = {
  onComplete: () => void
}

const providerLabels: Record<ProviderChoice, string> = {
  anthropic: 'Anthropic',
  google: 'Google',
  ollama: 'Ollama',
}

export function getDefaultModelSlots(provider: ProviderChoice): ModelSlotSettings {
  if (provider === 'anthropic') {
    return {
      transformation: {
        provider,
        model: 'claude-sonnet-4-6',
      },
      validation: {
        provider,
        model: 'claude-haiku-4-5',
      },
    }
  }

  if (provider === 'google') {
    return {
      transformation: {
        provider,
        model: 'gemini-2.5-pro',
      },
      validation: {
        provider,
        model: 'gemini-2.5-flash',
      },
    }
  }

  return {
    transformation: {
      provider,
      model: 'llama3.2',
    },
    validation: {
      provider,
      model: 'llama3.2',
    },
  }
}

function providerConfigFor(provider: ProviderChoice, baseUrl: string): ProviderSettings {
  return provider === 'ollama'
    ? {
        provider,
        baseUrl,
      }
    : { provider }
}

function testPayloadFor(
  provider: ProviderChoice,
  apiKey: string,
  baseUrl: string,
  modelSlots: ModelSlotSettings
): ProviderTestPayload {
  if (provider === 'ollama') {
    return {
      provider,
      model: modelSlots.validation.model,
      baseUrl,
    }
  }

  return {
    provider,
    model: modelSlots.validation.model,
    apiKey,
  }
}

function setupPayloadFor(
  provider: ProviderChoice,
  apiKey: string,
  baseUrl: string,
  modelSlots: ModelSlotSettings
): ProviderSetupPayload {
  return {
    providerConfig: providerConfigFor(provider, baseUrl),
    apiKey: provider === 'ollama' ? undefined : apiKey,
    modelSlots,
  }
}

function SetupWizard({ onComplete }: SetupWizardProps): React.ReactElement {
  const [step, setStep] = useState<WizardStep>('provider')
  const [provider, setProvider] = useState<ProviderChoice>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('http://localhost:11434')
  const [isTesting, setIsTesting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tested, setTested] = useState(false)

  const modelSlots = useMemo(() => getDefaultModelSlots(provider), [provider])
  const requiresApiKey = provider !== 'ollama'
  const canTest = requiresApiKey ? apiKey.trim().length > 0 : baseUrl.trim().length > 0

  async function testConnection(): Promise<void> {
    setError(null)
    setIsTesting(true)

    const result = await window.leafletpdf.provider.testConnection(
      testPayloadFor(provider, apiKey.trim(), baseUrl.trim(), modelSlots)
    )

    setIsTesting(false)

    if (!result.ok) {
      setTested(false)
      setError(result.error.cause)
      return
    }

    setTested(true)
    setStep('confirm')
  }

  async function completeSetup(): Promise<void> {
    setError(null)

    const result = await window.leafletpdf.provider.saveSetup(
      setupPayloadFor(provider, apiKey.trim(), baseUrl.trim(), modelSlots)
    )

    if (!result.ok) {
      setError(result.error.cause)
      return
    }

    onComplete()
  }

  return (
    <main className="setup-shell">
      <section className="setup-card" aria-label="Provider setup">
        <div className="setup-header">
          <span className="eyebrow">SETUP</span>
          <h1>Choose your AI provider.</h1>
        </div>

        <div className="step-row" aria-label="Setup progress">
          {['provider', 'credentials', 'confirm'].map((item, index) => (
            <span
              className={`step-dot ${step === item ? 'active' : ''}`}
              key={item}
            >
              {index + 1}
            </span>
          ))}
        </div>

        {step === 'provider' && (
          <div className="wizard-stack">
            <div className="provider-grid">
              {(['anthropic', 'google', 'ollama'] as ProviderChoice[]).map(
                (option) => (
                  <button
                    className={`provider-card ${
                      provider === option ? 'selected' : ''
                    }`}
                    key={option}
                    onClick={() => {
                      setProvider(option)
                      setTested(false)
                      setError(null)
                    }}
                    type="button"
                  >
                    <span>{providerLabels[option]}</span>
                  </button>
                )
              )}
            </div>
            <button
              className="primary-button"
              onClick={() => setStep('credentials')}
              type="button"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'credentials' && (
          <div className="wizard-stack">
            <label className="field-label" htmlFor="provider-secret">
              {provider === 'ollama' ? 'BASE URL' : 'API KEY'}
            </label>
            <input
              className="text-input"
              id="provider-secret"
              onChange={(event) =>
                provider === 'ollama'
                  ? setBaseUrl(event.target.value)
                  : setApiKey(event.target.value)
              }
              placeholder={
                provider === 'ollama'
                  ? 'http://localhost:11434'
                  : `${providerLabels[provider]} API key`
              }
              type={provider === 'ollama' ? 'url' : 'password'}
              value={provider === 'ollama' ? baseUrl : apiKey}
            />
            {provider === 'ollama' && (
              <p className="field-hint">Minimum 8GB VRAM recommended.</p>
            )}
            {error && <p className="error-text">{error}</p>}
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => setStep('provider')}
                type="button"
              >
                Back
              </button>
              <button
                className="primary-button"
                disabled={!canTest || isTesting}
                onClick={testConnection}
                type="button"
              >
                {isTesting ? 'Testing' : 'Test Connection'}
              </button>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="wizard-stack">
            <div className="summary-box">
              <span className="eyebrow">PROVIDER</span>
              <strong>{providerLabels[provider]}</strong>
              <span className="eyebrow">TRANSFORMATION</span>
              <p>{modelSlots.transformation.model}</p>
              <span className="eyebrow">VALIDATION</span>
              <p>{modelSlots.validation.model}</p>
            </div>
            {error && <p className="error-text">{error}</p>}
            <div className="button-row">
              <button
                className="secondary-button"
                onClick={() => setStep('credentials')}
                type="button"
              >
                Back
              </button>
              <button
                className="primary-button"
                disabled={!tested}
                onClick={completeSetup}
                type="button"
              >
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default SetupWizard
