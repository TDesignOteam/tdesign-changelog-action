import { info } from '@actions/core'
import type { PRChangelog, PullsData } from './types'

const skipChangelogLabel = ['skip-changelog']
const fixLabel = ['fix', 'bug', 'hotfix']
const breakingLabel = ['break', 'breaking', 'breaking changes']
const featureLabel = ['feature', 'feat', 'enhancement']
export const ChangelogReg = /-\s([A-Z]+)(?:\(([A-Z\s]*)\))?:\s(.+)/gi
export const PullNumberReg = /in\shttps:\/\/github\.com\/.+\/pull\/(\d+)\s/g
export function getPullNumbers(body: string) {
  const arr = [...body.matchAll(PullNumberReg)]

  return arr.map(n => Number(n[1])) // pr number list
}

function regToPrObj(arr: string[]) {
  return {
    cate: arr[1],
    component: arr[2],
    desc: arr[3],
  }
}
function renderCate(cate: PRChangelog[]) {
  return `${cate.sort().map((pr) => {
          const title = pr.changelog ? `\`${pr.changelog.component}\`: ${pr.changelog.desc}` : pr.title
          return `- ${title} @${pr.user.login} ([#${pr.number}](${pr.html_url}))`
      }).join('\n')}`
}

export function renderMarkdown(pullRequestList: PullsData[]) {
  // 分类靠标签
  // 标题看有没有更新日志
  const categories = {
    breaking: [] as PRChangelog[],
    features: [] as PRChangelog[],
    bugfix: [] as PRChangelog[],
    extra: [] as PRChangelog[],
  }

  pullRequestList.forEach((pr) => {
    pr.body = pr.body ? pr.body : ''

    // 不需要纳入 changelog 的 label
    if (pr.labels.find(l => skipChangelogLabel.includes(l.name))) {
      info(`pr ${pr.number} 有skipChangelogLabel`)
      return
    }
    // 在 pr body 明确填了 跳过 label
    if (/\[x\] 本条 PR 不需要纳入 changelog/i.test(pr.body)) {
      info(`pr ${pr.number} 显示不需要纳入 changelog`)
      return
    }

    if (pr.body.includes('### 📝 更新日志')) {
      const arr = [...pr.body.matchAll(ChangelogReg)]

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

  return [
    categories.breaking.length
      ? `### ❗ Breaking Changes
${renderCate(categories.breaking)}`
      : '',

    categories.features.length
      ? `### 🚀 Features
${renderCate(categories.features)}`
      : '',

    categories.bugfix.length
      ? `### 🐞 Bug Fixes
${renderCate(categories.bugfix)}`
      : '',

    categories.extra.length
      ? `### 🚧 Others
${renderCate(categories.extra)}`
      : '',
  ].filter(n => n).join('\n')
}
