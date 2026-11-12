import type { PullRequestData } from '../types'
import { existsSync, unlinkSync } from 'node:fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import { extractChangelog, getInputPkgs, getPrCommentWhitelist } from '../utils'
import useGithub from '../utils/github'
import { confirmChangelog } from './issue-comment'

export async function workflow_run(token: string) {
  if (github.context.eventName !== 'workflow_run') {
    return false
  }
  const workflowRun = github.context.payload.workflow_run
  if (workflowRun?.event !== 'pull_request_review') {
    core.warning(`github.context.payload.workflow_run?.event !== 'pull_request_review'`)
    return false
  }
  if (github.context.payload.workflow_run?.status !== 'completed') {
    core.warning(`github.context.payload.workflow_run?.status !== 'completed'`)
    return false
  }
  if (github.context.payload.workflow_run?.conclusion !== 'success') {
    core.warning(`github.context.payload.workflow_run?.conclusion !== 'success'`)
    return false
  }
  const prNumber = Number(core.getInput('pr_number', { required: true }))
  if (!Number.isInteger(prNumber) || prNumber <= 0) {
    core.warning(`invalid pr_number: ${prNumber}`)
    return false
  }
  const actor = workflowRun.actor?.login || github.context.actor
  const triggeringActor = workflowRun.triggering_actor?.login || github.context.actor
  if (actor !== triggeringActor) {
    core.warning(`workflow rerun actor does not match original actor: ${triggeringActor}`)
    return false
  }
  const whitelist = await getPrCommentWhitelist()
  if (!whitelist.includes(actor)) {
    core.warning(`no in whitelist:${actor}`)
    return false
  }

  const { getPullRequestData } = useGithub(token)
  const pullRequestData = await getPullRequestData(prNumber) as PullRequestData
  // workflow_run.pull_requests 对 fork PR 恒为空数组,pull_request_review 触发时也经常不填充,
  // 无法仅凭该数组判断 pr_number 是否属于本次运行;此时补充 head_sha 关联校验
  const isListedPr = (workflowRun.pull_requests || []).some((pr: { number: number }) => pr.number === prNumber)
  if (!isListedPr && pullRequestData.head?.sha !== workflowRun.head_sha) {
    core.warning(`pr_number is not associated with this workflow run: ${prNumber} (pr head: ${pullRequestData.head?.sha || 'unknown'}, run head_sha: ${workflowRun.head_sha || 'unknown'})`)
    return false
  }
  const isRelease = pullRequestData.head.ref.startsWith('release/')
  if (isRelease) {
    return false
  }
  let logs = ''
  const prLog = extractChangelog(pullRequestData.body || '', getInputPkgs())
  core.info(`pr_log: ${JSON.stringify(prLog, null, 2)}`)
  Object.keys(prLog).forEach((pkgName) => {
    if (!prLog[pkgName].length) {
      return
    }
    logs += `#### ${pkgName}\n`
    prLog[pkgName].forEach((log) => {
      logs += `- ${log}\n`
    },
    )
  })
  if (logs) {
    const body = `### 📝 更新日志\n\n${logs}\n\n`
    if (existsSync('./pr-id.txt'))
      unlinkSync('./pr-id.txt')
    await confirmChangelog(prNumber, body, token)
  }
}
