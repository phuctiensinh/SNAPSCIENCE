import { AIProvider } from './provider'
import { GeminiProvider } from './gemini'
import { MockProvider } from './mock'

export function getAIProvider(apiKey?: string): AIProvider {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (key && key.trim().length > 0 && !key.includes('YOUR_GEMINI_API_KEY')) {
    return new GeminiProvider(key)
  }
  return new MockProvider()
}

export * from './provider'
export * from './mock'
export * from './gemini'
