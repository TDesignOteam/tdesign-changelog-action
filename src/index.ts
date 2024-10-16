import process from 'node:process'
import { info, setFailed } from '@actions/core'
import { context } from '@actions/github'
import { generatorLogStart } from './generator'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
info(`github.context:${JSON.stringify(context)}`)

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
