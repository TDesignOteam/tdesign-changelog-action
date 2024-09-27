import { readFileSync } from 'node:fs'
import process from 'node:process'
import { getInput, info, setOutput } from '@actions/core'
import dayjs from 'dayjs'
import { getPullNumbers, renderMarkdown } from './renderer'
import type { PullsData } from './types'
import { useOctokit } from './useOctokit'

export async function generatorLogStart(context) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
  const { generateReleaseNotes, getPullRequest } = useOctokit({ token: GITHUB_TOKEN })
  let tag = getInput('tag', { required: false })
  if (!tag) {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'))
    tag = pkg.version
  }
  const { owner, repo } = context.repo
  info(`owner:${owner}, repo:${repo}`)

  const releases = await generateReleaseNotes(
    owner,
    repo,
    tag,
    'develop',
  )

  const PRNumbers = getPullNumbers(releases.data.body)

  const PRListRes = await Promise.all(PRNumbers.map(pull_number => getPullRequest(
    owner,
    repo,
    pull_number,
  )))

  const PRList = PRListRes.map(res => res.data as PullsData)

  info(`PRList:${JSON.stringify(PRList)}`)

  const logRelease = `(删除此行代表确认该日志): 修改并确认日志后删除这一行，机器人会提交到 本 PR 的 CHANGELOG.md 文件中
## 🌈 ${tag} \`${dayjs().format('YYYY-MM-DD')}\` \n${renderMarkdown(PRList)}\n`

  info(logRelease)

  setActionOutput(logRelease)
  return logRelease
}

function setActionOutput(changelog: string) {
  setOutput('changelog', changelog)
}
