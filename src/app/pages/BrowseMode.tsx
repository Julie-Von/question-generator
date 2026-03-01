import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes'
import { useQuiz } from '../context/QuizContext'
import { QuestionCard } from '../components/quiz/QuestionCard'
import { ProgressBar } from '../components/quiz/ProgressBar'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export default function BrowseMode() {
  const navigate = useNavigate()
  const { state, answerQuestion, nextQuestion, prevQuestion, finishQuiz } = useQuiz()
  const [showAnswer, setShowAnswer] = useState(false)

  if (!state.session) {
    navigate(ROUTES.HOME)
    return null
  }

  const { session, currentIndex } = state
  const question = session.questions[currentIndex]
  const selectedIds = session.answers[question.id] ?? []
  const isLast = currentIndex === session.questions.length - 1
  const answered = selectedIds.length > 0

  function handleSelect(raw: string) {
    // raw 可能是 "a" 或 "a,b" (多选)
    const ids = raw.includes(',') ? raw.split(',') : [raw]
    answerQuestion(question.id, ids)
    setShowAnswer(false)
  }

  function handleNext() {
    setShowAnswer(false)
    if (isLast) {
      finishQuiz()
      navigate(ROUTES.RESULT, { replace: true })
    } else {
      nextQuestion()
    }
  }

  function handlePrev() {
    setShowAnswer(false)
    prevQuestion()
  }

  const answeredCount = Object.keys(session.answers).length

  return (
    <div className="min-h-dvh bg-[#f8fafc] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur border-b border-[#e2e8f0] px-5 py-3 md:px-8 z-10">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.HOME)}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#f1f5f9] text-[#64748b]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex-1">
            <ProgressBar current={currentIndex + 1} total={session.questions.length} />
          </div>
          <span className="text-xs text-[#64748b] flex-shrink-0">
            已答 {answeredCount}/{session.questions.length}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-5 py-5 md:px-8 max-w-2xl mx-auto w-full">
        <Card>
          <QuestionCard
            key={question.id}
            question={question}
            index={currentIndex}
            selectedIds={selectedIds}
            onSelect={handleSelect}
            showAnswer={showAnswer}
            disabled={showAnswer}
          />

          {/* 操作按钮 */}
          <div className="mt-5 flex flex-col gap-3">
            {answered && !showAnswer && (
              <Button variant="outline" fullWidth onClick={() => setShowAnswer(true)}>
                查看解析
              </Button>
            )}

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="md"
                disabled={currentIndex === 0}
                onClick={handlePrev}
                className="flex-1"
              >
                上一题
              </Button>
              <Button
                size="md"
                onClick={handleNext}
                className="flex-2"
                style={{ flex: 2 }}
              >
                {isLast ? '完成答题' : '下一题'}
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}
