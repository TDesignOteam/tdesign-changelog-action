import { context } from '@actions/github'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('pull_request', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('repo1', async () => {
    const { owner, repo } = context.repo
    expect(owner).toEqual('TDesignOteam')
    expect(repo).toEqual('tdesign-changelog-action')
  })
  it('repo', async () => {
    vi.spyOn(context, 'repo', 'get').mockReturnValue({
      owner: 'test-owner',
      repo: 'test-repo',
    })

    const { owner, repo } = context.repo
    expect(owner).toEqual('test-owner')
    expect(repo).toEqual('test-repo')
  })

  it('repo2', async () => {
    vi.spyOn(context, 'repo', 'get').mockReturnValue({
      owner: 'test-owner1',
      repo: 'test-repo',
    })

    const { owner, repo } = context.repo
    expect(owner).toEqual('test-owner1')
    expect(repo).toEqual('test-repo')
  })
  it('repo5', async () => {
    const { owner, repo } = context.repo
    expect(owner).toEqual('TDesignOteam')
    expect(repo).toEqual('tdesign-changelog-action')
  })
})
