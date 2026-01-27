'use client'

import { Flame } from 'lucide-react'

interface SessionCounterProps {
  count: number
}

export function SessionCounter({ count }: SessionCounterProps) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6 text-muted">
      <Flame size={18} className={count > 0 ? 'text-orange-500' : ''} />
      <span className="text-sm">
        <span className="font-semibold text-foreground">{count}</span> session{count !== 1 ? 's' : ''} today
      </span>
    </div>
  )
}
