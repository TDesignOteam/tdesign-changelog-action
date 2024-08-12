import { describe, expect, it } from 'vitest'
import { ChangelogReg } from '../src/renderer'
import { changelog } from './fixtures/changelog'

describe('renderer', () => {
  it('changelogReg', () => {
    const result = changelog.matchAll(ChangelogReg)
    const arr = [...result]
    expect(arr.length).toBe(13)
    expect(arr).toMatchSnapshot()
  })
})
