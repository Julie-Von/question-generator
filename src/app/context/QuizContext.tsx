import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { Question, QuizSession, QuizResult, QuizConfig } from '../types/question'

interface QuizState {
  config: QuizConfig | null
  session: QuizSession | null
  currentIndex: number
  result: QuizResult | null
}

type QuizAction =
  | { type: 'START'; config: QuizConfig; questions: Question[] }
  | { type: 'ANSWER'; questionId: string; selectedIds: string[] }
  | { type: 'NEXT' }
  | { type: 'PREV' }
  | { type: 'FINISH' }
  | { type: 'RESET' }

const initialState: QuizState = {
  config: null,
  session: null,
  currentIndex: 0,
  result: null,
}

function calcResult(session: QuizSession): QuizResult {
  const { questions, answers, startTime } = session
  let correctCount = 0

  for (const q of questions) {
    const selected = (answers[q.id] ?? []).sort().join(',')
    const correct = [...q.correctAnswers].sort().join(',')
    if (selected === correct) correctCount++
  }

  const total = questions.length
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const timeUsed = Math.round((Date.now() - startTime) / 1000)

  return {
    session,
    score: correctCount * 10,
    total,
    percentage,
    correctCount,
    wrongCount: total - correctCount,
    timeUsed,
  }
}

function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'START':
      return {
        config: action.config,
        session: {
          questions: action.questions,
          answers: {},
          startTime: Date.now(),
          mode: action.config.mode,
        },
        currentIndex: 0,
        result: null,
      }

    case 'ANSWER': {
      if (!state.session) return state
      return {
        ...state,
        session: {
          ...state.session,
          answers: {
            ...state.session.answers,
            [action.questionId]: action.selectedIds,
          },
        },
      }
    }

    case 'NEXT':
      if (!state.session) return state
      return {
        ...state,
        currentIndex: Math.min(state.currentIndex + 1, state.session.questions.length - 1),
      }

    case 'PREV':
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0) }

    case 'FINISH': {
      if (!state.session) return state
      const session = { ...state.session, endTime: Date.now() }
      return { ...state, session, result: calcResult(session) }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

interface QuizContextValue {
  state: QuizState
  startQuiz: (config: QuizConfig, questions: Question[]) => void
  answerQuestion: (questionId: string, selectedIds: string[]) => void
  nextQuestion: () => void
  prevQuestion: () => void
  finishQuiz: () => void
  resetQuiz: () => void
}

const QuizContext = createContext<QuizContextValue | null>(null)

export function QuizProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(quizReducer, initialState)

  const value: QuizContextValue = {
    state,
    startQuiz: (config, questions) => dispatch({ type: 'START', config, questions }),
    answerQuestion: (questionId, selectedIds) => dispatch({ type: 'ANSWER', questionId, selectedIds }),
    nextQuestion: () => dispatch({ type: 'NEXT' }),
    prevQuestion: () => dispatch({ type: 'PREV' }),
    finishQuiz: () => dispatch({ type: 'FINISH' }),
    resetQuiz: () => dispatch({ type: 'RESET' }),
  }

  return <QuizContext.Provider value={value}>{children}</QuizContext.Provider>
}

export function useQuiz() {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used inside QuizProvider')
  return ctx
}
