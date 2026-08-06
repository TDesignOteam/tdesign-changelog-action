import type { PullRequestData } from '../src/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { issue_comment } from '../src/github-event/issue-comment'

vi.mock('node:fs', () => ({
  existsSync: vi.fn().mockReturnValue(false),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
  readFileSync: vi.fn().mockReturnValue(''),
  unlinkSync: vi.fn(),
}))

vi.mock('tinyglobby', () => ({
  globSync: vi.fn().mockReturnValue([]),
}))

interface IssueCommentPayload {
  action: string
  changes?: { body: { from: string } }
  comment: { body: string }
  issue: { number: number, pull_request?: Record<string, never> }
}

const mocks = vi.hoisted(() => ({
  addRemote: vi.fn(),
  checkoutBranch: vi.fn(),
  checkoutPr: vi.fn(),
  cloneRepo: vi.fn(),
  createBranch: vi.fn(),
  createPullRequest: vi.fn(),
  context: {
    actor: 'maintainer',
    eventName: 'issue_comment',
    payload: {
      action: 'created',
      comment: { body: '/changelog' },
      issue: { number: 42, pull_request: {} },
    } as IssueCommentPayload,
    repo: { owner: 'owner', repo: 'repo' },
  },
  exec: vi.fn(),
  extractChangelog: vi.fn(),
  getPrCommentWhitelist: vi.fn(),
  getOpenPullRequestByHead: vi.fn(),
  getPullRequestData: vi.fn(),
  getPullRequestFiles: vi.fn(),
  gitPush: vi.fn(),
  isNeedCommit: vi.fn(),
  stashPackageChangelog: vi.fn(),
}))

vi.mock('@actions/core', () => ({ info: vi.fn() }))
vi.mock('@actions/exec', () => ({ exec: mocks.exec }))
vi.mock('@actions/github', () => ({ context: mocks.context }))
vi.mock('../src/utils/common', () => ({
  checkIsForkPr: () => false,
  extractChangelog: mocks.extractChangelog,
  extractReleaseLogs: vi.fn().mockReturnValue([]),
  getChangelogFilePath: (release: { dir: string }, lang: 'zh' | 'en') => `${release.dir}/${lang === 'en' ? 'CHANGELOG.en-US.md' : 'CHANGELOG.md'}`,
  getConfiguredPackages: vi.fn().mockReturnValue([]),
  getInputPkgs: () => ['pkg-a'],
  getPrCommentWhitelist: mocks.getPrCommentWhitelist,
  getPullRequestNumber: () => 42,
  getPullRequestReleaseDirs: vi.fn().mockReturnValue([]),
  stashPackageChangelog: mocks.stashPackageChangelog,
}))
vi.mock('../src/utils/git', () => ({
  default: () => ({
    addRemote: mocks.addRemote,
    checkoutBranch: mocks.checkoutBranch,
    checkoutPr: mocks.checkoutPr,
    cloneRepo: mocks.cloneRepo,
    createBranch: mocks.createBranch,
    gitPush: mocks.gitPush,
    isNeedCommit: mocks.isNeedCommit,
  }),
}))
vi.mock('../src/utils/github', () => ({
  default: () => ({
    createPullRequest: mocks.createPullRequest,
    getOpenPullRequestByHead: mocks.getOpenPullRequestByHead,
    getPullRequestData: mocks.getPullRequestData,
    getPullRequestFiles: mocks.getPullRequestFiles,
  }),
}))

const prData = {
  body: '### 📝 更新日志\n\n#### pkg-a\n- feat(Button): add loading state',
  base: { ref: 'develop', repo: { full_name: 'owner/repo' } },
  head: {
    ref: 'feat/loading',
    repo: { clone_url: 'https://github.com/owner/repo.git', full_name: 'owner/repo' },
    user: { login: 'owner' },
  },
  number: 42,
  state: 'open',
} as unknown as PullRequestData

describe('issue_comment', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.exec.mockResolvedValue(0)
    mocks.context.actor = 'maintainer'
    mocks.context.eventName = 'issue_comment'
    mocks.context.payload = {
      action: 'created',
      comment: { body: '/changelog' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPrCommentWhitelist.mockResolvedValue(['maintainer'])
    mocks.getPullRequestData.mockResolvedValue(prData)
    mocks.extractChangelog.mockReturnValue({ 'pkg-a': ['feat(Button): add loading state'] })
    mocks.isNeedCommit.mockResolvedValue(false)
    mocks.getOpenPullRequestByHead.mockResolvedValue(undefined)
    mocks.createPullRequest.mockResolvedValue({ html_url: 'https://github.com/owner/repo/pull/43' })
  })

  it('submits the PR body changelog when /changelog is created', async () => {
    mocks.context.payload.comment.body = '  /changelog\n'

    await expect(issue_comment('token')).resolves.toBe(true)

    expect(mocks.getPullRequestData).toHaveBeenCalledWith(42)
    expect(mocks.extractChangelog).toHaveBeenNthCalledWith(1, prData.body, ['pkg-a'])
    expect(mocks.extractChangelog).toHaveBeenNthCalledWith(
      2,
      '### 📝 更新日志\n\n#### pkg-a\n- feat(Button): add loading state\n\n\n',
      ['pkg-a'],
    )
    expect(mocks.stashPackageChangelog).toHaveBeenCalledWith(
      prData,
      [],
      { 'pkg-a': ['feat(Button): add loading state'] },
    )
    expect(mocks.cloneRepo).toHaveBeenCalledOnce()
  })

  it('passes actual disk packages (excluding deleted ones) to extractChangelog when \"all\" is used', async () => {
    const { getConfiguredPackages } = await import('../src/utils/common')
    // pkg-b 被删除，磁盘只剩下 pkg-a 和 pkg-c
    vi.mocked(getConfiguredPackages).mockReturnValue([
      { name: 'pkg-a', relativeDir: 'packages/pkg-a', type: 'node' as const },
      { name: 'pkg-c', relativeDir: 'packages/pkg-c', type: 'node' as const },
    ])

    mocks.context.payload.comment.body = '  /changelog\n'

    await expect(issue_comment('token')).resolves.toBe(true)

    // 第一次调用（confirmPullRequestChangelog）仍然用 getInputPkgs() → ['pkg-a']
    expect(mocks.extractChangelog).toHaveBeenNthCalledWith(1, prData.body, ['pkg-a'])
    // 第二次调用（confirmChangelog 修复后）应使用磁盘实际存在的包名 → ['pkg-a', 'pkg-c']
    expect(mocks.extractChangelog).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      ['pkg-a', 'pkg-c'],
    )
    // stashPackageChangelog 也传入来自 getConfiguredPackages 的包列表
    expect(mocks.stashPackageChangelog).toHaveBeenCalledWith(
      prData,
      [
        { name: 'pkg-a', relativeDir: 'packages/pkg-a', type: 'node' },
        { name: 'pkg-c', relativeDir: 'packages/pkg-c', type: 'node' },
      ],
      expect.any(Object),
    )
  })

  it('ignores unrelated created comments before loading the whitelist', async () => {
    mocks.context.payload.comment.body = '/approve'

    await expect(issue_comment('token')).resolves.toBe(false)

    expect(mocks.getPrCommentWhitelist).not.toHaveBeenCalled()
    expect(mocks.getPullRequestData).not.toHaveBeenCalled()
  })

  it('ignores comments on issues', async () => {
    mocks.context.payload.issue = { number: 42 }

    await expect(issue_comment('token')).resolves.toBe(false)

    expect(mocks.getPrCommentWhitelist).not.toHaveBeenCalled()
  })

  it('requires a whitelisted actor for /changelog', async () => {
    mocks.context.actor = 'contributor'

    await expect(issue_comment('token')).resolves.toBe(false)

    expect(mocks.getPullRequestData).not.toHaveBeenCalled()
    expect(mocks.cloneRepo).not.toHaveBeenCalled()
  })

  it('does not submit changelogs for release pull requests', async () => {
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/1.0.0' },
    })

    await expect(issue_comment('token')).resolves.toBe(false)

    expect(mocks.extractChangelog).not.toHaveBeenCalled()
    expect(mocks.cloneRepo).not.toHaveBeenCalled()
  })

  it('creates a changelog pull request when the original PR is already merged', async () => {
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      base: { ...prData.base, ref: 'main' },
      merged: true,
    })
    mocks.isNeedCommit.mockResolvedValue(true)

    await expect(issue_comment('token')).resolves.toBe(true)

    expect(mocks.getOpenPullRequestByHead).toHaveBeenCalledWith('changelog/pr-42')
    expect(mocks.checkoutBranch).toHaveBeenCalledWith('main')
    expect(mocks.createBranch).toHaveBeenCalledWith('changelog/pr-42')
    expect(mocks.gitPush).toHaveBeenCalledWith('changelog/pr-42')
    expect(mocks.createPullRequest).toHaveBeenCalledWith(
      'chore: add changelog for #42',
      'changelog/pr-42',
      'main',
      '补充已合并 PR #42 的 Changelog。',
    )
  })

  it('updates an existing changelog pull request for a merged PR', async () => {
    mocks.getPullRequestData.mockResolvedValue({ ...prData, merged: true })
    mocks.getOpenPullRequestByHead.mockResolvedValue({ number: 43 })
    mocks.isNeedCommit.mockResolvedValue(true)

    await expect(issue_comment('token')).resolves.toBe(true)

    expect(mocks.checkoutBranch).toHaveBeenCalledWith('changelog/pr-42')
    expect(mocks.createBranch).not.toHaveBeenCalled()
    expect(mocks.gitPush).toHaveBeenCalledWith('changelog/pr-42')
    expect(mocks.createPullRequest).not.toHaveBeenCalled()
  })

  it('keeps processing edited changelog confirmations', async () => {
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'old body' } },
      comment: { body: '### 📝 更新日志\n\n#### pkg-a\n- feat(Button): add loading state' },
      issue: { number: 42, pull_request: {} },
    }

    await issue_comment('token')

    expect(mocks.cloneRepo).toHaveBeenCalledOnce()
    expect(mocks.stashPackageChangelog).toHaveBeenCalledOnce()
  })

  it('confirms merged release log with multiple packages', async () => {
    const { extractReleaseLogs, getPullRequestReleaseDirs } = await import('../src/utils/common')

    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '1.0.1', changelog: '## 🌈 1.0.1\n\n### 🚀 Features\n\n- feat: add loading\n\n' },
      { pkgName: 'pkg-b', version: '2.0.0', changelog: '## 🌈 2.0.0\n\n### 🐞 Bug Fixes\n\n- fix: input border\n\n' },
    ])

    vi.mocked(getPullRequestReleaseDirs).mockReturnValue([
      { dir: 'packages/pkg-a', name: 'pkg-a', private: false, version: '1.0.1', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
      { dir: 'packages/pkg-b', name: 'pkg-b', private: false, version: '2.0.0', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
    ])

    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n## 🌈 1.0.1\n\n### 🚀 Features\n- feat: add loading\n\n---\n\n# 🎉 发布 pkg-b\n\n## 🌈 2.0.0\n\n### 🐞 Bug Fixes\n- fix: input border' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/2.0.0' },
    })

    mocks.isNeedCommit.mockResolvedValue(true)

    await issue_comment('token')

    expect(mocks.exec).toHaveBeenCalledWith('git', ['add', '-A', '--', 'packages/pkg-a'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update pkg-a CHANGELOG.md'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['add', '-A', '--', 'packages/pkg-b'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update pkg-b CHANGELOG.md'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['push', 'origin', 'release/2.0.0'], { ignoreReturnCode: true })
  })

  it('confirms single release log (backward compat)', async () => {
    const { extractReleaseLogs, getPullRequestReleaseDirs } = await import('../src/utils/common')

    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '1.0.1', changelog: '## 🌈 1.0.1\n\n### 🚀 Features\n\n- feat: add loading\n\n' },
    ])

    vi.mocked(getPullRequestReleaseDirs).mockReturnValue([
      { dir: 'packages/pkg-a', name: 'pkg-a', private: false, version: '1.0.1', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
      { dir: 'packages/pkg-b', name: 'pkg-b', private: false, version: '2.0.0', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
    ])

    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n## 🌈 1.0.1\n\n### 🚀 Features\n- feat: add loading' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/1.0.1' },
    })

    mocks.isNeedCommit.mockResolvedValue(true)

    await issue_comment('token')

    expect(mocks.exec).toHaveBeenCalledWith('git', ['add', '-A', '--', 'packages/pkg-a'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update pkg-a CHANGELOG.md'])
    expect(mocks.exec).not.toHaveBeenCalledWith('git', ['commit', '-m', 'chore: update pkg-b CHANGELOG.md'])
    expect(mocks.exec).toHaveBeenCalledWith('git', ['push', 'origin', 'release/1.0.1'], { ignoreReturnCode: true })
  })

  it('rejects duplicate package release logs', async () => {
    const { extractReleaseLogs } = await import('../src/utils/common')
    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '1.0.0', changelog: 'first log' },
      { pkgName: 'pkg-a', version: '1.0.0', changelog: 'second log' },
    ])
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n# 🎉 发布 pkg-a' },
      issue: { number: 42, pull_request: {} },
    }

    await expect(issue_comment('token')).rejects.toThrow('duplicate package names')
    expect(mocks.cloneRepo).not.toHaveBeenCalled()
  })

  it('rejects unknown packages before changing files', async () => {
    const { extractReleaseLogs, getPullRequestReleaseDirs } = await import('../src/utils/common')
    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-unknown', version: '1.0.0', changelog: '## 🌈 1.0.0\n\n- feature\n\n' },
    ])
    vi.mocked(getPullRequestReleaseDirs).mockReturnValue([
      { dir: 'packages/pkg-a', name: 'pkg-a', private: false, version: '1.0.0', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
    ])
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-unknown\n\n## 🌈 1.0.0\n\n- feature' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/1.0.0' },
    })

    await expect(issue_comment('token')).rejects.toThrow('unknown packages: pkg-unknown')
    expect(mocks.exec).not.toHaveBeenCalledWith('git', expect.arrayContaining(['add']))
  })

  it('rejects release logs on a normal pull request', async () => {
    const { extractReleaseLogs } = await import('../src/utils/common')
    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '1.0.0', changelog: '## 🌈 1.0.0\n\n- feature\n\n' },
    ])
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n## 🌈 1.0.0\n\n- feature' },
      issue: { number: 42, pull_request: {} },
    }

    await expect(issue_comment('token')).rejects.toThrow('open, same-repository release pull request')
    expect(mocks.cloneRepo).not.toHaveBeenCalled()
  })

  it('rejects a release log version that differs from the manifest', async () => {
    const { extractReleaseLogs, getPullRequestReleaseDirs } = await import('../src/utils/common')
    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '9.0.0', changelog: '## 🌈 9.0.0\n\n- feature\n\n' },
    ])
    vi.mocked(getPullRequestReleaseDirs).mockReturnValue([
      { dir: 'packages/pkg-a', name: 'pkg-a', private: false, version: '1.0.0', oldVersion: '0.9.0', type: 'node', tag: 'latest', changelog: '' },
    ])
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n## 🌈 9.0.0\n\n- feature' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/1.0.0' },
    })

    await expect(issue_comment('token')).rejects.toThrow('version does not match')
  })

  it('rebases and retries a rejected push', async () => {
    const { extractReleaseLogs, getPullRequestReleaseDirs } = await import('../src/utils/common')
    vi.mocked(extractReleaseLogs).mockReturnValue([
      { pkgName: 'pkg-a', version: '1.0.0', changelog: '## 🌈 1.0.0\n\n- feature\n\n' },
    ])
    vi.mocked(getPullRequestReleaseDirs).mockReturnValue([
      { dir: 'packages/pkg-a', name: 'pkg-a', private: false, version: '1.0.0', oldVersion: '1.0.0', type: 'node', tag: 'latest', changelog: '' },
    ])
    let pushAttempts = 0
    mocks.exec.mockImplementation(async (_command, args) => {
      if (args?.[0] === 'push') {
        pushAttempts++
        return pushAttempts === 1 ? 1 : 0
      }
      return 0
    })
    mocks.isNeedCommit.mockResolvedValue(true)
    mocks.context.payload = {
      action: 'edited',
      changes: { body: { from: 'draft body' } },
      comment: { body: '# 🎉 发布 pkg-a\n\n## 🌈 1.0.0\n\n- feature' },
      issue: { number: 42, pull_request: {} },
    }
    mocks.getPullRequestData.mockResolvedValue({
      ...prData,
      head: { ...prData.head, ref: 'release/1.0.0' },
    })

    await issue_comment('token')

    expect(mocks.exec).toHaveBeenCalledTimes(8)
    expect(mocks.exec).toHaveBeenNthCalledWith(5, 'git', ['pull', '--rebase', 'origin', 'release/1.0.0'])
    expect(mocks.exec).toHaveBeenNthCalledWith(7, 'git', ['pull', '--rebase', 'origin', 'release/1.0.0'])
    expect(pushAttempts).toBe(2)
  })
})
