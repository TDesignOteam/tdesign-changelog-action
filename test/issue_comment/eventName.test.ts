import { context } from '@actions/github'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { generatorLogStart } from '../../src/generator'

describe('issue_comment', () => {
  beforeEach(() => {
    vi.spyOn(context, 'eventName', 'get').mockReturnValue('issue_comment')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('eventName', async () => {
    expect(context.eventName).toEqual('issue_comment')
    const log = await generatorLogStart(context)
    expect(log).toEqual('')
  })
})
