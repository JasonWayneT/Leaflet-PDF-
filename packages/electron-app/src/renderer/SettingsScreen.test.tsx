// Compile-time smoke test for SettingsScreen — Implements ARCH-006: co-located tests.
import React from 'react'
import SettingsScreen, { type SettingsScreenProps } from './SettingsScreen'

// Implements UX-DR8: settings screen requires onReconfigureProvider callback.
const props: SettingsScreenProps = {
  onReconfigureProvider: () => undefined,
}

const element = <SettingsScreen {...props} />

void element
