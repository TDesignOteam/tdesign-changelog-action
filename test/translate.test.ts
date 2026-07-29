import { describe, expect, it, vi } from 'vitest'
import { translateText } from '../src/utils/translate'

const mocks = vi.hoisted(() => ({ ChatTranslations: vi.fn() }))

vi.mock('tencentcloud-sdk-nodejs-hunyuan', () => ({
  hunyuan: {
    v20230901: {
      Client: class {
        ChatTranslations = mocks.ChatTranslations
      },
    },
  },
}))

describe('translateText', () => {
  it('propagates translation failures', async () => {
    mocks.ChatTranslations.mockRejectedValueOnce(new Error('service unavailable'))

    await expect(translateText('id', 'key', 'text')).rejects.toThrow('service unavailable')
  })
})
