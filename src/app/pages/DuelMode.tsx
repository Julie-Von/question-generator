import { useEffect, useReducer, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../routes'
import type { Question } from '../types/question'

// ─── Types ───────────────────────────────────────────────────────────────────

type DuelPhase = 'buzzing' | 'answering' | 'showing_result'

export interface DuelHistoryEntry {
  questionId: string
  answeredBy: 0 | 1 | null
  wasCorrect: boolean
  selectedAnswer: string[]
}

interface DuelState {
  currentIndex: number
  scores: [number, number]
  phase: DuelPhase
  activePlayer: 0 | 1 | null
  selectedAnswer: string[]
  wasCorrect: boolean | null
  history: DuelHistoryEntry[]
}

type DuelAction =
  | { type: 'BUZZ'; player: 0 | 1 }
  | { type: 'ANSWER'; ids: string[]; correct: boolean }
  | { type: 'RECORD_AND_NEXT'; questionId: string }

function reducer(state: DuelState, action: DuelAction): DuelState {
  switch (action.type) {
    case 'BUZZ':
      if (state.phase !== 'buzzing') return state
      return { ...state, phase: 'answering', activePlayer: action.player }

    case 'ANSWER': {
      const newScores: [number, number] = [state.scores[0], state.scores[1]]
      if (action.correct && state.activePlayer !== null) {
        newScores[state.activePlayer] += 1
      }
      return {
        ...state,
        phase: 'showing_result',
        selectedAnswer: action.ids,
        wasCorrect: action.correct,
        scores: newScores,
      }
    }

    case 'RECORD_AND_NEXT': {
      const entry: DuelHistoryEntry = {
        questionId: action.questionId,
        answeredBy: state.activePlayer,
        wasCorrect: state.wasCorrect ?? false,
        selectedAnswer: state.selectedAnswer,
      }
      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        phase: 'buzzing',
        activePlayer: null,
        selectedAnswer: [],
        wasCorrect: null,
        history: [...state.history, entry],
      }
    }

    default:
      return state
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DuelMode() {
  const navigate = useNavigate()
  const location = useLocation()
  const locationState = location.state as { questions: Question[]; playerNames: [string, string] } | null

  useEffect(() => {
    if (!locationState?.questions?.length) {
      navigate(ROUTES.HOME, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!locationState?.questions?.length) return null

  const { questions, playerNames } = locationState
  const [p1, p2] = playerNames

  const [state, dispatch] = useReducer(reducer, {
    currentIndex: 0,
    scores: [0, 0],
    phase: 'buzzing',
    activePlayer: null,
    selectedAnswer: [],
    wasCorrect: null,
    history: [],
  })

  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function clearAuto() {
    if (autoRef.current) { clearTimeout(autoRef.current); autoRef.current = null }
  }

  // Auto-advance after showing result for 1.5s
  useEffect(() => {
    if (state.phase !== 'showing_result') return
    autoRef.current = setTimeout(advance, 1500)
    return clearAuto
  }, [state.phase, state.currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  function advance() {
    clearAuto()
    const question = questions[state.currentIndex]
    const isLast = state.currentIndex === questions.length - 1

    if (isLast) {
      const finalHistory: DuelHistoryEntry[] = [
        ...state.history,
        {
          questionId: question.id,
          answeredBy: state.activePlayer,
          wasCorrect: state.wasCorrect ?? false,
          selectedAnswer: state.selectedAnswer,
        },
      ]
      navigate(ROUTES.DUEL_RESULT, {
        state: {
          questions,
          playerNames,
          scores: state.scores,
          history: finalHistory,
        },
        replace: true,
      })
    } else {
      dispatch({ type: 'RECORD_AND_NEXT', questionId: question.id })
    }
  }

  const question = questions[state.currentIndex]
  const { phase, activePlayer, scores, wasCorrect, selectedAnswer } = state

  function handleBuzz(player: 0 | 1) {
    if (phase !== 'buzzing') return
    dispatch({ type: 'BUZZ', player })
  }

  function handleAnswer(optId: string) {
    if (phase !== 'answering') return
    const correct = question.correctAnswers.includes(optId)
    dispatch({ type: 'ANSWER', ids: [optId], correct })
  }

  function getOptionStyle(optId: string) {
    const isSelected = selectedAnswer.includes(optId)
    const isCorrect = question.correctAnswers.includes(optId)

    if (phase === 'showing_result') {
      if (isCorrect) return 'border-[#22c55e] bg-green-50 text-green-700'
      if (isSelected && !isCorrect) return 'border-[#ef4444] bg-red-50 text-red-700'
      return 'border-[#e2e8f0] bg-white text-[#94a3b8]'
    }
    if (phase === 'answering') {
      return 'border-[#e2e8f0] bg-white hover:border-[#6366f1] hover:bg-indigo-50 cursor-pointer text-[#1e293b]'
    }
    return 'border-[#e2e8f0] bg-white text-[#94a3b8] cursor-default'
  }

  function getCircleStyle(optId: string) {
    const isSelected = selectedAnswer.includes(optId)
    const isCorrect = question.correctAnswers.includes(optId)
    if (phase === 'showing_result') {
      if (isCorrect) return 'border-green-500 bg-green-500 text-white'
      if (isSelected && !isCorrect) return 'border-red-500 bg-red-500 text-white'
    }
    return 'border-[#cbd5e1] text-[#64748b]'
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col select-none">

      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white/80 backdrop-blur border-b border-[#e2e8f0] sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] flex items-center justify-center text-white text-xs font-bold">
            {scores[0]}
          </div>
          <span className="text-sm font-semibold text-[#3b82f6]">{p1}</span>
        </div>

        <span className="text-xs text-[#64748b]">第 {state.currentIndex + 1} / {questions.length} 题</span>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-[#f59e0b]">{p2}</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#fbbf24] flex items-center justify-center text-white text-xs font-bold">
            {scores[1]}
          </div>
        </div>
      </header>

      {/* Player 2 buzz button (top) */}
      <button
        onClick={() => handleBuzz(1)}
        disabled={phase !== 'buzzing'}
        className={[
          'mx-4 mt-4 h-20 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-[0.97]',
          phase === 'buzzing'
            ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-white shadow-lg shadow-amber-200'
            : activePlayer === 1
            ? 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24] text-white opacity-80'
            : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed opacity-50',
        ].join(' ')}
      >
        <span className="text-2xl">🔔</span>
        <span>
          {activePlayer === 1 && phase === 'answering'
            ? '作答中…'
            : `${p2} 抢答`}
        </span>
      </button>

      {/* Question card */}
      <main className="flex-1 mx-4 my-4 flex flex-col">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col flex-1">

          {/* Status banner */}
          {phase === 'answering' && activePlayer !== null && (
            <div className={`px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2 ${
              activePlayer === 0
                ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]'
                : 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]'
            }`}>
              <span>🎉</span>
              <span>{activePlayer === 0 ? p1 : p2} 抢到了！请作答</span>
            </div>
          )}
          {phase === 'showing_result' && (
            <div className={`px-4 py-2.5 text-sm font-semibold text-white flex items-center gap-2 ${
              wasCorrect
                ? 'bg-gradient-to-r from-[#22c55e] to-[#4ade80]'
                : 'bg-gradient-to-r from-[#ef4444] to-[#f87171]'
            }`}>
              <span>{wasCorrect ? '✅' : '❌'}</span>
              <span>{wasCorrect ? `答对了！${activePlayer === 0 ? p1 : p2} +1分` : '答错了！'}</span>
            </div>
          )}
          {phase === 'buzzing' && (
            <div className="px-4 py-2.5 text-sm text-[#64748b] flex items-center gap-2 bg-[#f8fafc]">
              <span>⚡</span>
              <span>题目已就绪，请抢答！</span>
            </div>
          )}

          {/* Question content */}
          <div className="p-5 flex-1">
            {/* Meta badges */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-xs font-semibold text-[#6366f1]">Q{state.currentIndex + 1}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">
                {question.difficulty === 'easy' ? '简单' : question.difficulty === 'medium' ? '中等' : '困难'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#64748b]">
                {question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : question.type === 'short' ? '简答' : '判断'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-[#6366f1]">{question.subject}</span>
            </div>

            {/* Question text */}
            <p className="text-base font-medium text-[#1e293b] mb-4 leading-relaxed">{question.content}</p>

            {/* Options or short-answer UI */}
            {question.type === 'short' ? (
              <div className="flex flex-col gap-3">
                {/* 参考答案（answering 或 showing_result 时显示） */}
                {(phase === 'answering' || phase === 'showing_result') && (
                  <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
                    <p className="text-xs font-semibold text-[#6366f1] mb-1">💡 参考答案</p>
                    <p className="text-base font-medium text-[#1e293b]">{question.correctAnswer}</p>
                  </div>
                )}
                {/* 自判按钮 */}
                {phase === 'answering' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAnswer('correct')}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-[#22c55e] bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-all duration-150"
                    >
                      ✅ 答对了
                    </button>
                    <button
                      onClick={() => handleAnswer('wrong')}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-[#ef4444] bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all duration-150"
                    >
                      ❌ 答错了
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {(question.options ?? []).map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleAnswer(opt.id)}
                    disabled={phase !== 'answering'}
                    className={[
                      'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-sm text-left transition-all duration-150 min-h-[48px] font-medium',
                      phase !== 'answering' ? 'cursor-default' : 'cursor-pointer',
                      getOptionStyle(opt.id),
                    ].join(' ')}
                  >
                    <span className={[
                      'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase',
                      getCircleStyle(opt.id),
                    ].join(' ')}>
                      {opt.id.length === 1 ? opt.id : '·'}
                    </span>
                    <span className="flex-1">{opt.text}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Explanation (show on result) */}
            {phase === 'showing_result' && question.explanation && (
              <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100 animate-fade-in">
                <p className="text-xs font-semibold text-[#6366f1] mb-1">解析</p>
                <p className="text-xs text-[#475569] leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Player 1 buzz button (bottom) */}
      <button
        onClick={() => handleBuzz(0)}
        disabled={phase !== 'buzzing'}
        className={[
          'mx-4 mb-4 h-20 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-[0.97]',
          phase === 'buzzing'
            ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-lg shadow-blue-200'
            : activePlayer === 0
            ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white opacity-80'
            : 'bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed opacity-50',
        ].join(' ')}
      >
        <span>
          {activePlayer === 0 && phase === 'answering'
            ? '作答中…'
            : `${p1} 抢答`}
        </span>
        <span className="text-2xl">🔔</span>
      </button>

      <div className="h-safe-bottom" />
    </div>
  )
}
