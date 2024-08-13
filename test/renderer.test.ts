import { describe, expect, it } from 'vitest'
import { ChangelogReg, getPullNumbers } from '../src/renderer'
import { changelog } from './fixtures/changelog'
import { releaseNotes } from './fixtures/releaseNotes'

describe('renderer', () => {
  it(': changelogReg', () => {
    const result = changelog.matchAll(ChangelogReg)
    const arr = [...result]
    expect(arr.length).toBe(13)
    expect(arr).toMatchSnapshot()
  })
  it(': getPullNumber', () => {
    const result = getPullNumbers(releaseNotes.body)
    expect(result.length).toBe(14)
    expect(result).toMatchSnapshot()
  })
})
