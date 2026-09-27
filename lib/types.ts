export type ObjectCategory = 'Cơ học' | 'Quang học' | 'Điện học' | 'Sinh học' | 'Nhiệt học' | 'Toán học' | 'Hóa học' | 'Khoa học chung'

export type DifficultyLevel = 'basic' | 'intermediate' | 'advanced'

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number // 0-indexed
  explanation: string
}

export interface CalculatorField {
  id: string
  label: string
  unit: string
  defaultValue: number
  min: number
  max: number
  step?: number
}

export interface CalculationResult {
  label: string
  value: number
  unit: string
  formula: string
}

export interface ObjectCalculator {
  title: string
  description: string
  fields: CalculatorField[]
  calculate: (inputs: Record<string, number>) => CalculationResult[]
}

export interface MiniExperiment {
  title: string
  description: string
  variables: {
    name: string
    label: string
    min: number
    max: number
    default: number
    unit: string
    step?: number
  }[]
  formulaExplanation: string
}

export interface LessonContent {
  howItWorks: string
  whyItWorks: string
  whereItAppears: string
  interestingFact: string
  mathBehind?: string
  physicsBehind?: string
  levelExplanations: {
    basic: string
    intermediate: string
    advanced: string
  }
}

export interface AIAnalysisResult {
  id: string
  objectName: string
  category: ObjectCategory
  confidence: number // 0.0 to 1.0
  summary: string
  scientificTopics: string[]
  lesson: LessonContent
  calculator?: {
    type: 'wheel' | 'lightbulb' | 'stair' | 'mirror' | 'plant' | 'generic'
    title: string
    description: string
    inputs: {
      id: string
      label: string
      unit: string
      defaultValue: number
      min: number
      max: number
    }[]
  }
  experiment?: MiniExperiment
  quizzes: QuizQuestion[]
  suggestedNextTopic?: string
}

export interface HistoryItem {
  id: string
  timestamp: number
  imageUri: string
  objectName: string
  category: ObjectCategory
  confidence: number
  summary: string
  scientificTopics: string[]
  fullResult: AIAnalysisResult
}

export interface UserProgress {
  objectsDiscovered: number
  topicsLearned: number
  questionsAnswered: number
  correctAnswers: number
  streakDays: number
  lastActiveDate: string // YYYY-MM-DD
  discoveredObjectsList: string[]
  learnedTopicsList: string[]
  difficultyPreference: DifficultyLevel
}

export interface DailyDiscovery {
  date: string
  title: string
  description: string
  topic: string
  icon: string
  objectHint: string
}
