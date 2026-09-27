import { AIAnalysisResult } from '../types'

export interface AIProvider {
  analyzeImage(imageUri: string, options?: { prompt?: string }): Promise<AIAnalysisResult>
}
