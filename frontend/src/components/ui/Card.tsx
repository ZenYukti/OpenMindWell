import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'gradient' | 'outlined'
  hover?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      hover = true,
      padding = 'md',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-2xl transition-all duration-300
    `

    const variants = {
      default: `
        bg-white dark:bg-gray-800 
        border border-gray-100 dark:border-gray-700
        shadow-sm
      `,
      glass: `
        glass
      `,
      gradient: `
        bg-white dark:bg-gray-800
        border border-gray-100 dark:border-gray-700
        shadow-sm
      `,
      outlined: `
        bg-transparent
        border-2 border-gray-200 dark:border-gray-700
      `,
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const hoverStyles = hover
      ? 'hover:shadow-xl hover:scale-[1.01] cursor-default'
      : ''

    return (
      <div
        ref={ref}
        className={cn(baseStyles, variants[variant], paddings[padding], hoverStyles, className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode
  iconColor?: 'primary' | 'purple' | 'blue' | 'green' | 'orange' | 'red'
  action?: React.ReactNode
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, icon, iconColor = 'primary', action, children, ...props }, ref) => {
    const iconColors = {
      primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    }

    return (
      <div
        ref={ref}
        className={cn('flex items-center justify-between mb-5', className)}
        {...props}
      >
        <h2 className="text-lg font-semibold flex items-center gap-3 text-gray-900 dark:text-white">
          {icon && (
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', iconColors[iconColor])}>
              {icon}
            </div>
          )}
          {children}
        </h2>
        {action}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('', className)} {...props} />
  )
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mt-5 pt-5 border-t border-gray-100 dark:border-gray-700', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

export { Card, CardHeader, CardContent, CardFooter }
export type { CardProps, CardHeaderProps, CardContentProps, CardFooterProps }
