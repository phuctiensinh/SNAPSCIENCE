import { HistoryItem, UserProgress, DifficultyLevel, DailyDiscovery } from './types'

const STORAGE_KEYS = {
  HISTORY: 'snapscience_history_v1',
  PROGRESS: 'snapscience_progress_v1',
  DIFFICULTY: 'snapscience_difficulty_v1',
}

const DEFAULT_PROGRESS: UserProgress = {
  objectsDiscovered: 0,
  topicsLearned: 0,
  questionsAnswered: 0,
  correctAnswers: 0,
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split('T')[0],
  discoveredObjectsList: [],
  learnedTopicsList: [],
  difficultyPreference: 'basic'
}

export const DAILY_DISCOVERIES: DailyDiscovery[] = [
  {
    date: 'default',
    title: 'Tại sao cầu vồng có nhiều màu?',
    description: 'Tìm một vật hoặc hiện tượng liên quan đến ánh sáng (như đĩa CD, ly nước, tán cây).',
    topic: 'Quang học - Tán sắc ánh sáng',
    icon: '🌈',
    objectHint: 'Gương hoặc Ly nước'
  },
  {
    date: '2026-09-28',
    title: 'Năng lượng chuyển động của Bánh xe',
    description: 'Quan sát bánh xe đạp hoặc xe máy và xem chu vi liên quan thế nào tới quãng đường.',
    topic: 'Cơ học - Chuyển động quay',
    icon: '◉',
    objectHint: 'Bánh xe'
  },
  {
    date: '2026-09-29',
    title: 'Bóng đèn tạo ra ánh sáng như thế nào?',
    description: 'Khám phá sự biến đổi từ điện năng thành quang năng và nhiệt năng.',
    topic: 'Điện năng & Quang năng',
    icon: '💡',
    objectHint: 'Bóng đèn'
  },
  {
    date: '2026-09-30',
    title: 'Sự kỳ diệu của Quang hợp ở Cây xanh',
    description: 'Chụp một chiếc lá hoặc cây cảnh trong nhà để tìm hiểu lá cây hấp thụ ánh sáng ra sao.',
    topic: 'Sinh học - Quang hợp',
    icon: '🌱',
    objectHint: 'Cây xanh'
  }
]

// --- History Storage Functions ---

export function getHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY)
    return raw ? JSON.parse(raw) : []
  } catch (err) {
    console.error('Failed to load history from localStorage:', err)
    return []
  }
}

export function saveHistoryItem(item: HistoryItem): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const history = getHistory()
    // Avoid duplicate IDs
    const updated = [item, ...history.filter(h => h.id !== item.id)]
    // Cap at 50 items to avoid localStorage size limits
    const trimmed = updated.slice(0, 50)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed))
    
    // Update user progress
    updateProgressOnNewScan(item)
    
    return trimmed
  } catch (err) {
    console.error('Failed to save history item:', err)
    return getHistory()
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    const history = getHistory()
    const updated = history.filter(h => h.id !== id)
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(updated))
    return updated
  } catch (err) {
    console.error('Failed to delete history item:', err)
    return getHistory()
  }
}

export function clearHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return []
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY)
    return []
  } catch (err) {
    console.error('Failed to clear history:', err)
    return []
  }
}

export function checkIfPreviouslyScanned(objectName: string): HistoryItem | undefined {
  const history = getHistory()
  return history.find(h => h.objectName.toLowerCase() === objectName.toLowerCase())
}

// --- User Progress Functions ---

export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS)
    if (!raw) return DEFAULT_PROGRESS
    const progress: UserProgress = JSON.parse(raw)
    
    // Update streak logic
    const today = new Date().toISOString().split('T')[0]
    const lastDate = new Date(progress.lastActiveDate)
    const currentDate = new Date(today)
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays === 1) {
      // Streak continues
    } else if (diffDays > 1) {
      // Streak reset
      progress.streakDays = 1
    }
    progress.lastActiveDate = today
    return progress
  } catch (err) {
    console.error('Failed to load user progress:', err)
    return DEFAULT_PROGRESS
  }
}

function updateProgressOnNewScan(item: HistoryItem) {
  const progress = getUserProgress()
  const today = new Date().toISOString().split('T')[0]
  
  if (!progress.discoveredObjectsList.includes(item.objectName)) {
    progress.discoveredObjectsList.push(item.objectName)
    progress.objectsDiscovered = progress.discoveredObjectsList.length
  }
  
  item.scientificTopics.forEach(topic => {
    if (!progress.learnedTopicsList.includes(topic)) {
      progress.learnedTopicsList.push(topic)
    }
  })
  progress.topicsLearned = progress.learnedTopicsList.length
  
  // Update streak if active today
  if (progress.lastActiveDate !== today) {
    const lastDate = new Date(progress.lastActiveDate)
    const currentDate = new Date(today)
    const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24))
    if (diffDays === 1) {
      progress.streakDays += 1
    } else if (diffDays > 1) {
      progress.streakDays = 1
    }
    progress.lastActiveDate = today
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
  } catch (err) {
    console.error('Failed to update user progress:', err)
  }
}

export function recordQuizAnswer(isCorrect: boolean) {
  if (typeof window === 'undefined') return
  const progress = getUserProgress()
  progress.questionsAnswered += 1
  if (isCorrect) {
    progress.correctAnswers += 1
  }
  try {
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
  } catch (err) {
    console.error('Failed to record quiz answer:', err)
  }
}

// --- Difficulty Preference ---

export function getDifficultyPreference(): DifficultyLevel {
  if (typeof window === 'undefined') return 'basic'
  try {
    const val = localStorage.getItem(STORAGE_KEYS.DIFFICULTY) as DifficultyLevel
    return val || 'basic'
  } catch {
    return 'basic'
  }
}

export function setDifficultyPreference(level: DifficultyLevel) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.DIFFICULTY, level)
    const progress = getUserProgress()
    progress.difficultyPreference = level
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
  } catch (err) {
    console.error('Failed to save difficulty preference:', err)
  }
}

// --- Daily Discovery ---

export function getDailyDiscovery(): DailyDiscovery {
  const today = new Date().toISOString().split('T')[0]
  const matched = DAILY_DISCOVERIES.find(d => d.date === today)
  if (matched) return matched
  // Fallback to cyclical discovery based on day of year
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const index = dayOfYear % DAILY_DISCOVERIES.length
  return DAILY_DISCOVERIES[index]
}
