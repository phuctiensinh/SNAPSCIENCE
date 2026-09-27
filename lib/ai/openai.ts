import { AIProvider } from './provider'
import { AIAnalysisResult } from '../types'

export async function validateOpenAIApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
  if (!apiKey || apiKey.trim().length < 10) {
    return { valid: false, error: 'API Key quá ngắn hoặc rỗng.' }
  }
  try {
    const res = await fetch('https://api.openai.com/v1/models', {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`
      }
    })
    if (res.ok) {
      return { valid: true }
    }
    const errData = await res.json().catch(() => ({}))
    const msg = errData?.error?.message || `Lỗi HTTP ${res.status}`
    return { valid: false, error: msg }
  } catch (err: any) {
    return { valid: false, error: err.message || 'Không thể kết nối đến máy chủ OpenAI.' }
  }
}

export class OpenAIProvider implements AIProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey.trim()
  }

  async analyzeImage(imageUri: string, options?: { prompt?: string }): Promise<AIAnalysisResult> {
    const systemPrompt = `Bạn là chuyên gia giáo dục khoa học SnapScience dành cho học sinh & người yêu khoa học.
Nhiệm vụ của bạn là quan sát ẢNH THẬT ĐƯỢC CHỤP, nhận diện CHÍNH XÁC VẬT THỂ TRONG ẢNH (Ví dụ: Con chuột máy tính / Đèn bàn / Quạt máy / Bàn phím / Điện thoại / Cốc nước / ...) và phân tích các nguyên lý khoa học phía sau theo định dạng JSON CHUẨN XÁC KHÔNG ĐƯỢC CÓ CODEBLOCK MARKDOWN HOẶC BẤT KỲ VĂN BẢN NGOÀI JSON.

BẮT BUỘC trả về đúng cấu trúc JSON sau (Việt hóa 100%):
{
  "id": "res_unique_id",
  "objectName": "Tên vật thể thật trong ảnh (Ví dụ: Con chuột máy tính / Đèn học / Quạt máy / Điện thoại / ...)",
  "category": "Một trong các danh mục: 'Cơ học' | 'Quang học' | 'Điện học' | 'Sinh học' | 'Nhiệt học' | 'Toán học' | 'Hóa học' | 'Khoa học chung'",
  "confidence": 0.95, // Từ 0.00 đến 1.00
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
      "correctAnswer": 1, // index đáp án đúng (0, 1, 2, 3)
      "explanation": "Giải thích chi tiết tại sao đáp án đó lại đúng."
    }
  ],
  "suggestedNextTopic": "Chủ đề tiếp theo nên khám phá"
}`

    const userMessageContent: any[] = [
      { type: 'text', text: options?.prompt || 'Hãy quan sát kỹ bức ảnh này, nhận diện chính xác vật thể và phân tích khoa học cho ứng dụng SnapScience.' }
    ]

    if (imageUri.startsWith('data:image/') || imageUri.startsWith('http')) {
      userMessageContent.push({
        type: 'image_url',
        image_url: { url: imageUri }
      })
    } else {
      userMessageContent.push({
        type: 'text',
        text: `[Dữ liệu ảnh: ${imageUri.slice(0, 100)}...]`
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessageContent }
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errText = await response.text()
      let friendlyError = `Lỗi OpenAI API (${response.status})`
      try {
        const parsedErr = JSON.parse(errText)
        if (parsedErr?.error?.message) {
          friendlyError = `Lỗi OpenAI (${response.status}): ${parsedErr.error.message}`
        }
      } catch {
        friendlyError = `Lỗi OpenAI (${response.status}): ${errText.slice(0, 150)}`
      }
      throw new Error(friendlyError)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) {
      throw new Error('Không nhận được nội dung phản hồi từ OpenAI Vision API.')
    }

    // Clean JSON content
    const cleaned = content.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
    const parsed: AIAnalysisResult = JSON.parse(cleaned)
    parsed.id = parsed.id || `ai_${Date.now()}`
    return parsed
  }
}
