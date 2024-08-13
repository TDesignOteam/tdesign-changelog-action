import fs from 'node:fs'
import process from 'node:process'
import { endGroup, getInput, info, setFailed, setOutput, startGroup } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import dayjs from 'dayjs'
import { getPReformatNotes, renderMarkdown } from './renderer'
import type { PullsData } from './types'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
startGroup('github.context')
info(`github.context:${JSON.stringify(context, null, 4)}`)
endGroup()

// console.log('payload', context.payload);

if (!GITHUB_TOKEN) {
  throw new Error(
    'GitHub\'s API requires a token. Please pass a valid token (GITHUB_TOKEN) as an env variable, no scopes are required.',
  )
}

const octokit = getOctokit(GITHUB_TOKEN)

async function generatorLogStart() {
  let tag = getInput('tag', { required: false })
  if (!tag) {
    const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
    tag = pkg.version
  }
  const { owner, repo } = context.repo
  info(`owner:${owner}, repo:${repo}`)
  // https://octokit.github.io/rest.js/v20#repos-generate-release-notes
  const releaseNodes = await octokit.rest.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: tag, // 'package.version'
    target_commitish: 'develop', // 也可以从上下文中拿
  })
  startGroup('releaseNodes')
  info(`releaseNodes:${JSON.stringify(releaseNodes, null, 4)}`)
  endGroup()
  const PRNumbers = getPReformatNotes(releaseNodes.data.body)

  const PRListRes = await Promise.all(PRNumbers.map(pull_number => octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  })))

  const PRList = PRListRes.map(res => res.data as PullsData)
  startGroup('PRList')
  info(`PRList:${JSON.stringify(PRList, null, 4)}`)
  endGroup()

  const logRelease = `(删除此行代表确认该日志): 修改并确认日志后删除这一行，机器人会提交到 本 PR 的 CHANGELOG.md 文件中
## 🌈 ${tag} \`${dayjs().format('YYYY-MM-DD')}\` \n${renderMarkdown(PRList)}\n`

  info(logRelease)

  setActionOutput(logRelease)
  return logRelease
}

generatorLogStart().catch((error) => {
  console.error(error)
  setFailed(`💥 Auto Release failed with error: ${error.message}`)
})

function setActionOutput(changelog: string) {
  setOutput('changelog', changelog)
}
