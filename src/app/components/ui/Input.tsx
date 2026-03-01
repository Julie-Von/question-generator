import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id ?? label

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#1e293b]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-all min-h-[44px]',
            'bg-white text-[#1e293b] placeholder:text-[#94a3b8]',
            error
              ? 'border-red-400 focus:ring-2 focus:ring-red-200'
              : 'border-[#e2e8f0] focus:border-[#6366f1] focus:ring-2 focus:ring-indigo-100',
            className,
          ].join(' ')}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[#94a3b8]">{hint}</p>}
      </div>
    )
  },
)

Input.displayName = 'Input'
