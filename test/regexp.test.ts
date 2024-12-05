import { describe, expect, it } from 'vitest'
import { CHANGELOG_REG, PULL_NUMBER_REG, SKIP_CHANGELOG_REG } from '../src/renderer'
import changelog from './fixtures/changelog'
import releaseNotes from './fixtures/release-notes'

describe('regexp', () => {
  it(': CHANGELOG_REG', () => {
    const records = changelog.matchAll(/-\s/g)
    expect([...records].length).toBe(21)

    const result = changelog.matchAll(CHANGELOG_REG)
    const arr = [...result]
    expect(arr.length).toBe(20)
    expect(arr).toMatchSnapshot()
  })

  it(': PULL_NUMBER_REG', () => {
    const result = releaseNotes.matchAll(PULL_NUMBER_REG)
    const arr = [...result]
    expect(arr.length).toBe(6)
    expect(arr).toMatchSnapshot()
  })

  it(': SKIP_CHANGELOG_REG', () => {
    expect(SKIP_CHANGELOG_REG.test('[x] 本条 PR 不需要纳入 Changelog')).toBe(true)
    expect(SKIP_CHANGELOG_REG.test('[x] 本条 PR 不需要纳入 changelog')).toBe(true)
    expect(SKIP_CHANGELOG_REG.test('[X] 本条 PR 不需要纳入 changelog')).toBe(true)
  })
})
