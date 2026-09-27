import { NextResponse } from 'next/server'
import { getAIProvider, MockProvider } from '@/lib/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { imageUri, prompt, isDemo, userApiKey } = body

    if (!imageUri || typeof imageUri !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Dữ liệu hình ảnh không hợp lệ hoặc bị thiếu.' },
        { status: 400 }
      )
    }

    const apiKey = (userApiKey && typeof userApiKey === 'string' && userApiKey.trim().length > 10)
      ? userApiKey.trim()
      : (process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY)

    const isExplicitDemo = Boolean(isDemo)
    const hasValidKeyFormat = Boolean(apiKey && !apiKey.includes('YOUR_GEMINI_API_KEY') && apiKey.trim().length > 10)

    // If explicit demo requested OR no API key format is present -> run MockProvider
    if (isExplicitDemo || !hasValidKeyFormat) {
      const mockProvider = new MockProvider()
      const result = await mockProvider.analyzeImage(imageUri, { prompt })
      return NextResponse.json({
        success: true,
        isDemo: true,
        data: result
      })
    }

    // User provided a key / server has key -> attempt real Gemini Vision
    try {
      const provider = getAIProvider(apiKey)
      const result = await provider.analyzeImage(imageUri, { prompt })
      return NextResponse.json({
        success: true,
        isDemo: false,
        data: result
      })
    } catch (aiErr: any) {
      console.error('Gemini Vision API Error:', aiErr.message)
      // Return explicit error so client knows WHY real Gemini AI Vision failed
      return NextResponse.json({
        success: false,
        isDemo: false,
        error: aiErr.message || 'Lỗi phân tích Gemini AI Vision.',
        apiErrorMessage: aiErr.message
      }, { status: 400 })
    }
  } catch (err: any) {
    console.error('Error in /api/analyze:', err)
    return NextResponse.json(
      { success: false, error: err.message || 'Xảy ra lỗi hệ thống khi xử lý phân tích.' },
      { status: 500 }
    )
  }
}
