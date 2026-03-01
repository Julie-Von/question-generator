import { type HTMLAttributes } from 'react'

type Color = 'indigo' | 'purple' | 'green' | 'yellow' | 'red' | 'gray' | 'blue'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  color?: Color
}

const colorClasses: Record<Color, string> = {
  indigo: 'bg-indigo-100 text-indigo-700',
  purple: 'bg-purple-100 text-purple-700',
  green: 'bg-green-100 text-green-700',
  yellow: 'bg-amber-100 text-amber-700',
  red: 'bg-red-100 text-red-700',
  gray: 'bg-slate-100 text-slate-600',
  blue: 'bg-blue-100 text-blue-700',
}

export function Badge({ color = 'indigo', className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        colorClasses[color],
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </span>
  )
}
