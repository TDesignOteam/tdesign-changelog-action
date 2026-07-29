import { beforeEach, describe, expect, it, vi } from 'vitest'
import { workflow_run } from '../src/github-event/workflow-run'

const mocks = vi.hoisted(() => ({
  confirmChangelog: vi.fn(),
  context: {
    actor: 'maintainer',
    eventName: 'workflow_run',
    payload: {} as any,
  },
  extractChangelog: vi.fn(),
  getPullRequestData: vi.fn(),
  getPrCommentWhitelist: vi.fn(),
}))

vi.mock('node:fs', () => ({ existsSync: vi.fn().mockReturnValue(false), unlinkSync: vi.fn() }))
vi.mock('@actions/core', () => ({
  getInput: () => '42',
  info: vi.fn(),
  warning: vi.fn(),
}))
vi.mock('@actions/github', () => ({ context: mocks.context }))
vi.mock('../src/utils', () => ({
  extractChangelog: mocks.extractChangelog,
  getInputPkgs: () => ['pkg-a'],
  getPrCommentWhitelist: mocks.getPrCommentWhitelist,
}))
vi.mock('../src/utils/github', () => ({
  default: () => ({ getPullRequestData: mocks.getPullRequestData }),
}))
vi.mock('../src/github-event/issue-comment', () => ({ confirmChangelog: mocks.confirmChangelog }))

function workflowRunPayload() {
  return {
    conclusion: 'success',
    event: 'pull_request_review',
    status: 'completed',
    actor: { login: 'maintainer' },
    triggering_actor: { login: 'maintainer' },
    pull_requests: [{ number: 42 }],
  }
}

describe('workflow_run', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.context.eventName = 'workflow_run'
    mocks.context.payload = { workflow_run: workflowRunPayload() }
    mocks.getPrCommentWhitelist.mockResolvedValue(['maintainer'])
    mocks.getPullRequestData.mockResolvedValue({ body: 'body', head: { ref: 'feat/a' } })
    mocks.extractChangelog.mockReturnValue({ 'pkg-a': ['feat: add feature'] })
  })

  it('confirms a changelog for the associated pull request', async () => {
    await workflow_run('token')

    expect(mocks.getPullRequestData).toHaveBeenCalledWith(42)
    expect(mocks.confirmChangelog).toHaveBeenCalledWith(
      42,
      '### 📝 更新日志\n\n#### pkg-a\n- feat: add feature\n\n\n',
      'token',
    )
  })

  it('rejects a pull request not associated with the workflow run', async () => {
    mocks.context.payload.workflow_run.pull_requests = [{ number: 7 }]

    await expect(workflow_run('token')).resolves.toBe(false)
    expect(mocks.getPullRequestData).not.toHaveBeenCalled()
  })

  it('rejects a rerun triggered by another actor', async () => {
    mocks.context.payload.workflow_run.triggering_actor = { login: 'collaborator' }

    await expect(workflow_run('token')).resolves.toBe(false)
    expect(mocks.getPrCommentWhitelist).not.toHaveBeenCalled()
    expect(mocks.getPullRequestData).not.toHaveBeenCalled()
  })
})
