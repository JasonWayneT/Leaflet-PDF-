import React from 'react'
import SetupWizard, {
  getDefaultModelSlots,
  type SetupWizardProps,
} from './SetupWizard'

// Implements SEC-001: setup payload keeps API keys separate from settings payloads.
const props: SetupWizardProps = {
  onComplete: () => undefined,
}

const anthropicSlots = getDefaultModelSlots('anthropic')
const googleSlots = getDefaultModelSlots('google')
const ollamaSlots = getDefaultModelSlots('ollama')

const element = <SetupWizard {...props} />

void [anthropicSlots, googleSlots, ollamaSlots, element]
