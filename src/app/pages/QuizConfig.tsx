import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '../routes'
import { filterQuestions, getSubjects, loadQuestions } from '../utils/questionBank'
import { useQuiz } from '../context/QuizContext'
import type { Difficulty, QuizConfig } from '../types/question'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Select } from '../components/ui/Select'

export default function QuizConfig() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const mode = (searchParams.get('mode') ?? 'browse') as 'browse' | 'battle' | 'duel'
  const { startQuiz } = useQuiz()

  const subjects = ['all', ...getSubjects()]
  const [subject, setSubject] = useState('all')
  const [difficulty, setDifficulty] = useState<Difficulty | 'all'>('all')
  const [count, setCount] = useState(10)
  const [timeLimit, setTimeLimit] = useState(30)
  const [p1Name, setP1Name] = useState('玩家1')
  const [p2Name, setP2Name] = useState('玩家2')

  const total = loadQuestions().filter(q =>
    (subject === 'all' || q.subject === subject) &&
    (difficulty === 'all' || q.difficulty === difficulty)
  ).length

  const available = Math.min(total, 50)
  const safeCount = Math.min(count, available)

  function handleStart() {
    const config: QuizConfig = { subject, difficulty, count: safeCount, mode, timeLimit: mode === 'battle' ? timeLimit : undefined }
    const questions = filterQuestions(config)
    if (questions.length === 0) return
    if (mode === 'duel') {
      navigate(ROUTES.DUEL, { state: { questions, playerNames: [p1Name || '玩家1', p2Name || '玩家2'] } })
    } else {
      startQuiz(config, questions)
      navigate(mode === 'battle' ? ROUTES.BATTLE : ROUTES.BROWSE)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-4 md:px-8">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-white transition-colors text-[#64748b]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="font-bold text-base text-[#1e293b]">
            {mode === 'battle' ? '⚔️ 挑战模式' : mode === 'duel' ? '🤜🤛 双人抢答' : '📖 浏览模式'}
          </h1>
          <p className="text-xs text-[#64748b]">配置答题参数</p>
        </div>
      </header>

      <main className="flex-1 px-5 py-4 md:px-8 max-w-lg mx-auto w-full">
        <Card className="animate-scale-in">
          <div className="flex flex-col gap-5">
            {/* 双人抢答：玩家名称 */}
            {mode === 'duel' && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-[#1e293b]">玩家名称</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#3b82f6] font-medium mb-1">玩家1（蓝）</p>
                    <input
                      type="text"
                      value={p1Name}
                      onChange={e => setP1Name(e.target.value)}
                      placeholder="玩家1"
                      maxLength={8}
                      className="w-full px-3 py-2 rounded-xl border-2 border-[#3b82f6] bg-blue-50 text-[#1e293b] text-sm focus:outline-none focus:border-[#2563eb]"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-[#f59e0b] font-medium mb-1">玩家2（橙）</p>
                    <input
                      type="text"
                      value={p2Name}
                      onChange={e => setP2Name(e.target.value)}
                      placeholder="玩家2"
                      maxLength={8}
                      className="w-full px-3 py-2 rounded-xl border-2 border-[#f59e0b] bg-amber-50 text-[#1e293b] text-sm focus:outline-none focus:border-[#d97706]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 科目 */}
            <Select
              label="科目"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              options={subjects.map(s => ({ value: s, label: s === 'all' ? '全部科目' : s }))}
            />

            {/* 难度 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-[#1e293b]">难度</label>
              <div className="grid grid-cols-4 gap-2">
                {(['all', 'easy', 'medium', 'hard'] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={[
                      'py-2 rounded-xl text-sm font-medium border-2 transition-all min-h-[44px]',
                      difficulty === d
                        ? 'border-[#6366f1] bg-indigo-50 text-[#4f46e5]'
                        : 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-[#6366f1]',
                    ].join(' ')}
                  >
                    {d === 'all' ? '全部' : d === 'easy' ? '简单' : d === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>

            {/* 题目数量 */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-[#1e293b]">题目数量</label>
                <span className="text-sm font-bold text-[#6366f1]">{safeCount} 题</span>
              </div>
              <input
                type="range"
                min={1}
                max={Math.max(available, 1)}
                value={safeCount}
                onChange={e => setCount(Number(e.target.value))}
                className="w-full accent-[#6366f1] cursor-pointer"
              />
              <p className="text-xs text-[#94a3b8]">当前筛选条件下共 {total} 道可用题目</p>
            </div>

            {/* 挑战模式：每题时限（抢答模式不显示） */}
            {mode === 'battle' && (
              <div className="flex flex-col gap-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-[#1e293b]">每题时限</label>
                  <span className="text-sm font-bold text-[#6366f1]">{timeLimit} 秒</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={120}
                  step={5}
                  value={timeLimit}
                  onChange={e => setTimeLimit(Number(e.target.value))}
                  className="w-full accent-[#6366f1] cursor-pointer"
                />
              </div>
            )}

            {/* 预览 */}
            <div className={`rounded-xl p-4 flex items-center justify-between ${mode === 'duel' ? 'bg-green-50' : 'bg-indigo-50'}`}>
              <div>
                <p className={`text-sm font-semibold ${mode === 'duel' ? 'text-[#059669]' : 'text-[#4f46e5]'}`}>即将开始</p>
                <p className={`text-xs mt-0.5 ${mode === 'duel' ? 'text-[#10b981]' : 'text-[#6366f1]'}`}>
                  {mode === 'duel'
                    ? `双人抢答，${safeCount} 道题`
                    : `${safeCount} 道 ${subject === 'all' ? '全科目' : subject} 题目${mode === 'battle' ? `，每题 ${timeLimit} 秒` : '，无时限'}`}
                </p>
              </div>
              <span className="text-2xl">{mode === 'battle' ? '⚔️' : mode === 'duel' ? '🤜🤛' : '📖'}</span>
            </div>

            <Button
              fullWidth
              size="lg"
              disabled={safeCount === 0}
              onClick={handleStart}
            >
              开始答题
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
