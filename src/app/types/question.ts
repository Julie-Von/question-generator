export type Difficulty = 'easy' | 'medium' | 'hard'

export type QuestionType = 'single' | 'multiple' | 'truefalse' | 'short'

export interface Option {
  id: string
  text: string
}

export interface Question {
  id: string
  type: QuestionType
  subject: string
  difficulty: Difficulty
  content: string
  options?: Option[]
  correctAnswers: string[]   // option id(s); for short: ['correct'] or ['wrong']
  correctAnswer?: string     // short questions: display text of the reference answer
  explanation?: string
  tags?: string[]
  createdAt: number
}

export interface QuizSession {
  questions: Question[]
  answers: Record<string, string[]>   // questionId -> selected option ids
  startTime: number
  endTime?: number
  mode: 'browse' | 'battle' | 'duel'
}

export interface QuizResult {
  session: QuizSession
  score: number
  total: number
  percentage: number
  correctCount: number
  wrongCount: number
  timeUsed: number   // seconds
}

export interface QuizConfig {
  subject: string
  difficulty: Difficulty | 'all'
  count: number
  mode: 'browse' | 'battle' | 'duel'
  timeLimit?: number   // seconds per question (battle mode)
}
