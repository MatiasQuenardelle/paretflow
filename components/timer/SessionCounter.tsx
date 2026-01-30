'use client'

import { Flame } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface SessionCounterProps {
  count: number
}

export function SessionCounter({ count }: SessionCounterProps) {
  const t = useTranslations()

  return (
    <div className="flex items-center justify-center gap-2 mt-6 text-muted">
      <Flame size={18} className={count > 0 ? 'text-orange-500' : ''} />
      <span className="text-sm">
        <span className="font-semibold text-foreground">{count}</span> {count !== 1 ? t.timer.sessionsToday : t.timer.sessionToday}
      </span>
    </div>
  )
}
