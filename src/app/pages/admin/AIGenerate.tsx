import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes'
import { useAdmin } from '../../context/AdminContext'
import {
  AI_PROVIDERS,
  generateQuestions,
  type AIProviderType,
  type GenerateConfig,
} from '../../utils/aiGenerator'
import { loadQuestions, saveQuestions } from '../../utils/questionBank'
import { SUBJECTS } from '../../data/initialQuestions'
import type { Question, Difficulty, QuestionType } from '../../types/question'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Badge } from '../../components/ui/Badge'

const QUESTION_TYPE_OPTS = [
  { value: 'mixed', label: '混合类型' },
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'truefalse', label: '判断题' },
]

const DIFFICULTY_OPTS = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

const diffColor = { easy: 'green' as const, medium: 'yellow' as const, hard: 'red' as const }

export default function AIGenerate() {
  const navigate = useNavigate()
  const { isAdmin, aiKeys, setAIKey } = useAdmin()

  const [provider, setProvider] = useState<AIProviderType>('qianwen')
  const [tempKey, setTempKey] = useState(aiKeys[provider] ?? '')

  const [config, setConfig] = useState<GenerateConfig>({
    subject: SUBJECTS[0],
    difficulty: 'medium',
    count: 5,
    questionType: 'mixed',
    extraPrompt: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [generated, setGenerated] = useState<Question[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [imported, setImported] = useState(false)

  if (!isAdmin) {
    navigate(ROUTES.ADMIN_LOGIN)
    return null
  }

  function handleProviderChange(p: AIProviderType) {
    setProvider(p)
    setTempKey(aiKeys[p] ?? '')
  }

  function handleSaveKey() {
    setAIKey(provider, tempKey.trim())
  }

  async function handleGenerate() {
    const apiKey = tempKey.trim() || aiKeys[provider] || ''
    if (!apiKey) {
      setError('请先填写 API Key')
      return
    }
    setLoading(true)
    setError('')
    setGenerated([])
    setSelected(new Set())
    setImported(false)
    try {
      const questions = await generateQuestions(provider, apiKey, config)
      setGenerated(questions)
      setSelected(new Set(questions.map(q => q.id)))
      handleSaveKey()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI 出题失败，请检查 API Key 和网络')
    } finally {
      setLoading(false)
    }
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleImport() {
    const toImport = generated.filter(q => selected.has(q.id))
    const existing = loadQuestions()
    saveQuestions([...existing, ...toImport])
    setImported(true)
    setSelected(new Set())
  }

  const currentProvider = AI_PROVIDERS.find(p => p.id === provider)!
  const subjectOpts = SUBJECTS.map(s => ({ value: s, label: s }))

  return (
    <div className="min-h-dvh bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-5 py-4 md:px-8 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.QUESTION_BANK)} className="text-[#64748b] hover:text-[#1e293b]">←</button>
            <div>
              <h1 className="font-bold text-base text-[#1e293b]">🤖 AI 出题</h1>
              <p className="text-xs text-[#64748b]">智能生成题目并导入题库</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-5 py-5 md:px-8 flex flex-col gap-5">
        {/* Step 1: 选择服务商 + API Key */}
        <Card>
          <h2 className="font-semibold text-sm text-[#1e293b] mb-3">① 选择 AI 服务商</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            {AI_PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={[
                  'flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs transition-all',
                  provider === p.id
                    ? 'border-[#6366f1] bg-indigo-50'
                    : 'border-[#e2e8f0] hover:border-[#6366f1] bg-white',
                ].join(' ')}
              >
                <span className="font-semibold text-[#1e293b] text-center leading-tight">{p.name}</span>
                <span className="text-[#94a3b8] text-center leading-tight">{p.description}</span>
                {aiKeys[p.id] && (
                  <span className="text-green-600 text-xs">✓ 已配置</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                label={`${currentProvider.name} API Key`}
                type="password"
                placeholder="粘贴你的 API Key..."
                value={tempKey}
                onChange={e => setTempKey(e.target.value)}
                hint={`API 地址：${currentProvider.baseURL}`}
              />
            </div>
            <Button size="md" variant="outline" onClick={handleSaveKey} disabled={!tempKey.trim()}>
              保存
            </Button>
          </div>
        </Card>

        {/* Step 2: 出题配置 */}
        <Card>
          <h2 className="font-semibold text-sm text-[#1e293b] mb-3">② 配置出题参数</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <Select
              label="科目"
              value={config.subject}
              onChange={e => setConfig(c => ({ ...c, subject: e.target.value }))}
              options={subjectOpts}
            />
            <Select
              label="难度"
              value={config.difficulty}
              onChange={e => setConfig(c => ({ ...c, difficulty: e.target.value as Difficulty }))}
              options={DIFFICULTY_OPTS}
            />
            <Select
              label="题目类型"
              value={config.questionType}
              onChange={e => setConfig(c => ({ ...c, questionType: e.target.value as QuestionType | 'mixed' }))}
              options={QUESTION_TYPE_OPTS}
            />
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-[#1e293b]">题目数量</label>
                <span className="text-sm font-bold text-[#6366f1]">{config.count} 道</span>
              </div>
              <input
                type="range"
                min={1}
                max={20}
                value={config.count}
                onChange={e => setConfig(c => ({ ...c, count: Number(e.target.value) }))}
                className="accent-[#6366f1] mt-3"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1e293b]">额外提示（可选）</label>
            <textarea
              value={config.extraPrompt}
              onChange={e => setConfig(c => ({ ...c, extraPrompt: e.target.value }))}
              placeholder="例如：侧重应用题、结合实际生活场景..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm outline-none resize-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </Card>

        {/* 生成按钮 */}
        <Button
          fullWidth
          size="lg"
          loading={loading}
          onClick={handleGenerate}
        >
          {loading ? 'AI 生成中...' : `🤖 生成 ${config.count} 道题目`}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Step 3: 预览生成结果 */}
        {generated.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-sm text-[#1e293b]">
                ③ 预览生成结果（已生成 {generated.length} 道）
              </h2>
              <div className="flex gap-2">
                <button
                  className="text-xs text-[#6366f1]"
                  onClick={() => setSelected(new Set(generated.map(q => q.id)))}
                >
                  全选
                </button>
                <span className="text-[#e2e8f0]">|</span>
                <button
                  className="text-xs text-[#94a3b8]"
                  onClick={() => setSelected(new Set())}
                >
                  取消全选
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              {generated.map(q => (
                <div
                  key={q.id}
                  onClick={() => toggleSelect(q.id)}
                  className={[
                    'p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                    selected.has(q.id) ? 'border-[#6366f1] bg-indigo-50' : 'border-[#e2e8f0] bg-white',
                  ].join(' ')}
                >
                  <div className="flex items-start gap-2">
                    <div className={[
                      'flex-shrink-0 w-5 h-5 rounded border-2 mt-0.5 flex items-center justify-center',
                      selected.has(q.id) ? 'border-[#6366f1] bg-[#6366f1]' : 'border-[#e2e8f0]',
                    ].join(' ')}>
                      {selected.has(q.id) && <span className="text-white text-xs">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-1.5">
                        <Badge color={diffColor[q.difficulty]}>
                          {DIFFICULTY_OPTS.find(d => d.value === q.difficulty)?.label}
                        </Badge>
                        <Badge color="gray">
                          {QUESTION_TYPE_OPTS.find(t => t.value === q.type)?.label}
                        </Badge>
                      </div>
                      <p className="text-sm font-medium text-[#1e293b] mb-2">{q.content}</p>
                      <div className="flex flex-col gap-1">
                        {q.options.map(opt => (
                          <div
                            key={opt.id}
                            className={[
                              'text-xs px-2 py-1 rounded-lg',
                              q.correctAnswers.includes(opt.id)
                                ? 'bg-green-100 text-green-700 font-medium'
                                : 'text-[#64748b]',
                            ].join(' ')}
                          >
                            {opt.id.toUpperCase()}. {opt.text}
                          </div>
                        ))}
                      </div>
                      {q.explanation && (
                        <p className="text-xs text-[#94a3b8] mt-1.5 italic">{q.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imported ? (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-700 font-medium text-sm">✓ 已成功导入题库！</p>
                <button
                  className="text-xs text-[#6366f1] mt-1"
                  onClick={() => navigate(ROUTES.QUESTION_BANK)}
                >
                  查看题库
                </button>
              </div>
            ) : (
              <Button
                fullWidth
                variant="secondary"
                disabled={selected.size === 0}
                onClick={handleImport}
              >
                导入所选 {selected.size} 道题目到题库
              </Button>
            )}
          </Card>
        )}
      </main>
    </div>
  )
}
