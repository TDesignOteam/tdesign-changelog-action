import { describe, expect, it, vi } from 'vitest'
import { context } from '@actions/github'
import { generatorLogStart } from '../src/generator'

describe('generatorLog', () => {
  it(': generatorLogStart', async () => {
    const mockDate = new Date(2024, 1, 24)
    vi.setSystemTime(mockDate)
    const log = await generatorLogStart(context)
    expect(log).toMatchSnapshot()
    vi.useRealTimers()
  })
})
