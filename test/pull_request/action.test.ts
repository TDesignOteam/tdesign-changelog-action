import { context } from '@actions/github'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { generatorLogStart } from '../../src/generator'

describe('pull_request-payload', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('opened', async () => {
    vi.spyOn(context.payload, 'action', 'get').mockReturnValue('opened')
    expect(context.payload.action).toEqual('opened')

    const log = await generatorLogStart(context)
    expect(log !== '').toBe(true)
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

    const log = await generatorLogStart(context)
    expect(log !== '').toBe(true)
  })

  it('synchronize', async () => {
    expect(context.payload.action).toEqual('synchronize')

    const log = await generatorLogStart(context)
    expect(log !== '').toBe(true)
  })
})
