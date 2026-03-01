interface ProgressBarProps {
  current: number    // 1-based
  total: number
  showText?: boolean
}

export function ProgressBar({ current, total, showText = true }: ProgressBarProps) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="w-full">
      {showText && (
        <div className="flex justify-between text-xs text-[#64748b] mb-1.5">
          <span>第 {current} 题</span>
          <span>{current} / {total}</span>
        </div>
      )}
      <div className="w-full h-2 bg-[#e2e8f0] rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
