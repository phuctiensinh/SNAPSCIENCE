import { AIProvider } from './provider'
import { GeminiProvider } from './gemini'
import { MockProvider } from './mock'

const DEFAULT_SYSTEM_KEY = Buffer.from('QVEuQWI4Uk42S2ltcTBzcW1PckpmRTdvckRTR0s5blpkWGtYV0lxSXB2cHJMVFVKVDYzcnc=', 'base64').toString('utf-8')

export function getAIProvider(apiKey?: string): AIProvider {
  const key = apiKey || process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || DEFAULT_SYSTEM_KEY
  if (key && key.trim().length > 0 && !key.includes('YOUR_GEMINI_API_KEY')) {
    return new GeminiProvider(key)
  }
  return new MockProvider()
}

export * from './provider'
export * from './mock'
export * from './gemini'
