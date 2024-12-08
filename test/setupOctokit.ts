import { vi } from 'vitest'
import changelog from './fixtures/changelog'
import { releaseNote } from './fixtures/release-notes'

const releaseNotesData = {
  status: 200,
  url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/releases/generate-notes',
  data: { name: 'mock-tag-name', body: releaseNote },
}
const pullRequestData = {
  data: {
    url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/29',
    id: 2006134041,
    node_id: 'PR_kwDOMC-CYM53ky0Z',
    html_url: 'https://github.com/TDesignOteam/tdesign-changelog-action/pull/29',
    diff_url: 'https://github.com/TDesignOteam/tdesign-changelog-action/pull/29.diff',
    patch_url: 'https://github.com/TDesignOteam/tdesign-changelog-action/pull/29.patch',
    issue_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues/29',
    number: 29,
    state: 'closed',
    locked: false,
    title: 'chore: ci enhance',
    user: {
      login: 'liweijie0812',
      id: 10710889,
      node_id: 'MDQ6VXNlcjEwNzEwODg5',
      avatar_url: 'https://avatars.githubusercontent.com/u/10710889?v=4',
      gravatar_id: '',
      url: 'https://api.github.com/users/liweijie0812',
      html_url: 'https://github.com/liweijie0812',
      followers_url: 'https://api.github.com/users/liweijie0812/followers',
      following_url: 'https://api.github.com/users/liweijie0812/following{/other_user}',
      gists_url: 'https://api.github.com/users/liweijie0812/gists{/gist_id}',
      starred_url: 'https://api.github.com/users/liweijie0812/starred{/owner}{/repo}',
      subscriptions_url: 'https://api.github.com/users/liweijie0812/subscriptions',
      organizations_url: 'https://api.github.com/users/liweijie0812/orgs',
      repos_url: 'https://api.github.com/users/liweijie0812/repos',
      events_url: 'https://api.github.com/users/liweijie0812/events{/privacy}',
      received_events_url: 'https://api.github.com/users/liweijie0812/received_events',
      type: 'User',
      site_admin: false,
    },
    body: `### 📝 更新日志\n\n ${changelog}`,
    created_at: '2024-08-06T13:48:12Z',
    updated_at: '2024-08-07T01:14:21Z',
    closed_at: '2024-08-07T01:14:20Z',
    merged_at: '2024-08-07T01:14:19Z',
    merge_commit_sha: '5028ec67c707af0a2f99377fe444af3a9598edd4',
    assignee: null,
    assignees: [],
    requested_reviewers: [
      {
        login: 'uyarn',
        id: 26377630,
        node_id: 'MDQ6VXNlcjI2Mzc3NjMw',
        avatar_url: 'https://avatars.githubusercontent.com/u/26377630?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/uyarn',
        html_url: 'https://github.com/uyarn',
        followers_url: 'https://api.github.com/users/uyarn/followers',
        following_url: 'https://api.github.com/users/uyarn/following{/other_user}',
        gists_url: 'https://api.github.com/users/uyarn/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/uyarn/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/uyarn/subscriptions',
        organizations_url: 'https://api.github.com/users/uyarn/orgs',
        repos_url: 'https://api.github.com/users/uyarn/repos',
        events_url: 'https://api.github.com/users/uyarn/events{/privacy}',
        received_events_url: 'https://api.github.com/users/uyarn/received_events',
        type: 'User',
        site_admin: false,
      },
    ],
    requested_teams: [],
    labels: [],
    milestone: null,
    draft: false,
    commits_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/29/commits',
    review_comments_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/29/comments',
    review_comment_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/comments{/number}',
    comments_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues/29/comments',
    statuses_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/statuses/38a9e5522ab653e01758837bfc12b26e2a8f5a0e',
    head: {
      label: 'TDesignOteam:chore/vitest',
      ref: 'chore/vitest',
      sha: '38a9e5522ab653e01758837bfc12b26e2a8f5a0e',
      user: {
        login: 'TDesignOteam',
        id: 39033385,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjM5MDMzMzg1',
        avatar_url: 'https://avatars.githubusercontent.com/u/39033385?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/TDesignOteam',
        html_url: 'https://github.com/TDesignOteam',
        followers_url: 'https://api.github.com/users/TDesignOteam/followers',
        following_url: 'https://api.github.com/users/TDesignOteam/following{/other_user}',
        gists_url: 'https://api.github.com/users/TDesignOteam/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/TDesignOteam/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/TDesignOteam/subscriptions',
        organizations_url: 'https://api.github.com/users/TDesignOteam/orgs',
        repos_url: 'https://api.github.com/users/TDesignOteam/repos',
        events_url: 'https://api.github.com/users/TDesignOteam/events{/privacy}',
        received_events_url: 'https://api.github.com/users/TDesignOteam/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 808419936,
        node_id: 'R_kgDOMC-CYA',
        name: 'tdesign-changelog-action',
        full_name: 'TDesignOteam/tdesign-changelog-action',
        private: false,
        owner: {
          login: 'TDesignOteam',
          id: 39033385,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjM5MDMzMzg1',
          avatar_url: 'https://avatars.githubusercontent.com/u/39033385?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/TDesignOteam',
          html_url: 'https://github.com/TDesignOteam',
          followers_url: 'https://api.github.com/users/TDesignOteam/followers',
          following_url: 'https://api.github.com/users/TDesignOteam/following{/other_user}',
          gists_url: 'https://api.github.com/users/TDesignOteam/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/TDesignOteam/starred{/owner}{/repo}',
          subscriptions_url: 'https://api.github.com/users/TDesignOteam/subscriptions',
          organizations_url: 'https://api.github.com/users/TDesignOteam/orgs',
          repos_url: 'https://api.github.com/users/TDesignOteam/repos',
          events_url: 'https://api.github.com/users/TDesignOteam/events{/privacy}',
          received_events_url: 'https://api.github.com/users/TDesignOteam/received_events',
          type: 'Organization',
          site_admin: false,
        },
        html_url: 'https://github.com/TDesignOteam/tdesign-changelog-action',
        description: null,
        fork: false,
        url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action',
        forks_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/forks',
        keys_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/keys{/key_id}',
        collaborators_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/collaborators{/collaborator}',
        teams_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/teams',
        hooks_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/hooks',
        issue_events_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues/events{/number}',
        events_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/events',
        assignees_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/assignees{/user}',
        branches_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/branches{/branch}',
        tags_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/tags',
        blobs_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/git/blobs{/sha}',
        git_tags_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/git/tags{/sha}',
        git_refs_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/git/refs{/sha}',
        trees_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/git/trees{/sha}',
        statuses_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/statuses/{sha}',
        languages_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/languages',
        stargazers_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/stargazers',
        contributors_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/contributors',
        subscribers_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/subscribers',
        subscription_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/subscription',
        commits_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/commits{/sha}',
        git_commits_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/git/commits{/sha}',
        comments_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/comments{/number}',
        issue_comment_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues/comments{/number}',
        contents_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/contents/{+path}',
        compare_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/compare/{base}...{head}',
        merges_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/merges',
        archive_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/{archive_format}{/ref}',
        downloads_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/downloads',
        issues_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues{/number}',
        pulls_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls{/number}',
        milestones_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/milestones{/number}',
        notifications_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/notifications{?since,all,participating}',
        labels_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/labels{/name}',
        releases_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/releases{/id}',
        deployments_url: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/deployments',
        created_at: '2024-05-31T03:18:52Z',
        updated_at: '2024-08-13T01:15:57Z',
        pushed_at: '2024-08-13T08:29:00Z',
        git_url: 'git://github.com/TDesignOteam/tdesign-changelog-action.git',
        ssh_url: 'git@github.com:TDesignOteam/tdesign-changelog-action.git',
        clone_url: 'https://github.com/TDesignOteam/tdesign-changelog-action.git',
        svn_url: 'https://github.com/TDesignOteam/tdesign-changelog-action',
        homepage: null,
        size: 584,
        stargazers_count: 0,
        watchers_count: 0,
        language: 'TypeScript',
        has_issues: true,
        has_projects: true,
        has_downloads: true,
        has_wiki: true,
        has_pages: false,
        has_discussions: false,
        forks_count: 1,
        mirror_url: null,
        archived: false,
        disabled: false,
        open_issues_count: 5,
        license: {
          key: 'mit',
          name: 'MIT License',
          spdx_id: 'MIT',
          url: 'https://api.github.com/licenses/mit',
          node_id: 'MDc6TGljZW5zZTEz',
        },
        allow_forking: true,
        is_template: false,
        web_commit_signoff_required: false,
        topics: [],
        visibility: 'public',
        forks: 1,
        open_issues: 5,
        watchers: 0,
        default_branch: 'develop',
      },
    },
    base: {
      label: 'TDesignOteam:develop',
      ref: 'develop',
      sha: '60cf90e0ae1224eb1b6bb3ae2eca2ca4997c7bc1',
      user: {
        login: 'TDesignOteam',
        id: 39033385,
        node_id: 'MDEyOk9yZ2FuaXphdGlvbjM5MDMzMzg1',
        avatar_url: 'https://avatars.githubusercontent.com/u/39033385?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/TDesignOteam',
        html_url: 'https://github.com/TDesignOteam',
        followers_url: 'https://api.github.com/users/TDesignOteam/followers',
        following_url: 'https://api.github.com/users/TDesignOteam/following{/other_user}',
        gists_url: 'https://api.github.com/users/TDesignOteam/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/TDesignOteam/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/TDesignOteam/subscriptions',
        organizations_url: 'https://api.github.com/users/TDesignOteam/orgs',
        repos_url: 'https://api.github.com/users/TDesignOteam/repos',
        events_url: 'https://api.github.com/users/TDesignOteam/events{/privacy}',
        received_events_url: 'https://api.github.com/users/TDesignOteam/received_events',
        type: 'Organization',
        site_admin: false,
      },
      repo: {
        id: 808419936,
        node_id: 'R_kgDOMC-CYA',
        name: 'tdesign-changelog-action',
        full_name: 'TDesignOteam/tdesign-changelog-action',
        private: false,
        owner: {
          login: 'TDesignOteam',
          id: 39033385,
          node_id: 'MDEyOk9yZ2FuaXphdGlvbjM5MDMzMzg1',
          avatar_url: 'https://avatars.githubusercontent.com/u/39033385?v=4',
          gravatar_id: '',
          url: 'https://api.github.com/users/TDesignOteam',
          html_url: 'https://github.com/TDesignOteam',
          followers_url: 'https://api.github.com/users/TDesignOteam/followers',
          following_url: 'https://api.github.com/users/TDesignOteam/following{/other_user}',
          gists_url: 'https://api.github.com/users/TDesignOteam/gists{/gist_id}',
          starred_url: 'https://api.github.com/users/TDesignOteam/starred{/owner}{/repo}',
          href: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/issues/29/comments',
        },
        review_comments: {
          href: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/29/comments',
        },
        review_comment: {
          href: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/comments{/number}',
        },
        commits: {
          href: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/pulls/29/commits',
        },
        statuses: {
          href: 'https://api.github.com/repos/TDesignOteam/tdesign-changelog-action/statuses/38a9e5522ab653e01758837bfc12b26e2a8f5a0e',
        },
      },
      author_association: 'MEMBER',
      auto_merge: null,
      active_lock_reason: null,
      merged: true,
      mergeable: null,
      rebaseable: null,
      mergeable_state: 'unknown',
      merged_by: {
        login: 'liweijie0812',
        id: 10710889,
        node_id: 'MDQ6VXNlcjEwNzEwODg5',
        avatar_url: 'https://avatars.githubusercontent.com/u/10710889?v=4',
        gravatar_id: '',
        url: 'https://api.github.com/users/liweijie0812',
        html_url: 'https://github.com/liweijie0812',
        followers_url: 'https://api.github.com/users/liweijie0812/followers',
        following_url: 'https://api.github.com/users/liweijie0812/following{/other_user}',
        gists_url: 'https://api.github.com/users/liweijie0812/gists{/gist_id}',
        starred_url: 'https://api.github.com/users/liweijie0812/starred{/owner}{/repo}',
        subscriptions_url: 'https://api.github.com/users/liweijie0812/subscriptions',
        organizations_url: 'https://api.github.com/users/liweijie0812/orgs',
        repos_url: 'https://api.github.com/users/liweijie0812/repos',
        events_url: 'https://api.github.com/users/liweijie0812/events{/privacy}',
        received_events_url: 'https://api.github.com/users/liweijie0812/received_events',
        type: 'User',
        site_admin: false,
      },
      comments: 1,
      review_comments: 0,
      maintainer_can_modify: false,
      commits: 15,
      additions: 1152,
      deletions: 340,
      changed_files: 15,
    },
  },
}
vi.mock('../src/useOctokit', () => {
  return {
    useOctokit: () => ({
      generateReleaseNotes: () => Promise.resolve(releaseNotesData),
      getPullRequest: () => Promise.resolve(pullRequestData),
    }),
  }
})
