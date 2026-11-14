/**
 * Badge para etiquetas
 */

import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md'
  className?: string
}

const variantStyles = {
  default: 'bg-tierra-100 text-tierra-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-inti-100 text-inti-700',
}

const sizeStyles = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}: BadgeProps) {
  return (
    <span
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        rounded-full font-medium inline-block
        ${className}
      `}
    >
      {children}
    </span>
  )
}
