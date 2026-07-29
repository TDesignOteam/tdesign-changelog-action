import { describe, expect, it, vi } from 'vitest'
import { pull_request_data } from '../fixtures/pull_request_data'
import { getPackages, stashPackageChangelog } from '../src/utils/common'

vi.mock('node:fs', async (importOriginal) => {
  const fs = await importOriginal<typeof import('node:fs')>()
  return {
    ...fs,
    writeFileSync: vi.fn(() => {
      throw new Error('read-only filesystem')
    }),
  }
})

describe('stashPackageChangelog write failures', () => {
  it('propagates the filesystem error', () => {
    const packages = getPackages('fixtures/repo2')

    expect(() => stashPackageChangelog(pull_request_data, packages, {
      'pkg-a': ['feat: add feature'],
    })).toThrow('read-only filesystem')
  })
})
