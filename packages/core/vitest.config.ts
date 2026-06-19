import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Include runtime test files only.
    // Files ending in .test.ts that contain compile-time-only type assertions
    // (intake, ai-client, providers, types) are excluded here — they are
    // validated by `tsc --noEmit` (the build script) and do not contain
    // vitest describe/it blocks.
    include: [
      'src/orchestrator/pipeline-orchestrator.test.ts',
      'src/orchestrator/token-logger.test.ts',
      'src/modules/transformer/transformer.test.ts',
      'src/modules/validator/validator.test.ts',
      'src/modules/claim-extractor/claim-extractor.test.ts',
      'src/modules/technique-selector/technique-selector.test.ts',
      'src/modules/renderer/renderer.test.ts',
    ],
  },
})
