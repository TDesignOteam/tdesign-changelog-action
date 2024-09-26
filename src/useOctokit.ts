import { getOctokit } from '@actions/github'

export interface OctokitContext {
  token: string
  owner?: string
  repo?: string
}
export function useOctokit(context: OctokitContext) {
  const octokit = getOctokit(context.token)

  const generateReleaseNotes = async (owner: string, repo: string, tag_name: string, target_commitish: string) => {
    const res = octokit.rest.repos.generateReleaseNotes({
      owner,
      repo,
      tag_name,
      target_commitish,
    })
    return res
  }

  const getPullRequest = (owner: string, repo: string, pull_number: number) => {
    const res = octokit.rest.pulls.get({
      owner,
      repo,
      pull_number,
    })
    return res
  }

  return {
    generateReleaseNotes,
    getPullRequest,
  }
}
