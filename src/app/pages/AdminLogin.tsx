import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../routes'
import { useAdmin } from '../context/AdminContext'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export default function AdminLogin() {
  const navigate = useNavigate()
  const { isAdmin, login, logout } = useAdmin()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAdmin) {
    return (
      <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-5">
        <Card className="w-full max-w-sm text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-white text-2xl">
              🛡️
            </div>
            <div>
              <h1 className="font-bold text-lg text-[#1e293b]">管理员控制台</h1>
              <p className="text-sm text-[#64748b] mt-1">已登录</p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <Button fullWidth onClick={() => navigate(ROUTES.QUESTION_BANK)}>
                📚 题库管理
              </Button>
              <Button fullWidth variant="secondary" onClick={() => navigate(ROUTES.AI_GENERATE)}>
                🤖 AI 出题
              </Button>
              <Button fullWidth variant="outline" onClick={() => navigate(ROUTES.HOME)}>
                返回首页
              </Button>
              <Button fullWidth variant="ghost" onClick={() => { logout(); navigate(ROUTES.HOME) }}>
                退出登录
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    // 模拟异步（防止暴力破解感知）
    setTimeout(() => {
      const ok = login(password)
      setLoading(false)
      if (ok) {
        navigate(ROUTES.QUESTION_BANK)
      } else {
        setError('密码错误，请重试')
        setPassword('')
      }
    }, 400)
  }

  return (
    <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex flex-col items-center justify-center px-5">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-5 left-5 text-[#64748b] hover:text-[#1e293b] text-sm flex items-center gap-1"
      >
        ← 返回
      </button>

      <Card className="w-full max-w-sm animate-scale-in">
        <div className="flex flex-col items-center gap-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] flex items-center justify-center text-2xl">
            🔐
          </div>
          <h1 className="font-bold text-lg text-[#1e293b]">管理员登录</h1>
          <p className="text-sm text-[#64748b]">输入密码以进入管理控制台</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="密码"
            type="password"
            placeholder="请输入管理员密码"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={error}
            autoFocus
          />
          <Button type="submit" fullWidth loading={loading} disabled={!password}>
            登录
          </Button>
        </form>

        <p className="text-center text-xs text-[#94a3b8] mt-4">
          默认密码：admin123
        </p>
      </Card>
    </div>
  )
}
