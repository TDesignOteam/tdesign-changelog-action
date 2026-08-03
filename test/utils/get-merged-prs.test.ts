import { Buffer } from 'node:buffer'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import useGithub from '../../src/utils/github'

const octokit = vi.hoisted(() => {
  const rest = {
    repos: {
      compareCommitsWithBasehead: vi.fn(),
      getContent: vi.fn(),
      listCommits: vi.fn(),
      listPullRequestsAssociatedWithCommit: vi.fn(),
      listTags: vi.fn(),
    },
  }
  return {
    rest,
    paginate: vi.fn(async (
      route: string | ((params: unknown) => Promise<{ data: unknown }>),
      params: unknown,
      map?: (response: { data: unknown }) => unknown[],
    ) => {
      const response = typeof route === 'string'
        ? await rest.repos.compareCommitsWithBasehead(params)
        : await route(params)
      if (map)
        return map(response)
      const data = response.data as { commits?: unknown[] } | unknown[]
      return Array.isArray(data) ? data : data.commits || []
    }),
  }
})

const mocks = vi.hoisted(() => ({
  info: vi.fn(),
  warning: vi.fn(),
}))

vi.mock('@actions/core', () => ({ info: mocks.info, warning: mocks.warning }))
vi.mock('@actions/github', () => ({
  getOctokit: vi.fn(() => octokit),
  context: { repo: { owner: 'owner', repo: 'repo' } },
}))

describe('getMergedPrNumbersBetweenRefs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('collects and dedupes PR numbers from paginated commits', async () => {
    octokit.paginate.mockImplementationOnce(async (_route, _params, map) => [
      ...map!({ data: { commits: [{ sha: 'a' }, { sha: 'b' }] } }),
      ...map!({ data: { commits: [{ sha: 'c' }] } }),
    ])
    octokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({
      data: {
        commits: [
          { sha: 'a', parents: [{ sha: 'p1' }] },
          { sha: 'b', parents: [{ sha: 'p2' }, { sha: 'p3' }] },
          { sha: 'c', parents: [{ sha: 'p4' }, { sha: 'p5' }] },
        ],
      },
    })
    octokit.rest.repos.listPullRequestsAssociatedWithCommit
      .mockResolvedValueOnce({ data: [{ number: 9, merged_at: '2026-01-01' }, { number: 99, merged_at: null }] })
      .mockResolvedValueOnce({ data: [{ number: 10, merged_at: '2026-01-01' }] })
      .mockResolvedValueOnce({ data: [{ number: 10, merged_at: '2026-01-01' }, { number: 11, merged_at: '2026-01-01' }] })

    const { getMergedPrNumbersBetweenRefs } = useGithub('token')
    const prs = await getMergedPrNumbersBetweenRefs('1.0.0', 'main')

    expect(prs.sort((a, b) => a - b)).toEqual([9, 10, 11])
    expect(octokit.paginate).toHaveBeenCalledWith(
      octokit.rest.repos.compareCommitsWithBasehead,
      expect.objectContaining({ basehead: '1.0.0...main', per_page: 100 }),
      expect.any(Function),
    )
  })

  it('tolerates listPullRequestsAssociatedWithCommit failure per commit', async () => {
    octokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({
      data: {
        commits: [
          { sha: 'b', parents: [{ sha: 'p2' }, { sha: 'p3' }] },
          { sha: 'c', parents: [{ sha: 'p4' }, { sha: 'p5' }] },
        ],
      },
    })
    octokit.rest.repos.listPullRequestsAssociatedWithCommit
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValueOnce({ data: [{ number: 11, merged_at: '2026-01-01' }] })

    const { getMergedPrNumbersBetweenRefs } = useGithub('token')
    const prs = await getMergedPrNumbersBetweenRefs('1.0.0', 'main')

    expect(prs).toEqual([11])
    expect(mocks.warning).toHaveBeenCalledWith(expect.stringContaining('跳过 commit b'))
    expect(mocks.warning).toHaveBeenCalledWith(expect.stringContaining('1 个 commit 查询失败'))
  })

  it('scans the complete head history when no base tag exists', async () => {
    octokit.rest.repos.listCommits.mockResolvedValue({
      data: [{ sha: 'new' }, { sha: 'old' }],
    })
    octokit.rest.repos.listPullRequestsAssociatedWithCommit
      .mockResolvedValueOnce({ data: [{ number: 1, merged_at: '2026-01-01' }] })
      .mockResolvedValueOnce({ data: [{ number: 2, merged_at: '2026-01-01' }] })

    const { getMergedPrNumbersBetweenRefs } = useGithub('token')
    const prs = await getMergedPrNumbersBetweenRefs(undefined, 'main')

    expect(prs).toEqual([1, 2])
    expect(octokit.paginate).toHaveBeenCalledWith(
      octokit.rest.repos.listCommits,
      expect.objectContaining({ sha: 'main', per_page: 100 }),
    )
    expect(octokit.rest.repos.listPullRequestsAssociatedWithCommit).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ commit_sha: 'old' }),
    )
  })
})

describe('repository tag and file APIs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('finds the first reachable stable tag', async () => {
    octokit.rest.repos.listTags.mockResolvedValue({
      data: [{ name: '2.0.0-beta.1' }, { name: '1.5.0' }, { name: '1.0.0' }],
    })
    octokit.rest.repos.compareCommitsWithBasehead.mockResolvedValue({ data: { status: 'ahead' } })

    const { getLatestTag } = useGithub('token')

    await expect(getLatestTag('main', true)).resolves.toBe('1.5.0')
    expect(octokit.rest.repos.compareCommitsWithBasehead).toHaveBeenCalledWith(
      expect.objectContaining({ basehead: '1.5.0...main' }),
    )
  })

  it('skips tags that are not reachable from the target ref', async () => {
    octokit.rest.repos.listTags.mockResolvedValue({
      data: [{ name: '2.0.0' }, { name: '1.0.0' }],
    })
    octokit.rest.repos.compareCommitsWithBasehead
      .mockResolvedValueOnce({ data: { status: 'diverged' } })
      .mockResolvedValueOnce({ data: { status: 'identical' } })

    const { getLatestTag } = useGithub('token')

    await expect(getLatestTag('maintenance')).resolves.toBe('1.0.0')
  })

  it('reads repository files without a checkout', async () => {
    octokit.rest.repos.getContent.mockResolvedValue({
      data: { type: 'file', encoding: 'base64', content: Buffer.from('{"name":"pkg"}').toString('base64') },
    })

    const { getRepositoryFile } = useGithub('token')

    await expect(getRepositoryFile('package.json', 'head-sha')).resolves.toBe('{"name":"pkg"}')
    expect(octokit.rest.repos.getContent).toHaveBeenCalledWith(expect.objectContaining({ path: 'package.json', ref: 'head-sha' }))
  })
})
