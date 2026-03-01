import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../routes'
import { useAdmin } from '../../context/AdminContext'
import { loadQuestions, saveQuestions, deleteQuestion, generateId } from '../../utils/questionBank'
import { SUBJECTS } from '../../data/initialQuestions'
import type { Question, Difficulty, QuestionType } from '../../types/question'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'

const DIFFICULTY_OPTS = [
  { value: 'easy', label: '简单' },
  { value: 'medium', label: '中等' },
  { value: 'hard', label: '困难' },
]

const TYPE_OPTS = [
  { value: 'single', label: '单选题' },
  { value: 'multiple', label: '多选题' },
  { value: 'truefalse', label: '判断题' },
]

const diffColor = { easy: 'green' as const, medium: 'yellow' as const, hard: 'red' as const }

export default function QuestionBank() {
  const navigate = useNavigate()
  const { isAdmin } = useAdmin()
  const [questions, setQuestions] = useState<Question[]>(() => loadQuestions())
  const [search, setSearch] = useState('')
  const [filterSubject, setFilterSubject] = useState('all')
  const [filterDiff, setFilterDiff] = useState('all')
  const [editing, setEditing] = useState<Question | null>(null)
  const [isNew, setIsNew] = useState(false)

  if (!isAdmin) {
    navigate(ROUTES.ADMIN_LOGIN)
    return null
  }

  const filtered = questions.filter(q => {
    const matchSearch = !search || q.content.includes(search) || q.subject.includes(search)
    const matchSubject = filterSubject === 'all' || q.subject === filterSubject
    const matchDiff = filterDiff === 'all' || q.difficulty === filterDiff
    return matchSearch && matchSubject && matchDiff
  })

  function handleDelete(id: string) {
    if (!confirm('确认删除该题目？')) return
    const updated = deleteQuestion(id)
    setQuestions(updated)
  }

  function handleEdit(q: Question) {
    setEditing({ ...q })
    setIsNew(false)
  }

  function handleNewQuestion() {
    setEditing({
      id: generateId(),
      type: 'single',
      subject: SUBJECTS[0],
      difficulty: 'easy',
      content: '',
      options: [
        { id: 'a', text: '' },
        { id: 'b', text: '' },
        { id: 'c', text: '' },
        { id: 'd', text: '' },
      ],
      correctAnswers: ['a'],
      explanation: '',
      tags: [],
      createdAt: Date.now(),
    })
    setIsNew(true)
  }

  function handleSave() {
    if (!editing) return
    const list = isNew
      ? [...questions, editing]
      : questions.map(q => (q.id === editing.id ? editing : q))
    saveQuestions(list)
    setQuestions(list)
    setEditing(null)
  }

  const subjects = ['all', ...new Set(questions.map(q => q.subject))]

  return (
    <div className="min-h-dvh bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-white border-b border-[#e2e8f0] px-5 py-4 md:px-8 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(ROUTES.ADMIN_LOGIN)} className="text-[#64748b] hover:text-[#1e293b]">
              ←
            </button>
            <div>
              <h1 className="font-bold text-base text-[#1e293b]">题库管理</h1>
              <p className="text-xs text-[#64748b]">共 {questions.length} 道题</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => navigate(ROUTES.AI_GENERATE)}>
              🤖 AI 出题
            </Button>
            <Button size="sm" onClick={handleNewQuestion}>
              + 新增题目
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-5 md:px-8">
        {/* 过滤栏 */}
        <Card className="mb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              placeholder="搜索题目内容..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <Select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              options={subjects.map(s => ({ value: s, label: s === 'all' ? '全部科目' : s }))}
            />
            <Select
              value={filterDiff}
              onChange={e => setFilterDiff(e.target.value)}
              options={[
                { value: 'all', label: '全部难度' },
                ...DIFFICULTY_OPTS,
              ]}
            />
          </div>
        </Card>

        {/* 题目列表（移动端卡片式，桌面端表格式） */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 ? (
            <Card className="text-center py-12 text-[#94a3b8]">暂无符合条件的题目</Card>
          ) : (
            filtered.map(q => (
              <Card key={q.id} padding="sm">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1.5 mb-1.5">
                      <Badge color={diffColor[q.difficulty]}>
                        {DIFFICULTY_OPTS.find(d => d.value === q.difficulty)?.label}
                      </Badge>
                      <Badge color="indigo">{q.subject}</Badge>
                      <Badge color="gray">{TYPE_OPTS.find(t => t.value === q.type)?.label}</Badge>
                    </div>
                    <p className="text-sm text-[#1e293b] line-clamp-2">{q.content}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(q)}>编辑</Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(q.id)}>删除</Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>

      {/* 编辑弹窗 */}
      {editing && (
        <EditModal
          question={editing}
          isNew={isNew}
          onChange={setEditing}
          onSave={handleSave}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}

function EditModal({
  question,
  isNew,
  onChange,
  onSave,
  onClose,
}: {
  question: Question
  isNew: boolean
  onChange: (q: Question) => void
  onSave: () => void
  onClose: () => void
}) {
  const subjectOpts = SUBJECTS.map(s => ({ value: s, label: s }))

  function updateOption(idx: number, text: string) {
    const options = (question.options ?? []).map((o, i) => i === idx ? { ...o, text } : o)
    onChange({ ...question, options })
  }

  function toggleCorrect(id: string) {
    const curr = question.correctAnswers
    if (question.type === 'single' || question.type === 'truefalse') {
      onChange({ ...question, correctAnswers: [id] })
    } else {
      const next = curr.includes(id) ? curr.filter(c => c !== id) : [...curr, id]
      onChange({ ...question, correctAnswers: next.length ? next : curr })
    }
  }

  function handleTypeChange(t: QuestionType) {
    const defaultOpts = t === 'truefalse'
      ? [{ id: 'true', text: '正确' }, { id: 'false', text: '错误' }]
      : [{ id: 'a', text: '' }, { id: 'b', text: '' }, { id: 'c', text: '' }, { id: 'd', text: '' }]
    onChange({ ...question, type: t, options: defaultOpts, correctAnswers: [defaultOpts[0].id] })
  }

  const canSave = question.content.trim().length > 0 &&
    (question.options ?? []).every(o => o.text.trim().length > 0) &&
    question.correctAnswers.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90dvh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 bg-white border-b border-[#f1f5f9] px-5 py-4 flex items-center justify-between">
          <h2 className="font-bold text-base text-[#1e293b]">{isNew ? '新增题目' : '编辑题目'}</h2>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#1e293b] text-xl">✕</button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {/* 类型 */}
          <div>
            <label className="text-sm font-medium text-[#1e293b] mb-1.5 block">题目类型</label>
            <div className="flex gap-2">
              {TYPE_OPTS.map(t => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value as QuestionType)}
                  className={[
                    'flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all min-h-[40px]',
                    question.type === t.value
                      ? 'border-[#6366f1] bg-indigo-50 text-[#4f46e5]'
                      : 'border-[#e2e8f0] text-[#64748b]',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 科目 + 难度 */}
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="科目"
              value={question.subject}
              onChange={e => onChange({ ...question, subject: e.target.value })}
              options={subjectOpts}
            />
            <Select
              label="难度"
              value={question.difficulty}
              onChange={e => onChange({ ...question, difficulty: e.target.value as Difficulty })}
              options={DIFFICULTY_OPTS}
            />
          </div>

          {/* 题目内容 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1e293b]">题目内容</label>
            <textarea
              value={question.content}
              onChange={e => onChange({ ...question, content: e.target.value })}
              placeholder="请输入题目内容..."
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm outline-none resize-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          {/* 选项 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#1e293b]">
              选项
              <span className="text-xs text-[#94a3b8] ml-1">
                （{question.type === 'multiple' ? '可多选' : '单选'}正确答案）
              </span>
            </label>
            {(question.options ?? []).map((opt, idx) => (
              <div key={opt.id} className="flex items-center gap-2">
                <button
                  onClick={() => toggleCorrect(opt.id)}
                  className={[
                    'flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase transition-all',
                    question.correctAnswers.includes(opt.id)
                      ? 'border-green-500 bg-green-500 text-white'
                      : 'border-[#e2e8f0] text-[#94a3b8]',
                  ].join(' ')}
                >
                  {opt.id}
                </button>
                {question.type === 'truefalse' ? (
                  <span className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm text-[#1e293b] bg-[#f8fafc]">
                    {opt.text}
                  </span>
                ) : (
                  <input
                    type="text"
                    value={opt.text}
                    onChange={e => updateOption(idx, e.target.value)}
                    placeholder={`选项 ${opt.id.toUpperCase()}`}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm outline-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100 min-h-[44px]"
                  />
                )}
              </div>
            ))}
          </div>

          {/* 解析 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#1e293b]">解析（可选）</label>
            <textarea
              value={question.explanation ?? ''}
              onChange={e => onChange({ ...question, explanation: e.target.value })}
              placeholder="填写解析，帮助学员理解..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm outline-none resize-none focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={onClose}>取消</Button>
            <Button fullWidth disabled={!canSave} onClick={onSave}>保存</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
