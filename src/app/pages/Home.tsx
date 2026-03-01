import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes'
import { loadQuestions } from '../utils/questionBank'

export default function Home() {
  const navigate = useNavigate()
  const total = loadQuestions().length

  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 md:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-sm font-bold">
            智
          </div>
          <span className="font-semibold text-[#1e293b]">智能答题</span>
        </div>
        <button
          onClick={() => navigate(ROUTES.ADMIN_LOGIN)}
          className="text-xs text-[#64748b] hover:text-[#6366f1] transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50"
        >
          管理员
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-10 gap-10">
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] shadow-lg shadow-indigo-200 mb-6 animate-pulse-ring">
            <span className="text-4xl">🧠</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1e293b] mb-3">
            智能
            <span className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent"> 答题</span>
          </h1>
          <p className="text-[#64748b] text-base md:text-lg max-w-sm mx-auto">
            多学科题库，智能出题，轻松备考
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 bg-indigo-50 text-[#6366f1] text-sm px-4 py-1.5 rounded-full">
            <span>📚</span>
            <span>题库共 <strong>{total}</strong> 道题</span>
          </div>
        </div>

        {/* 模式选择 */}
        <div className="w-full max-w-md grid gap-4 animate-scale-in">
          <ModeCard
            emoji="📖"
            title="浏览模式"
            desc="随时暂停，查看解析，适合学习和复习"
            color="indigo"
            onClick={() => navigate(ROUTES.QUIZ_CONFIG + '?mode=browse')}
          />
          <ModeCard
            emoji="⚔️"
            title="挑战模式"
            desc="计时答题，挑战自我，感受答题刺激"
            color="purple"
            onClick={() => navigate(ROUTES.QUIZ_CONFIG + '?mode=battle')}
          />
          <ModeCard
            emoji="🤜🤛"
            title="双人抢答"
            desc="两人同屏竞技，抢先作答，一决高下"
            color="green"
            onClick={() => navigate(ROUTES.QUIZ_CONFIG + '?mode=duel')}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#94a3b8] pb-6">
        智能答题系统 · 由 AI 驱动
      </footer>

      {/* 底部导航（移动端占位） */}
      <div className="h-safe-bottom" />
    </div>
  )
}

function ModeCard({
  emoji,
  title,
  desc,
  color,
  onClick,
}: {
  emoji: string
  title: string
  desc: string
  color: 'indigo' | 'purple' | 'green'
  onClick: () => void
}) {
  const gradient = color === 'indigo'
    ? 'from-[#6366f1] to-[#818cf8]'
    : color === 'purple'
    ? 'from-[#8b5cf6] to-[#a78bfa]'
    : 'from-[#10b981] to-[#34d399]'

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 w-full p-5 bg-white rounded-2xl border-2 border-[#e2e8f0] hover:border-transparent hover:shadow-lg transition-all duration-200 text-left active:scale-[0.98]"
    >
      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
        {emoji}
      </div>
      <div className="flex-1">
        <h2 className="font-semibold text-base text-[#1e293b] mb-0.5">{title}</h2>
        <p className="text-sm text-[#64748b] leading-snug">{desc}</p>
      </div>
      <svg className="w-5 h-5 text-[#cbd5e1] group-hover:text-[#6366f1] group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
