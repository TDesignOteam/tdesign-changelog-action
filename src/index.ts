import process from 'node:process'
import { endGroup, info, setFailed, startGroup } from '@actions/core'
import { context } from '@actions/github'
import { generatorLogStart } from './generator'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
startGroup(`[base] github.context`)
info(`context:${JSON.stringify(context)}`)
info(`eventName:${context.payload.eventName}`)
info(`action:${context.payload.action}`)
endGroup()

// console.log('payload', context.payload);

if (!GITHUB_TOKEN) {
  throw new Error(
    'GitHub\'s API requires a token. Please pass a valid token (GITHUB_TOKEN) as an env variable, no scopes are required.',
  )
}

generatorLogStart(context).catch((error) => {
  console.error(error)
  setFailed(`💥 Auto Release failed with error: ${error.message}`)
})
