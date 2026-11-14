/**
 * Botón genérico con variantes
 */

import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  title?: string
  ariaLabel?: string
}

const variantStyles = {
  primary: 'bg-inti text-noche font-semibold hover:bg-inti-700 active:bg-inti-800',
  secondary: 'bg-tierra text-white font-semibold hover:bg-tierra-700 active:bg-tierra-800',
  danger: 'bg-red-600 text-white font-semibold hover:bg-red-700 active:bg-red-800',
  ghost: 'bg-transparent text-tierra font-medium hover:bg-tierra-50 active:bg-tierra-100',
}

const sizeStyles = {
  sm: 'px-3 py-2 text-sm rounded-lg',
  md: 'px-4 py-3 text-base rounded-lg',
  lg: 'px-6 py-4 text-lg rounded-lg',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  type = 'button',
  title,
  ariaLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      title={title}
      aria-label={ariaLabel}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        min-h-[44px] min-w-[44px]
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-inti
        ${className}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Cargando...</span>
        </span>
      ) : (
        children
      )}
    </button>
  )
}
