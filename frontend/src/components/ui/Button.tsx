import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-300 transform
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
      hover:scale-[1.02] active:scale-[0.98]
    `

    const variants = {
      primary: `
        bg-accent-600 text-white
        hover:bg-accent-700
        shadow-lg shadow-accent-600/25 hover:shadow-xl hover:shadow-accent-600/30
        focus:ring-accent-500
      `,
      secondary: `
        bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white
        hover:bg-gray-200 dark:hover:bg-gray-700
        border border-gray-200 dark:border-gray-700
        focus:ring-gray-500
      `,
      outline: `
        bg-transparent border-2 border-primary-500 text-primary-600 dark:text-primary-400
        hover:bg-primary-50 dark:hover:bg-primary-900/20
        focus:ring-primary-500
      `,
      ghost: `
        bg-transparent text-gray-700 dark:text-gray-300
        hover:bg-gray-100 dark:hover:bg-gray-800
        focus:ring-gray-500
      `,
      danger: `
        bg-gradient-to-r from-red-500 to-red-600 text-white
        hover:from-red-600 hover:to-red-700
        shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30
        focus:ring-red-500
      `,
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-5 py-2.5 text-base gap-2',
      lg: 'px-7 py-3.5 text-lg gap-2.5',
    }

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
export type { ButtonProps }
