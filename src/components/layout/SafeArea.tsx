/**
 * Safe Area wrapper para notch y home bar
 */

import { ReactNode } from 'react'

interface SafeAreaProps {
  children: ReactNode
  className?: string
}

export function SafeArea({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`
        flex flex-col
        pb-20 md:pb-4
        ${className}
      `}
      style={{
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'max(0rem, env(safe-area-inset-top))',
      }}
    >
      {children}
    </div>
  )
}
