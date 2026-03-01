import { useEffect, useState, useRef } from 'react'

interface TimerProps {
  seconds: number           // total seconds
  onExpire: () => void
  paused?: boolean
}

export function Timer({ seconds, onExpire, paused = false }: TimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (paused) return
    if (remaining <= 0) {
      onExpireRef.current()
      return
    }
    const id = setTimeout(() => setRemaining(r => r - 1), 1000)
    return () => clearTimeout(id)
  }, [remaining, paused])

  const pct = seconds > 0 ? (remaining / seconds) * 100 : 0
  const isWarning = pct < 30
  const isDanger = pct < 15

  const strokeColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#6366f1'
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const dashoffset = circumference * (1 - pct / 100)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx="30"
            cy="30"
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-lg font-bold"
          style={{ color: strokeColor }}
        >
          {remaining}
        </span>
      </div>
      <span className="text-xs text-[#64748b]">秒</span>
    </div>
  )
}
