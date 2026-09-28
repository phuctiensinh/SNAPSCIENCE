import { AIProvider } from './provider'
import { AIAnalysisResult } from '../types'

export async function validateGeminiApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'Gemini API Key quá ngắn hoặc rỗng.' }
  }
  try {
    const key = apiKey.trim()
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`)
    if (res.ok) {
      const data = await res.json()
      const models: any[] = data.models || []
      const generateModels = models.filter((m: any) =>
        m.supportedGenerationMethods?.includes('generateContent')
      )
      if (generateModels.length > 0) {
        return { valid: true }
      }
      return { valid: false, error: 'API Key không có quyền truy cập mô hình generateContent.' }
    }
    const errData = await res.json().catch(() => ({}))
    const msg = errData?.error?.message || `Lỗi HTTP ${res.status}`
    return { valid: false, error: msg }
  } catch (err: any) {
    return { valid: false, error: err.message || 'Không thể kết nối đến máy chủ Google Gemini.' }
  }
}

export class GeminiProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim()
  }

  async analyzeImage(imageUri: string, options?: { prompt?: string }): Promise<AIAnalysisResult> {
    const systemPrompt = `Bạn là chuyên gia giáo dục khoa học SnapScience dành cho học sinh & người yêu khoa học.
Nhiệm vụ của bạn là quan sát ẢNH THẬT ĐƯỢC CHỤP, nhận diện CHÍNH XÁC VẬT THỂ TRONG ẢNH (Ví dụ: Con chuột máy tính / Đèn học / Quạt máy / Bàn phím / Điện thoại / Cốc nước / Cây cảnh / ...) và phân tích các nguyên lý khoa học phía sau theo định dạng JSON CHUẨN XÁC.

BẮT BUỘC trả về đúng cấu trúc JSON sau (Việt hóa 100%):
{
  "id": "res_unique_id",
  "objectName": "Tên vật thể thật trong ảnh (Ví dụ: Con chuột máy tính / Đèn học / Quạt máy / Điện thoại / ...)",
  "category": "Một trong các danh mục: 'Cơ học' | 'Quang học' | 'Điện học' | 'Sinh học' | 'Nhiệt học' | 'Toán học' | 'Hóa học' | 'Khoa học chung'",
  "confidence": 0.95,
  "summary": "Tóm tắt ngắn gọn 1-2 câu về vật thể trong ảnh và ý nghĩa khoa học của nó",
  "scientificTopics": ["Chủ đề 1", "Chủ đề 2", "Chủ đề 3"],
  "lesson": {
    "howItWorks": "Giải thích chi tiết vật thể này hoạt động thế nào",
    "whyItWorks": "Giải thích nguyên lý bản chất tại sao lại như vậy",
    "whereItAppears": "Nơi vật thể/nguyên lý này xuất hiện trong đời sống",
    "interestingFact": "Sự thật thú vị / Đố bạn biết về vật thể này",
    "mathBehind": "Công thức hoặc nguyên lý toán học liên quan",
    "physicsBehind": "Nguyên lý vật lý / sinh học / điện tử chuyên sâu",
    "levelExplanations": {
      "basic": "Giải thích cấp độ Cơ bản (dễ hiểu cho học sinh tiểu học)",
      "intermediate": "Giải thích cấp độ Trung học (có công thức và khái niệm cơ bản)",
      "advanced": "Giải thích cấp độ Nâng cao (chuyên sâu, bản chất vật lý/điện tử)"
    }
  },
  "calculator": {
    "type": "generic",
    "title": "Công cụ tính toán khoa học",
    "description": "Mô tả công cụ",
    "inputs": [
      { "id": "var1", "label": "Thông số 1", "unit": "Đơn vị", "defaultValue": 10, "min": 1, "max": 100 }
    ]
  },
  "experiment": {
    "title": "Thử nghiệm tương tác mini",
    "description": "Mô tả thử nghiệm",
    "variables": [
      { "name": "var1", "label": "Nhãn biến", "min": 1, "max": 100, "default": 10, "unit": "Đơn vị" }
    ],
    "formulaExplanation": "Mối quan hệ khi thay đổi biến"
  },
  "quizzes": [
    {
      "id": "q1",
      "question": "Câu hỏi trắc nghiệm kiểm tra kiến thức về vật thể này?",
      "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
      "correctAnswer": 1,
      "explanation": "Giải thích chi tiết tại sao đáp án đó lại đúng."
    }
  ],
  "suggestedNextTopic": "Chủ đề tiếp theo nên khám phá"
}`

    // Parse base64 data and mimeType from imageUri
    let base64Data = ''
    let mimeType = 'image/jpeg'

    if (imageUri.startsWith('data:')) {
      const parts = imageUri.split(',')
      const header = parts[0]
      base64Data = parts[1] || ''
      const mimeMatch = header.match(/data:(.*?);/)
      if (mimeMatch) {
        mimeType = mimeMatch[1]
      }
    } else {
      base64Data = imageUri
    }

    const requestBody: any = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          parts: [
            { text: options?.prompt || 'Hãy quan sát kỹ bức ảnh này, nhận diện chính xác vật thể và phân tích khoa học cho ứng dụng SnapScience.' }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    }

    if (base64Data && base64Data.length > 100 && !base64Data.startsWith('demo_')) {
      requestBody.contents[0].parts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      })
    }

    // Official active fast models on Google Gemini API
    const candidateModels = [
      'gemini-1.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash-8b',
      'gemini-2.0-flash-exp'
    ]

    let lastError: any = null

    for (const modelName of candidateModels) {
      // Retry up to 2 times if temporary 503 high demand occurs
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
          })

          if (!response.ok) {
            const errText = await response.text()

            // If 503 (temporary high demand) -> wait 400ms and retry or switch model
            if (response.status === 503) {
              console.warn(`Gemini model ${modelName} returned 503 (high demand), retrying/switching...`)
              lastError = new Error(`Gemini ${modelName} bị tải cao (503). Đang thử lại mô hình khác...`)
              await new Promise(r => setTimeout(r, 400))
              continue
            }

            // If 404 (model not found) -> switch model
            if (response.status === 404) {
              console.warn(`Gemini model ${modelName} returned 404, trying next model...`)
              lastError = new Error(`Gemini model ${modelName} returned 404`)
              break // break attempt loop to try next model candidate
            }

            let friendlyError = `Lỗi Gemini API (${response.status})`
            try {
              const parsedErr = JSON.parse(errText)
              if (parsedErr?.error?.message) {
                friendlyError = `Lỗi Gemini (${response.status}): ${parsedErr.error.message}`
              }
            } catch {
              friendlyError = `Lỗi Gemini (${response.status}): ${errText.slice(0, 150)}`
            }
            throw new Error(friendlyError)
          }

          const data = await response.json()
          const contentText = data.candidates?.[0]?.content?.parts?.[0]?.text
          if (!contentText) {
            throw new Error('Không nhận được phản hồi nội dung từ Gemini API.')
          }

          const cleaned = contentText.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
          const parsed: AIAnalysisResult = JSON.parse(cleaned)
          parsed.id = parsed.id || `gemini_${Date.now()}`
          return parsed
        } catch (err: any) {
          lastError = err
          if (err.message?.includes('503') || err.message?.includes('404')) {
            continue
          }
          throw err
        }
      }
    }

    throw lastError || new Error('Không thể kết nối với mô hình Gemini API.')
  }
}
