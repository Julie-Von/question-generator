import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTES } from '../routes'
import type { Question } from '../types/question'
import type { DuelHistoryEntry } from './DuelMode'

interface DuelResultState {
  questions: Question[]
  playerNames: [string, string]
  scores: [number, number]
  history: DuelHistoryEntry[]
}

export default function DuelResult() {
  const navigate = useNavigate()
  const location = useLocation()
  const data = location.state as DuelResultState | null

  useEffect(() => {
    if (!data?.questions?.length) {
      navigate(ROUTES.HOME, { replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data?.questions?.length) return null

  const { questions, playerNames, scores, history } = data
  const [p1, p2] = playerNames
  const [s1, s2] = scores

  const winner: 0 | 1 | 'tie' = s1 > s2 ? 0 : s2 > s1 ? 1 : 'tie'

  // Count answered/correct per player
  const p1Stats = history.reduce((acc, h) => ({
    answered: acc.answered + (h.answeredBy === 0 ? 1 : 0),
    correct: acc.correct + (h.answeredBy === 0 && h.wasCorrect ? 1 : 0),
  }), { answered: 0, correct: 0 })

  const p2Stats = history.reduce((acc, h) => ({
    answered: acc.answered + (h.answeredBy === 1 ? 1 : 0),
    correct: acc.correct + (h.answeredBy === 1 && h.wasCorrect ? 1 : 0),
  }), { answered: 0, correct: 0 })

  const questionMap = Object.fromEntries(questions.map(q => [q.id, q]))

  return (
    <div className="min-h-dvh bg-gradient-to-br from-blue-50 via-white to-amber-50 flex flex-col">

      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4">
        <button
          onClick={() => navigate(ROUTES.HOME, { replace: true })}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors text-[#64748b]"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-bold text-base text-[#1e293b]">双人抢答 · 结果</h1>
      </header>

      <main className="flex-1 px-4 pb-8 max-w-lg mx-auto w-full flex flex-col gap-4">

        {/* Winner banner */}
        <div className={`rounded-2xl p-5 text-center text-white shadow-lg ${
          winner === 'tie'
            ? 'bg-gradient-to-r from-[#64748b] to-[#94a3b8]'
            : winner === 0
            ? 'bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]'
            : 'bg-gradient-to-r from-[#f59e0b] to-[#fbbf24]'
        }`}>
          <div className="text-4xl mb-2">{winner === 'tie' ? '🤝' : '🏆'}</div>
          <p className="text-lg font-bold">
            {winner === 'tie'
              ? '平局！势均力敌'
              : `${winner === 0 ? p1 : p2} 获胜！`}
          </p>
          <p className="text-sm opacity-80 mt-1">
            {winner === 'tie'
              ? `双方均得 ${s1} 分`
              : `${winner === 0 ? p1 : p2} 以 ${winner === 0 ? s1 : s2} : ${winner === 0 ? s2 : s1} 领先`}
          </p>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Player 1 */}
          <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${winner === 0 ? 'border-[#3b82f6]' : 'border-[#e2e8f0]'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#3b82f6]" />
              <span className="text-sm font-semibold text-[#1e293b] truncate">{p1}</span>
              {winner === 0 && <span className="text-xs text-[#3b82f6] ml-auto">👑</span>}
            </div>
            <div className="text-4xl font-bold text-[#3b82f6] mb-1">{s1}</div>
            <p className="text-xs text-[#64748b]">得分</p>
            <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex justify-between text-xs text-[#64748b]">
              <span>抢答 {p1Stats.answered} 次</span>
              <span className="text-green-600">正确 {p1Stats.correct}</span>
            </div>
          </div>

          {/* Player 2 */}
          <div className={`bg-white rounded-2xl p-4 shadow-sm border-2 ${winner === 1 ? 'border-[#f59e0b]' : 'border-[#e2e8f0]'}`}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              <span className="text-sm font-semibold text-[#1e293b] truncate">{p2}</span>
              {winner === 1 && <span className="text-xs text-[#f59e0b] ml-auto">👑</span>}
            </div>
            <div className="text-4xl font-bold text-[#f59e0b] mb-1">{s2}</div>
            <p className="text-xs text-[#64748b]">得分</p>
            <div className="mt-3 pt-3 border-t border-[#f1f5f9] flex justify-between text-xs text-[#64748b]">
              <span>抢答 {p2Stats.answered} 次</span>
              <span className="text-green-600">正确 {p2Stats.correct}</span>
            </div>
          </div>
        </div>

        {/* Question history */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-[#f1f5f9]">
            <h2 className="text-sm font-semibold text-[#1e293b]">答题记录</h2>
          </div>
          <div className="divide-y divide-[#f1f5f9]">
            {history.map((entry, idx) => {
              const q = questionMap[entry.questionId]
              if (!q) return null
              const answeredByName = entry.answeredBy === null ? '无人抢答' : entry.answeredBy === 0 ? p1 : p2
              const playerColor = entry.answeredBy === 0 ? 'text-[#3b82f6]' : entry.answeredBy === 1 ? 'text-[#f59e0b]' : 'text-[#94a3b8]'

              return (
                <div key={entry.questionId + idx} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-[#64748b] flex-shrink-0">Q{idx + 1}</span>
                    <p className="text-xs text-[#1e293b] flex-1 leading-snug line-clamp-2">{q.content}</p>
                    <span className={`flex-shrink-0 text-base ${entry.answeredBy === null ? '' : entry.wasCorrect ? '✅' : '❌'}`}>
                      {entry.answeredBy === null ? '—' : entry.wasCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className={`font-medium ${playerColor}`}>
                      {answeredByName}
                      {entry.answeredBy !== null && (entry.wasCorrect ? ' +1' : ' ✗')}
                    </span>
                    <span className="text-[#94a3b8]">
                      正确答案：{q.type === 'short'
                        ? (q.correctAnswer ?? '—')
                        : q.correctAnswers.map(id => {
                            const opt = (q.options ?? []).find(o => o.id === id)
                            return opt ? `${opt.id}.${opt.text.slice(0, 8)}` : id
                          }).join('、')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate(ROUTES.QUIZ_CONFIG + '?mode=duel', { replace: true })}
            className="py-3 rounded-2xl font-semibold text-sm bg-gradient-to-r from-[#10b981] to-[#34d399] text-white shadow-md active:scale-[0.98] transition-transform"
          >
            再来一次
          </button>
          <button
            onClick={() => navigate(ROUTES.HOME, { replace: true })}
            className="py-3 rounded-2xl font-semibold text-sm bg-white border-2 border-[#e2e8f0] text-[#64748b] active:scale-[0.98] transition-transform"
          >
            返回首页
          </button>
        </div>
      </main>

      <div className="h-safe-bottom" />
    </div>
  )
}
