import { beforeEach, describe, expect, it, vi } from 'vitest'
import { buildPrompt, DEFAULT_BASE_URL, DEFAULT_MODEL, translateText } from '../src/utils/translate'

const mocks = vi.hoisted(() => ({ create: vi.fn() }))

vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: mocks.create } }
  },
}))

describe('translateText', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls the OpenAI-compatible translation API', async () => {
    mocks.create.mockResolvedValueOnce({ choices: [{ message: { content: ' translated text ' } }] })

    await expect(translateText('api-key', '你好')).resolves.toBe('translated text')
    expect(mocks.create).toHaveBeenCalledWith({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: buildPrompt('你好') }],
    })
  })

  it('supports custom API options', async () => {
    mocks.create.mockResolvedValueOnce({ choices: [{ message: { content: 'translated' } }] })

    await translateText('api-key', '你好', {
      baseURL: 'https://example.com/v1',
      model: 'custom-model',
      targetLang: 'English',
    })

    expect(mocks.create).toHaveBeenCalledWith({
      model: 'custom-model',
      messages: [{ role: 'user', content: buildPrompt('你好', 'English') }],
    })
  })

  it('propagates translation failures', async () => {
    mocks.create.mockRejectedValueOnce(new Error('service unavailable'))

    await expect(translateText('api-key', 'text')).rejects.toThrow('service unavailable')
  })

  it('throws when the translation result is empty', async () => {
    mocks.create.mockResolvedValueOnce({ choices: [{ message: { content: '' } }] })

    await expect(translateText('api-key', 'text')).rejects.toThrow('Translation result is empty')
  })

  it('uses the default API base URL', async () => {
    mocks.create.mockResolvedValueOnce({ choices: [{ message: { content: 'translated' } }] })

    await translateText('api-key', 'text')

    expect(DEFAULT_BASE_URL).toBe('https://tokenhub.tencentmaas.com/v1')
  })
})
