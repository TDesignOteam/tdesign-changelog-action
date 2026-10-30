import OpenAI from 'openai'

export const DEFAULT_BASE_URL = 'https://tokenhub.tencentmaas.com/v1'
export const DEFAULT_MODEL = 'hy-mt2-plus'
export const DEFAULT_TARGET_LANG = '英语'
export const DEFAULT_PROMPT_TEMPLATE = '将以下文本翻译为 {targetLang}，注意只需要输出翻译后的结果，不要额外解释：\n{sourceText}'

export interface TranslateOptions {
  baseURL?: string
  model?: string
  targetLang?: string
}

export function buildPrompt(text: string, targetLang = DEFAULT_TARGET_LANG): string {
  return DEFAULT_PROMPT_TEMPLATE
    .replaceAll('{targetLang}', targetLang)
    .replaceAll('{sourceText}', text)
}

export async function translateText(apiKey: string, text: string, options: TranslateOptions = {}) {
  const client = new OpenAI({
    apiKey,
    baseURL: options.baseURL || DEFAULT_BASE_URL,
  })

  const response = await client.chat.completions.create({
    model: options.model || DEFAULT_MODEL,
    messages: [{ role: 'user', content: buildPrompt(text, options.targetLang) }],
  })

  const translatedText = response.choices[0]?.message?.content?.trim()
  if (!translatedText)
    throw new Error('Translation result is empty')

  return translatedText
}
