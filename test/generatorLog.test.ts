import { context } from '@actions/github'
import { describe, expect, it, vi } from 'vitest'
import { generatorLogStart } from '../src/generator'

vi.mock('node:fs', async () => {
  return {
    ...(await vi.importActual<typeof import('node:fs')>('node:fs')),
    readFileSync: vi.fn().mockReturnValue(`{ "version": "x.x.x" }`),
  }
})

describe('generatorLog', () => {
  it(': generatorLogStart', async () => {
    const mockDate = new Date(2024, 1, 24)
    vi.setSystemTime(mockDate)
    const log = await generatorLogStart(context)
    expect(log).toMatchSnapshot()
    vi.useRealTimers()
  })
})
