import { useState } from 'react'
import { type Question } from '../../types/question'
import { Badge } from '../ui/Badge'

interface QuestionCardProps {
  question: Question
  index: number
  selectedIds: string[]
  onSelect: (id: string) => void
  showAnswer?: boolean
  disabled?: boolean
}

const difficultyLabel = { easy: '简单', medium: '中等', hard: '困难' }
const difficultyColor = {
  easy: 'green' as const,
  medium: 'yellow' as const,
  hard: 'red' as const,
}
const typeLabel = { single: '单选', multiple: '多选', truefalse: '判断', short: '简答' }

export function QuestionCard({ question, index, selectedIds, onSelect, showAnswer = false, disabled = false }: QuestionCardProps) {
  const [revealed, setRevealed] = useState(false)
  const isMultiple = question.type === 'multiple'
  const isShort = question.type === 'short'

  function handleOptionClick(id: string) {
    if (disabled) return
    if (isMultiple) {
      // 多选：切换选中
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(s => s !== id).join(','))
      } else {
        onSelect([...selectedIds, id].join(','))
      }
    } else {
      onSelect(id)
    }
  }

  function getOptionState(id: string) {
    const isSelected = selectedIds.includes(id)
    const isCorrect = question.correctAnswers.includes(id)

    if (!showAnswer) {
      return isSelected ? 'selected' : 'default'
    }
    // 显示答案模式
    if (isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'wrong'
    return 'default'
  }

  const optionClasses: Record<string, string> = {
    default: 'border-[#e2e8f0] bg-white hover:border-[#6366f1] hover:bg-indigo-50',
    selected: 'border-[#6366f1] bg-indigo-50 text-[#4f46e5]',
    correct: 'border-[#22c55e] bg-green-50 text-green-700',
    wrong: 'border-[#ef4444] bg-red-50 text-red-700',
  }

  // ── Short-answer question UI ─────────────────────────────────────────────────
  if (isShort) {
    const showAnswerText = revealed || showAnswer || disabled
    const selfJudgedCorrect = selectedIds.includes('correct')
    const selfJudgedWrong = selectedIds.includes('wrong')

    return (
      <div className="animate-fade-in">
        {/* 题目标题区域 */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-sm font-semibold text-[#6366f1]">Q{index + 1}</span>
          <Badge color={difficultyColor[question.difficulty]}>{difficultyLabel[question.difficulty]}</Badge>
          <Badge color="gray">{typeLabel[question.type]}</Badge>
          <Badge color="indigo">{question.subject}</Badge>
        </div>

        {/* 题目内容 */}
        <p className="text-base md:text-lg font-medium text-[#1e293b] mb-4 leading-relaxed">
          {question.content}
        </p>

        {/* 查看答案 / 自判区域 */}
        {!showAnswerText ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-[#6366f1] text-[#6366f1] text-sm font-medium hover:bg-indigo-50 transition-all duration-150"
          >
            📋 查看答案
          </button>
        ) : (
          <div className="flex flex-col gap-3">
            {/* 参考答案 */}
            <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-semibold text-[#6366f1] mb-1">💡 参考答案</p>
              <p className="text-base font-medium text-[#1e293b]">{question.correctAnswer}</p>
            </div>

            {/* 自判按钮（未提交时显示） */}
            {!disabled && !selfJudgedCorrect && !selfJudgedWrong && (
              <div className="flex gap-3">
                <button
                  onClick={() => onSelect('correct')}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[#22c55e] bg-green-50 text-green-700 text-sm font-semibold hover:bg-green-100 transition-all duration-150"
                >
                  ✅ 答对了
                </button>
                <button
                  onClick={() => onSelect('wrong')}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-[#ef4444] bg-red-50 text-red-700 text-sm font-semibold hover:bg-red-100 transition-all duration-150"
                >
                  ❌ 答错了
                </button>
              </div>
            )}

            {/* 已自判时显示状态 */}
            {(selfJudgedCorrect || selfJudgedWrong) && (
              <div className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold ${
                selfJudgedCorrect
                  ? 'border-[#22c55e] bg-green-50 text-green-700'
                  : 'border-[#ef4444] bg-red-50 text-red-700'
              }`}>
                {selfJudgedCorrect ? '✅ 自判正确' : '❌ 自判错误'}
              </div>
            )}
          </div>
        )}

        {/* 解析（showAnswer 模式） */}
        {showAnswer && question.explanation && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs font-semibold text-[#6366f1] mb-1">解析</p>
            <p className="text-sm text-[#475569] leading-relaxed">{question.explanation}</p>
          </div>
        )}
      </div>
    )
  }

  // ── Multiple-choice / true-false question UI (original) ──────────────────────
  return (
    <div className="animate-fade-in">
      {/* 题目标题区域 */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-[#6366f1]">Q{index + 1}</span>
        <Badge color={difficultyColor[question.difficulty]}>{difficultyLabel[question.difficulty]}</Badge>
        <Badge color="gray">{typeLabel[question.type]}</Badge>
        <Badge color="indigo">{question.subject}</Badge>
        {isMultiple && (
          <Badge color="purple">可多选</Badge>
        )}
      </div>

      {/* 题目内容 */}
      <p className="text-base md:text-lg font-medium text-[#1e293b] mb-4 leading-relaxed">
        {question.content}
      </p>

      {/* 选项 */}
      <div className="flex flex-col gap-2.5">
        {(question.options ?? []).map(opt => {
          const state = getOptionState(opt.id)
          return (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              disabled={disabled}
              className={[
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 text-sm text-left transition-all duration-150 min-h-[48px]',
                'font-medium',
                disabled ? 'cursor-default' : 'cursor-pointer',
                optionClasses[state] ?? optionClasses.default,
              ].join(' ')}
            >
              <span
                className={[
                  'flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold uppercase',
                  state === 'selected' ? 'border-[#6366f1] bg-[#6366f1] text-white' :
                  state === 'correct'  ? 'border-green-500 bg-green-500 text-white' :
                  state === 'wrong'    ? 'border-red-500 bg-red-500 text-white' :
                  'border-[#cbd5e1] text-[#64748b]',
                ].join(' ')}
              >
                {opt.id.length === 1 ? opt.id : (state === 'correct' ? '✓' : state === 'wrong' ? '✗' : '·')}
              </span>
              <span className="flex-1">{opt.text}</span>
            </button>
          )
        })}
      </div>

      {/* 解析（showAnswer 模式） */}
      {showAnswer && question.explanation && (
        <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs font-semibold text-[#6366f1] mb-1">解析</p>
          <p className="text-sm text-[#475569] leading-relaxed">{question.explanation}</p>
        </div>
      )}
    </div>
  )
}
