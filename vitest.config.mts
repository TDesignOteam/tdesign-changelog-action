import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // ...
    setupFiles: ['./test/setupEnv.ts', './test/setupGithub.ts', './test/setupOctokit.ts'],
  },
})
