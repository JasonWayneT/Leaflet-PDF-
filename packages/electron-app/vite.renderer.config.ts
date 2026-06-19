import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Implements ARCH-001: renderer root set to src/renderer per project directory structure
export default defineConfig({
  root: 'src/renderer',
  plugins: [react()],
})
