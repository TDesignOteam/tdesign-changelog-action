import type { RestEndpointMethodTypes } from '@octokit/plugin-rest-endpoint-methods'

export type Pulls = RestEndpointMethodTypes['pulls']['get']['response']
export type PullsData = Pulls['data']
