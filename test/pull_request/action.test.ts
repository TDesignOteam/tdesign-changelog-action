import { context } from '@actions/github'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generatorLogStart } from '../../src/generator'

describe('pull_request-payload', () => {
  beforeEach(() => {
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('opened', async () => {
    vi.spyOn(context.payload, 'action', 'get').mockReturnValue('opened')

    expect(context.payload.action).toEqual('opened')
  })
  it('closed', async () => {
    vi.spyOn(context.payload, 'action', 'get').mockReturnValue('closed')
    expect(context.payload.action).toEqual('closed')
    const log = await generatorLogStart(context)
    expect(log).toEqual('')
  })

  it('reopened', async () => {
    vi.spyOn(context.payload, 'action', 'get').mockReturnValue('reopened')

    expect(context.payload.action).toEqual('reopened')
  })

  it('synchronize', async () => {
    expect(context.payload.action).toEqual('synchronize')
  })
})
