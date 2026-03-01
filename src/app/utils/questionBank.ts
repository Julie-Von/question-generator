import type { Question, QuizConfig } from '../types/question'
import { initialQuestions, BANK_VERSION } from '../data/initialQuestions'

const STORAGE_KEY = 'question-bank'
const VERSION_KEY = 'question-bank-version'

export function loadQuestions(): Question[] {
  try {
    const storedVersion = localStorage.getItem(VERSION_KEY)
    if (storedVersion === String(BANK_VERSION)) {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Question[]
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    }
  } catch {
    // ignore
  }
  // 版本不匹配或数据为空：重新写入初始题库
  saveQuestions(initialQuestions)
  localStorage.setItem(VERSION_KEY, String(BANK_VERSION))
  return initialQuestions
}

export function saveQuestions(questions: Question[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(questions))
}

export function addQuestion(q: Question): Question[] {
  const questions = loadQuestions()
  const updated = [...questions, q]
  saveQuestions(updated)
  return updated
}

export function updateQuestion(updated: Question): Question[] {
  const questions = loadQuestions()
  const list = questions.map(q => (q.id === updated.id ? updated : q))
  saveQuestions(list)
  return list
}

export function deleteQuestion(id: string): Question[] {
  const questions = loadQuestions()
  const list = questions.filter(q => q.id !== id)
  saveQuestions(list)
  return list
}

export function getSubjects(): string[] {
  const questions = loadQuestions()
  return [...new Set(questions.map(q => q.subject))].sort()
}

export function filterQuestions(config: QuizConfig): Question[] {
  const questions = loadQuestions()
  let filtered = questions

  if (config.subject !== 'all') {
    filtered = filtered.filter(q => q.subject === config.subject)
  }

  if (config.difficulty !== 'all') {
    filtered = filtered.filter(q => q.difficulty === config.difficulty)
  }

  // 随机打乱并截取
  const shuffled = [...filtered].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, config.count)
}

export function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}
