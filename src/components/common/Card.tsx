/**
 * Tarjeta genérica para contenido
 */

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  className?: string
  onClick?: () => void
  title?: string
}

const variantStyles = {
  default: 'bg-white shadow-sm border border-tierra-100',
  elevated: 'bg-white shadow-lg border border-tierra-100',
  outlined: 'bg-transparent border-2 border-tierra-200',
}

export function Card({
  children,
  variant = 'default',
  className = '',
  onClick,
  title,
}: CardProps) {
  return (
    <div
      className={`
        ${variantStyles[variant]}
        rounded-xl p-5 md:p-6
        transition-all duration-200
        ${onClick ? 'cursor-pointer hover:shadow-md active:shadow-sm' : ''}
        ${className}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onClick()
        }
      }}
      title={title}
    >
      {children}
    </div>
  )
}
