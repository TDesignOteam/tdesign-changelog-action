import { context } from '@actions/github'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

describe('issue_comment', () => {
  beforeEach(() => {
    vi.spyOn(context, 'eventName', 'get').mockReturnValue('issue_comment')
  })
  afterEach(() => {
    vi.restoreAllMocks()
  })
  it('eventName', async () => {
    expect(context.eventName).toBe('issue_comment')
  })
})
