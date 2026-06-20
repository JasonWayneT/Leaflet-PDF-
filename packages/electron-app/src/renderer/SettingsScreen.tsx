// Implements UX-DR8: Settings screen with Providers + Model Slots sections.
// Implements SEC-001, SEC-002: API keys never displayed or routed through electron-store.
import React, { useCallback, useEffect, useState } from 'react'
import type { ModelSlotSettings, ProviderSettings } from '../main/settings-store'
import './styles.css'

type ProviderName = 'anthropic' | 'google' | 'ollama'

const PROVIDER_LABELS: Record<ProviderName, string> = {
  anthropic: 'Anthropic',
  google: 'Google',
  ollama: 'Ollama',
}

type EditingSlot = 'transformation' | 'validation' | null

type SlotEditorState = {
  model: string
}

export type SettingsScreenProps = {
  onReconfigureProvider: () => void
}

function ProviderStatusCard({
  providerConfig,
  onReconfigure,
}: {
  providerConfig: ProviderSettings
  onReconfigure: () => void
}): React.ReactElement {
  const label = PROVIDER_LABELS[providerConfig.provider]

  return (
    // Implements UX-DR8: one status card per configured provider
    <div className="settings-provider-card" aria-label={`${label} provider card`}>
      <div className="settings-provider-card__header">
        <span className="eyebrow">PROVIDER</span>
        <strong className="settings-provider-card__name">{label}</strong>
      </div>
      <div className="settings-provider-card__meta">
        {providerConfig.provider === 'ollama' ? (
          <span className="settings-meta-row">
            <span className="eyebrow">BASE URL</span>
            <span className="settings-meta-value">{providerConfig.baseUrl ?? 'http://localhost:11434'}</span>
          </span>
        ) : (
          <span className="settings-meta-row">
            <span className="eyebrow">API KEY</span>
            {/* SEC-001: never display key value — only masked indicator */}
            <span className="settings-meta-value settings-meta-value--masked">●●●●●●●●</span>
          </span>
        )}
        {providerConfig.provider === 'ollama' && (
          <p className="field-hint settings-ollama-note">
            Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models.
          </p>
        )}
      </div>
      <div className="settings-provider-card__footer">
        <button
          className="secondary-button settings-reconfigure-button"
          id="settings-reconfigure-provider-button"
          onClick={onReconfigure}
          type="button"
        >
          Reconfigure Provider
        </button>
      </div>
    </div>
  )
}

function ModelSlotRow({
  label,
  slot,
  slotKey,
  providerConfig,
  isEditing,
  onEdit,
  onSave,
  onCancel,
}: {
  label: string
  slot: { provider: ProviderName; model: string }
  slotKey: 'transformation' | 'validation'
  providerConfig: ProviderSettings | null
  isEditing: boolean
  onEdit: () => void
  onSave: (model: string) => void
  onCancel: () => void
}): React.ReactElement {
  const [draftModel, setDraftModel] = useState(slot.model)

  useEffect(() => {
    if (isEditing) {
      setDraftModel(slot.model)
    }
  }, [isEditing, slot.model])

  return (
    // Implements UX-DR8: Model Slots section with transformation and validation rows
    <div className="settings-slot-row" aria-label={`${label} model slot`}>
      <div className="settings-slot-row__info">
        <span className="eyebrow">{label.toUpperCase()}</span>
        {!isEditing && (
          <span className="settings-slot-row__value">
            {PROVIDER_LABELS[slot.provider]} — {slot.model}
          </span>
        )}
        {isEditing && (
          <div className="settings-slot-editor">
            <label
              className="field-label"
              htmlFor={`settings-${slotKey}-model-input`}
            >
              MODEL NAME
            </label>
            <input
              className="text-input"
              id={`settings-${slotKey}-model-input`}
              onChange={(e) => setDraftModel(e.target.value)}
              placeholder={`e.g. ${slot.model}`}
              type="text"
              value={draftModel}
            />
            {providerConfig?.provider === 'ollama' && (
              <p className="field-hint">
                Minimum 8GB VRAM recommended. Fidelity retry rate may be higher with local models.
              </p>
            )}
            <div className="button-row">
              <button
                className="secondary-button"
                id={`settings-${slotKey}-cancel-button`}
                onClick={onCancel}
                type="button"
              >
                Cancel
              </button>
              <button
                className="primary-button"
                disabled={draftModel.trim().length === 0}
                id={`settings-${slotKey}-save-button`}
                onClick={() => onSave(draftModel.trim())}
                type="button"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>
      {!isEditing && (
        <button
          className="secondary-button settings-edit-button"
          id={`settings-${slotKey}-edit-button`}
          onClick={onEdit}
          type="button"
        >
          Edit
        </button>
      )}
    </div>
  )
}

function SettingsScreen({ onReconfigureProvider }: SettingsScreenProps): React.ReactElement {
  const [providerConfig, setProviderConfig] = useState<ProviderSettings | null>(null)
  const [modelSlots, setModelSlots] = useState<ModelSlotSettings | null>(null)
  const [editingSlot, setEditingSlot] = useState<EditingSlot>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load current settings on mount
  useEffect(() => {
    let active = true

    void Promise.all([
      window.leafletpdf.settings.get('providerConfig'),
      window.leafletpdf.settings.get('modelSlots'),
    ]).then(([configResult, slotsResult]) => {
      if (!active) {
        return
      }

      if (configResult.ok && configResult.value) {
        setProviderConfig(configResult.value)
      }

      if (slotsResult.ok && slotsResult.value) {
        setModelSlots(slotsResult.value)
      }

      setIsLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const handleSaveSlot = useCallback(
    async (slotKey: 'transformation' | 'validation', model: string) => {
      if (!modelSlots || !providerConfig) {
        return
      }

      setSaveError(null)

      // Implements UX-DR8: settings changes persisted immediately on save (no Apply step)
      const updatedSlots: ModelSlotSettings = {
        ...modelSlots,
        [slotKey]: {
          provider: providerConfig.provider,
          model,
        },
      }

      const result = await window.leafletpdf.settings.set('modelSlots', updatedSlots)

      if (!result.ok) {
        setSaveError(result.error.cause)
        return
      }

      setModelSlots(updatedSlots)
      setEditingSlot(null)
    },
    [modelSlots, providerConfig]
  )

  if (isLoading) {
    return (
      <div className="settings-loading" aria-label="Loading settings">
        <span className="eyebrow">SETTINGS</span>
        <p className="field-hint">Loading configuration…</p>
      </div>
    )
  }

  return (
    // Implements UX-DR8: Settings screen layout
    <div className="settings-screen" aria-label="Settings">
      <div className="settings-header">
        <span className="eyebrow">SETTINGS</span>
        <h2 className="settings-title">Configuration</h2>
      </div>

      {/* Providers section */}
      <section className="settings-section" aria-label="Providers">
        <h3 className="settings-section-title">Providers</h3>
        {providerConfig ? (
          <ProviderStatusCard
            providerConfig={providerConfig}
            onReconfigure={onReconfigureProvider}
          />
        ) : (
          <p className="field-hint">No provider configured. Use Reconfigure Provider to set one up.</p>
        )}
      </section>

      {/* Model Slots section */}
      <section className="settings-section" aria-label="Model Slots">
        <h3 className="settings-section-title">Model Slots</h3>
        {modelSlots ? (
          <div className="settings-slots-list">
            <ModelSlotRow
              isEditing={editingSlot === 'transformation'}
              label="Transformation"
              providerConfig={providerConfig}
              slot={modelSlots.transformation}
              slotKey="transformation"
              onCancel={() => setEditingSlot(null)}
              onEdit={() => {
                setSaveError(null)
                setEditingSlot('transformation')
              }}
              onSave={(model) => handleSaveSlot('transformation', model)}
            />
            <ModelSlotRow
              isEditing={editingSlot === 'validation'}
              label="Validation / Utility"
              providerConfig={providerConfig}
              slot={modelSlots.validation}
              slotKey="validation"
              onCancel={() => setEditingSlot(null)}
              onEdit={() => {
                setSaveError(null)
                setEditingSlot('validation')
              }}
              onSave={(model) => handleSaveSlot('validation', model)}
            />
          </div>
        ) : (
          <p className="field-hint">No model slots configured.</p>
        )}
        {saveError && <p className="error-text">{saveError}</p>}
      </section>
    </div>
  )
}

export default SettingsScreen
