import { context } from '@actions/github'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { start } from '../../src/index'

// vi.mock('@actions/github', () => ({
//   context: {
//     action: 'opened',
//     repo: vi.fn(),
//   },
// }))

describe('pull_request', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('repo1', async () => {
    start()
    const { owner, repo } = context.repo
    expect(owner).toBe('TDesignOteam')
    expect(repo).toBe('tdesign-changelog-action')
  })
  it('repo', async () => {
    vi.spyOn(context, 'repo', 'get').mockReturnValue({
      owner: 'test-owner',
      repo: 'test-repo',
    })
    start()
    const { owner, repo } = context.repo
    expect(owner).toBe('test-owner')
    expect(repo).toBe('test-repo')
  })

  it('repo2', async () => {
    vi.spyOn(context, 'repo', 'get').mockReturnValue({
      owner: 'test-owner1',
      repo: 'test-repo',
    })

    const data = start()
    const { owner, repo } = context.repo
    expect(owner).toBe('test-owner1')
    expect(repo).toBe('test-repo')
    expect(data).toBe('test-owner1')
  })
  it('repo5', async () => {
    const { owner, repo } = context.repo
    expect(owner).toBe('TDesignOteam')
    expect(repo).toBe('tdesign-changelog-action')
  })
})
