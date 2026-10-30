import { defineConfig } from 'tsdown'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  platform: 'node',
  shims: true,
  entry: ['src/index.ts'],
  deps: {
    alwaysBundle: [...Object.keys(packageJson.dependencies)],
    onlyBundle: [
      '@actions/core',
      '@actions/exec',
      '@actions/github',
      '@actions/http-client',
      '@actions/io',
      '@octokit/auth-token',
      '@octokit/core',
      '@octokit/endpoint',
      '@octokit/graphql',
      '@octokit/plugin-paginate-rest',
      '@octokit/plugin-rest-endpoint-methods',
      '@octokit/request',
      '@octokit/request-error',
      'before-after-hook',
      'camelcase',
      'fast-content-type-parse',
      'fdir',
      'marked',
      'openai',
      'picomatch',
      'tinyglobby',
      'tunnel',
      'undici',
      'universal-user-agent',
      'yaml',
    ],
  },
})
