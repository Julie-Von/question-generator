import { type ButtonHTMLAttributes, forwardRef } from 'react'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary: 'bg-[#6366f1] hover:bg-[#4f46e5] text-white shadow-sm shadow-indigo-200 active:scale-[0.98]',
  secondary: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white shadow-sm shadow-purple-200 active:scale-[0.98]',
  outline: 'border border-[#e2e8f0] bg-white hover:bg-[#f8fafc] text-[#1e293b] active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-[#f1f5f9] text-[#64748b] hover:text-[#1e293b]',
  danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white active:scale-[0.98]',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg min-h-[36px]',
  md: 'px-4 py-2.5 text-sm rounded-xl min-h-[44px]',
  lg: 'px-6 py-3 text-base rounded-xl min-h-[52px]',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={[
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 cursor-pointer select-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? 'w-full' : '',
          (disabled ?? loading) ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
          className,
        ].join(' ')}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-r-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'
