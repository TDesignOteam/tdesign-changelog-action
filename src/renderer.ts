import type { PRChangelog, PullsData } from './types'
import { endGroup, info, startGroup } from '@actions/core'

const skipChangelogLabel = ['skip-changelog']
const fixLabel = ['fix', 'bug', 'hotfix']
const breakingLabel = ['break', 'breaking', 'breaking changes']
const featureLabel = ['feature', 'feat', 'enhancement']
const docsLabel = ['docs', 'doc', 'documentation']
const refactorLabel = ['pref', 'refactor']
const noticeLabel = ['notice', 'new component']

export const CHANGELOG_REG = /-\s([A-Z]+)(?:\(([A-Z\s_-]*)\))?\s*:\s(.+)/gi
export const PULL_NUMBER_REG = /in\shttps:\/\/github\.com\/.+\/pull\/(\d+)/g
export const SKIP_CHANGELOG_REG = /\[x\] 本条 PR 不需要纳入 Changelog/i
export function getPullNumbers(body: string) {
  const arr = [...body.matchAll(PULL_NUMBER_REG)]
  const pullNumbers = arr.map(n => Number(n[1])) // pr number list
  const uniquePullNumbers = [...new Set(pullNumbers)]
  return uniquePullNumbers
}

function regToPrObj(arr: string[]) {
  return {
    cate: arr[1],
    component: arr[2] || '',
    desc: arr[3],
  }
}
function renderCate(cate: PRChangelog[]) {
  return `${cate.sort().map((pr) => {
    const title = pr.changelog ? `\`${pr.changelog.component || pr.changelog.cate}\`: ${pr.changelog.desc}` : pr.title
    const contributor = pr.user.login === 'tdesign-bot' ? '' : ` @${pr.user.login} `
    return `- ${title}${contributor}([#${pr.number}](${pr.html_url}))`
  }).join('\n')}`
}

export function renderMarkdown(pullRequestList: PullsData[]) {
  // 分类靠标签
  // 标题看有没有更新日志
  const categories = {
    breaking: [] as PRChangelog[],
    features: [] as PRChangelog[],
    bugfix: [] as PRChangelog[],
    refactor: [] as PRChangelog[],
    docs: [] as PRChangelog[],
    notices: [] as PRChangelog[],
    extra: [] as PRChangelog[],
  }
  startGroup(`[renderer] pullRequestList`)
  pullRequestList.forEach((pr) => {
    pr.body = pr.body ? pr.body : ''
    // pr 用户类型是 Bot 不纳入 Changelog
    if (pr.user.type === 'Bot') {
      info(`pr ${pr.number} 用户类型是 Bot 不纳入 Changelog`)
      return
    }
    // 不需要纳入 changelog 的 label
    if (pr.labels.find(l => skipChangelogLabel.includes(l.name))) {
      info(`pr ${pr.number} 有skipChangelogLabel`)
      return
    }
    // 在 pr body 明确填了 跳过 label
    if (SKIP_CHANGELOG_REG.test(pr.body)) {
      info(`pr ${pr.number} 显示不需要纳入 Changelog`)
      return
    }

    if (pr.body.includes('### 📝 更新日志')) {
      const arr = [...pr.body.matchAll(CHANGELOG_REG)]

      if (arr.length === 0) {
        info(`没有找到任何一条日志内容 number:${pr.number}, body:${pr.body}`)
        categories.extra.push(pr)
        return
      }

      arr.map(a => regToPrObj(a)).forEach((changelog) => {
        const logItem = {
          ...pr,
          changelog,
        }

        function isInLabel(label: string[]) {
          return label.includes(changelog.cate) || (arr.length === 1 && pr.labels.some(l => label.includes(l.name)))
        }

        if (isInLabel(breakingLabel)) {
          categories.breaking.push(logItem)
        }
        else if (isInLabel(featureLabel)) {
          categories.features.push(logItem)
        }
        else if (isInLabel(fixLabel)) {
          categories.bugfix.push(logItem)
        }
        else if (isInLabel(refactorLabel)) {
          categories.refactor.push(logItem)
        }
        else if (isInLabel(docsLabel)) {
          categories.docs.push(logItem)
        }
        else if (isInLabel(noticeLabel)) {
          categories.notices.push(logItem)
        }
        else {
          categories.extra.push(logItem)
        }
      })
    }
    else {
      // 说明开发者没有按模版填写 pr，默认取 title
      info(`pr ${pr.number} 没有填写模版`)
      categories.extra.push(pr) // ??
    }
  })
  endGroup()

  return [
    categories.notices.length ? `### 🎉 Notices\n${renderCate(categories.notices)}` : '',
    categories.breaking.length ? `### 🚨 Breaking Changes\n${renderCate(categories.breaking)}` : '',
    categories.features.length ? `### 🚀 Features\n${renderCate(categories.features)}` : '',
    categories.bugfix.length ? `### 🐞 Bug Fixes\n${renderCate(categories.bugfix)}` : '',
    categories.refactor.length ? `### 📈 Performance\n${renderCate(categories.refactor)}` : '',
    categories.docs.length ? `### 📝 Documentation\n${renderCate(categories.docs)}` : '',
    categories.extra.length ? `### 🚧 Others\n${renderCate(categories.extra)}` : '',
  ].filter(n => n).join('\n')
}
