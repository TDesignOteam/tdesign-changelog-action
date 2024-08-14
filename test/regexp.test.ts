import { describe, expect, it } from 'vitest'
import { CHANGELOG_REG, PULL_NUMBER_REG } from '../src/renderer'
import changelog from './fixtures/changelog'
import releaseNotes from './fixtures/releaseNotes'

describe('regexp', () => {
  it(': CHANGELOG_REG', () => {
    const result = changelog.matchAll(CHANGELOG_REG)
    const arr = [...result]
    expect(arr.length).toBe(13)
    expect(arr).toMatchSnapshot()
  })
  it(': PULL_NUMBER_REG', () => {
    const result = releaseNotes.matchAll(PULL_NUMBER_REG)
    const arr = [...result]
    expect(arr.length).toBe(14)
    expect(arr).toMatchSnapshot()
  })
})
