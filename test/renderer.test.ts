import { describe, expect, it } from 'vitest'
import { ChangelogReg } from '../src/renderer'

describe('renderer', () => {
  it('changelogReg', () => {
    const changelog = `
- A(A): a bug fix
- B(B): a feature
- C(C): a bug fix
- D(D): a feature
- E(): a bug fix
- F: a bug fix
- g(g): a minor fix
- H(H H): a major update
`
    const result = changelog.matchAll(ChangelogReg)
    expect([...result]).toMatchSnapshot()
  })
})
