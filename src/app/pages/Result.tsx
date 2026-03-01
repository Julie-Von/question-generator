import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes'
import { useQuiz } from '../context/QuizContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export default function Result() {
  const navigate = useNavigate()
  const { state, resetQuiz } = useQuiz()

  if (!state.result) {
    navigate(ROUTES.HOME, { replace: true })
    return null
  }

  const { result } = state
  const { session, correctCount, wrongCount, total, percentage, timeUsed } = result

  const grade =
    percentage >= 90 ? { label: '优秀', emoji: '🏆', color: 'text-yellow-500' } :
    percentage >= 70 ? { label: '良好', emoji: '🎉', color: 'text-green-500' } :
    percentage >= 60 ? { label: '及格', emoji: '👍', color: 'text-blue-500' } :
    { label: '加油', emoji: '💪', color: 'text-orange-500' }

  function handleRetry() {
    resetQuiz()
    navigate(ROUTES.QUIZ_CONFIG + `?mode=${session.mode}`, { replace: true })
  }

  function handleHome() {
    resetQuiz()
    navigate(ROUTES.HOME, { replace: true })
  }

  // 圆形进度
  const radius = 52
  const circ = 2 * Math.PI * radius
  const dashoffset = circ * (1 - percentage / 100)

  // 错题列表
  const wrongQuestions = session.questions.filter(q => {
    const ans = (session.answers[q.id] ?? []).sort().join(',')
    return ans !== [...q.correctAnswers].sort().join(',')
  })

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8 gap-6 max-w-lg mx-auto w-full">

        {/* 环形分数 */}
        <div className="animate-scale-in flex flex-col items-center gap-3">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={radius}
                fill="none"
                stroke="url(#grad)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={dashoffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[#1e293b]">{percentage}%</span>
              <span className={`text-sm font-medium ${grade.color}`}>{grade.label}</span>
            </div>
          </div>
          <span className="text-4xl">{grade.emoji}</span>
        </div>

        {/* 统计卡片 */}
        <Card className="w-full animate-fade-in">
          <div className="grid grid-cols-3 gap-4 text-center mb-5">
            <StatItem value={total} label="总题数" color="text-[#1e293b]" />
            <StatItem value={correctCount} label="答对" color="text-green-600" />
            <StatItem value={wrongCount} label="答错" color="text-red-500" />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[#f1f5f9] pt-4">
            <InfoItem label="用时" value={formatTime(timeUsed)} />
            <InfoItem label="模式" value={session.mode === 'battle' ? '挑战模式' : '浏览模式'} />
          </div>
        </Card>

        {/* 错题列表 */}
        {wrongQuestions.length > 0 && (
          <Card className="w-full animate-fade-in">
            <h2 className="font-semibold text-sm text-[#1e293b] mb-3 flex items-center gap-2">
              <span>❌</span> 错题回顾（{wrongQuestions.length} 道）
            </h2>
            <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {wrongQuestions.map(q => {
                const userAnswer = session.answers[q.id] ?? []
                const isShort = q.type === 'short'

                const myAnswerText = isShort
                  ? (userAnswer.includes('correct') ? '自判正确' : userAnswer.includes('wrong') ? '自判错误' : '未作答')
                  : (userAnswer.length === 0 ? '未作答' : userAnswer.map(id => (q.options ?? []).find(o => o.id === id)?.text ?? id).join('、'))

                const correctAnswerText = isShort
                  ? (q.correctAnswer ?? '—')
                  : q.correctAnswers.map(id => (q.options ?? []).find(o => o.id === id)?.text ?? id).join('、')

                return (
                  <div key={q.id} className="text-sm bg-red-50 rounded-xl p-3 border border-red-100">
                    <p className="font-medium text-[#1e293b] mb-1 line-clamp-2">{q.content}</p>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge color="red">我的答案：{myAnswerText}</Badge>
                      <Badge color="green">{isShort ? '参考答案' : '正确答案'}：{correctAnswerText}</Badge>
                    </div>
                    {q.explanation && (
                      <p className="text-xs text-[#64748b] mt-1.5">{q.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )}

        {/* 操作按钮 */}
        <div className="w-full flex flex-col gap-3">
          <Button fullWidth size="lg" onClick={handleRetry}>再来一次</Button>
          <Button fullWidth variant="outline" onClick={handleHome}>返回首页</Button>
        </div>
      </main>
    </div>
  )
}

function StatItem({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-[#94a3b8] mt-0.5">{label}</p>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f8fafc] rounded-xl p-3">
      <p className="text-xs text-[#94a3b8]">{label}</p>
      <p className="text-sm font-semibold text-[#1e293b] mt-0.5">{value}</p>
    </div>
  )
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}分${s}秒` : `${s}秒`
}
