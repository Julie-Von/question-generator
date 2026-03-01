import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes'
import { useQuiz } from '../context/QuizContext'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ProgressBar } from '../components/quiz/ProgressBar'
import { Timer } from '../components/quiz/Timer'

export default function BattleMode() {
  const navigate = useNavigate()
  const { state, answerQuestion, nextQuestion, finishQuiz } = useQuiz()
  const [timerKey, setTimerKey] = useState(0)
  const [showCorrect, setShowCorrect] = useState(false)
  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  if (!state.session) {
    navigate(ROUTES.HOME)
    return null
  }

  const { session, currentIndex, config } = state
  const question = session.questions[currentIndex]
  const selectedIds = session.answers[question.id] ?? []
  const isLast = currentIndex === session.questions.length - 1
  const timeLimit = config?.timeLimit ?? 30

  function clearAutoAdvance() {
    if (autoAdvanceRef.current) {
      clearTimeout(autoAdvanceRef.current)
      autoAdvanceRef.current = null
    }
  }

  function advance() {
    clearAutoAdvance()
    setShowCorrect(false)
    setTimerKey(k => k + 1)
    if (isLast) {
      finishQuiz()
      navigate(ROUTES.RESULT, { replace: true })
    } else {
      nextQuestion()
    }
  }

  function handleSelect(raw: string) {
    if (selectedIds.length > 0) return   // 已作答，不允许改
    const ids = raw.includes(',') ? raw.split(',') : [raw]
    answerQuestion(question.id, ids)
    setShowCorrect(true)
    // 1.5s 后自动切换
    autoAdvanceRef.current = setTimeout(advance, 1500)
  }

  function handleExpire() {
    // 时间到，标记空答案并前进
    if (selectedIds.length === 0) {
      answerQuestion(question.id, [])
    }
    setShowCorrect(true)
    autoAdvanceRef.current = setTimeout(advance, 1200)
  }

  // 题目切换时重置状态
  useEffect(() => {
    setShowCorrect(false)
    setTimerKey(k => k + 1)
    return () => clearAutoAdvance()
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  const isAnswered = selectedIds.length > 0

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#1e1b4b] to-[#312e81] flex flex-col text-white">
      {/* Header */}
      <header className="px-5 py-4 md:px-8 flex items-center justify-between">
        <button
          onClick={() => { clearAutoAdvance(); navigate(ROUTES.HOME) }}
          className="text-indigo-300 hover:text-white transition-colors text-sm"
        >
          ✕ 退出
        </button>
        <div className="flex-1 mx-4">
          <ProgressBar current={currentIndex + 1} total={session.questions.length} showText={false} />
        </div>
        <span className="text-sm text-indigo-300">{currentIndex + 1}/{session.questions.length}</span>
      </header>

      {/* Score streak */}
      <div className="px-5 md:px-8 mb-4">
        <div className="flex items-center gap-4 text-indigo-200 text-sm">
          <span>已答 <strong className="text-white">{currentIndex}</strong> 题</span>
          <span>•</span>
          <span>
            正确{' '}
            <strong className="text-green-400">
              {
                session.questions.slice(0, currentIndex).filter(q => {
                  const ans = (session.answers[q.id] ?? []).sort().join(',')
                  return ans === [...q.correctAnswers].sort().join(',')
                }).length
              }
            </strong>
          </span>
        </div>
      </div>

      {/* Timer + Question */}
      <main className="flex-1 px-5 md:px-8 flex flex-col gap-5 max-w-2xl mx-auto w-full">
        {/* 计时器 */}
        <div className="flex justify-center">
          <Timer
            key={`${timerKey}-${currentIndex}`}
            seconds={timeLimit}
            onExpire={handleExpire}
            paused={isAnswered}
          />
        </div>

        {/* 题目卡片（深色主题改用白色卡片） */}
        <div className="bg-white rounded-2xl p-5 shadow-xl text-[#1e293b]">
          <QuestionCard
            key={question.id}
            question={question}
            index={currentIndex}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            showAnswer={showCorrect}
            disabled={isAnswered}
          />
        </div>

        {/* 已作答提示 */}
        {isAnswered && (
          <div className="text-center text-indigo-300 text-sm animate-fade-in">
            即将进入下一题…
          </div>
        )}
      </main>
    </div>
  )
}
