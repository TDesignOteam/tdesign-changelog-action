'use strict';

const fs = require('node:fs');
const process = require('node:process');
const core = require('@actions/core');
const github = require('@actions/github');
const dayjs = require('dayjs');
const rest = require('@octokit/rest');

function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

function _interopNamespaceCompat(e) {
  if (e && typeof e === 'object' && 'default' in e) return e;
  const n = Object.create(null);
  if (e) {
    for (const k in e) {
      n[k] = e[k];
    }
  }
  n.default = e;
  return n;
}

const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const process__default = /*#__PURE__*/_interopDefaultCompat(process);
const core__namespace = /*#__PURE__*/_interopNamespaceCompat(core);
const github__namespace = /*#__PURE__*/_interopNamespaceCompat(github);
const dayjs__default = /*#__PURE__*/_interopDefaultCompat(dayjs);

const skipchangelogLabel = ["skip-changelog"];
const fixLabel = ["fix", "bug", "hotfix"];
const breakingLabel = ["breaking", "breaking changes"];
const featureLabel = ["feature", "feat", "enhancement"];
const Renderer = {
  getPRformtNotes: (body) => {
    const reg = /in\shttps:\/\/github\.com\/.+\/pull\/(\d+)\s/g;
    const arr = [...body.matchAll(reg)];
    return arr.map((n) => Number(n[1]));
  },
  regToPrObj: (arr) => {
    return {
      cate: arr[1],
      component: arr[2],
      desc: arr[3]
    };
  },
  renderCate: (cate) => {
    return `${cate.sort().map((pr) => {
      const title = pr.changelog ? `\`${pr.changelog.component}\`: ${pr.changelog.desc}` : pr.title;
      return `- ${title} @${pr.user.login} ([#${pr.number}](${pr.html_url}))`;
    }).join("\n")}`;
  },
  renderMarkdown: (pullRequestList) => {
    const categories = {
      breaking: [],
      features: [],
      bugfix: [],
      extra: []
    };
    pullRequestList.forEach((pr) => {
      pr.body = pr.body ? pr.body : "";
      if (pr.labels.find((l) => skipchangelogLabel.includes(l.name))) {
        core__namespace.info(`pr ${pr.number} \u6709skipchangelogLabel`);
        return;
      }
      if (/\[x\] 本条 PR 不需要纳入 changelog/i.test(pr.body)) {
        core__namespace.info(`pr ${pr.number} \u663E\u793A\u4E0D\u9700\u8981\u7EB3\u5165 changelog`);
        return;
      }
      if (pr.body.includes("### \u{1F4DD} \u66F4\u65B0\u65E5\u5FD7")) {
        const reg = /-\s([A-Z]+)\(([A-Z]+)\):\s(.+)/gi;
        const arr = [...pr.body.matchAll(reg)];
        if (arr.length === 0) {
          core__namespace.info(`\u6CA1\u6709\u627E\u5230\u4EFB\u4F55\u4E00\u6761\u65E5\u5FD7\u5185\u5BB9 number:${pr.number}, body:${pr.body}`);
          categories.extra.push(pr);
          return;
        }
        arr.map((a) => Renderer.regToPrObj(a)).forEach((changelog) => {
          const logItem = {
            ...pr,
            changelog
          };
          function isInLabel(label) {
            return label.includes(changelog.cate) || arr.length === 1 && pr.labels.some((l) => label.includes(l.name));
          }
          if (isInLabel(breakingLabel)) {
            categories.breaking.push(logItem);
          } else if (isInLabel(featureLabel)) {
            categories.features.push(logItem);
          } else if (isInLabel(fixLabel)) {
            categories.bugfix.push(logItem);
          } else {
            categories.extra.push(logItem);
          }
        });
      } else {
        core__namespace.info(`pr ${pr.number} \u6CA1\u6709\u586B\u5199\u6A21\u7248`);
        categories.extra.push(pr);
      }
    });
    return [
      categories.breaking.length ? `### \u2757 Breaking Changes
${Renderer.renderCate(categories.breaking)}` : "",
      categories.features.length ? `### \u{1F680} Features
${Renderer.renderCate(categories.features)}` : "",
      categories.bugfix.length ? `### \u{1F41E} Bug Fixes
${Renderer.renderCate(categories.bugfix)}` : "",
      categories.extra.length ? `### \u{1F6A7} Others
${Renderer.renderCate(categories.extra)}` : ""
    ].filter((n) => n).join("\n");
  }
};

const context = github__namespace.context;
const GITHUB_TOKEN = process__default.env.GITHUB_TOKEN;
core__namespace.info(`github.context:${JSON.stringify(context)}`);
if (!GITHUB_TOKEN) {
  throw new Error(
    "GitHub's API requires a token. Please pass a valid token (GITHUB_TOKEN) as an env variable, no scopes are required."
  );
}
const octokit = new rest.Octokit({ auth: GITHUB_TOKEN });
async function generatorLogStart() {
  let tag = core__namespace.getInput("tag", { required: false });
  if (!tag) {
    const pkg = JSON.parse(fs__default.readFileSync("./package.json", "utf-8"));
    tag = pkg.version;
  }
  const { owner, repo } = context.repo;
  core__namespace.info(`owner:${owner}, repo:${repo}`);
  const releases = await octokit.rest.repos.generateReleaseNotes({
    owner,
    repo,
    tag_name: tag,
    // 'package.version'
    target_commitish: "develop"
    // 也可以从上下文中拿
  });
  const PRNumbers = Renderer.getPRformtNotes(releases.data.body);
  const PRListRes = await Promise.all(PRNumbers.map((pull_number) => octokit.rest.pulls.get({
    owner,
    repo,
    pull_number
  })));
  const PRList = PRListRes.map((res) => res.data);
  core__namespace.info(`PRList:${JSON.stringify(PRList)}`);
  const logRelease = `(\u5220\u9664\u6B64\u884C\u4EE3\u8868\u786E\u8BA4\u8BE5\u65E5\u5FD7): \u4FEE\u6539\u5E76\u786E\u8BA4\u65E5\u5FD7\u540E\u5220\u9664\u8FD9\u4E00\u884C\uFF0C\u673A\u5668\u4EBA\u4F1A\u63D0\u4EA4\u5230 \u672C PR \u7684 CHANGELOG.md \u6587\u4EF6\u4E2D
## \u{1F308} ${tag} \`${dayjs__default().format("YYYY-MM-DD")}\` 
${Renderer.renderMarkdown(PRList)}
`;
  core__namespace.info(logRelease);
  setActionOutput(logRelease);
  return logRelease;
}
generatorLogStart().catch((error) => {
  console.error(error);
  core__namespace.setFailed(`\u{1F4A5} Auto Release failed with error: ${error.message}`);
});
function setActionOutput(changelog) {
  core__namespace.setOutput("changelog", changelog);
}
