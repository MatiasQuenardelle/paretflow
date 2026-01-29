'use client'

import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl p-6 shadow-xl shadow-black/5 dark:shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}
