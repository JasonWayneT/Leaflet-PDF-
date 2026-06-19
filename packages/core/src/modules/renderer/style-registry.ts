import * as path from 'path'
import type { StyleName, StyleRegistryEntry } from '../../types/index'

export const styleRegistry: Record<StyleName, StyleRegistryEntry> = {
  'orbital-light': {
    specPath: path.resolve(__dirname, 'templates/orbital-light.md'),
    templatePath: path.resolve(__dirname, 'templates/orbital-light.html'),
  },
  'orbital-night': {
    specPath: path.resolve(__dirname, 'templates/orbital-night.md'),
    templatePath: path.resolve(__dirname, 'templates/orbital-night.html'),
  }
}

export function getStyleEntry(styleName: StyleName): StyleRegistryEntry | undefined {
  return styleRegistry[styleName]
}
