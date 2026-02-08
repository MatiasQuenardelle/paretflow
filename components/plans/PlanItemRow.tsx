'use client'

import { Check, ArrowRight, Trash2 } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface PlanItemRowProps {
  text: string
  completed: boolean
  hasPushed?: boolean
  onToggle: () => void
  onPush?: () => void
  onDelete?: () => void
}

export function PlanItemRow({ text, completed, hasPushed, onToggle, onPush, onDelete }: PlanItemRowProps) {
  const t = useTranslations()

  return (
    <div className="flex items-center gap-3 py-2 group">
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
          completed
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-white/20 hover:border-white/40'
        }`}
      >
        {completed && <Check size={12} strokeWidth={3} />}
      </button>
      <span className={`flex-1 text-sm ${completed ? 'line-through text-muted' : ''}`}>
        {text}
      </span>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {onPush && !hasPushed && (
          <button
            onClick={onPush}
            title={t.plans.pushToTasks}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-blue-400 transition-colors"
          >
            <ArrowRight size={14} />
          </button>
        )}
        {hasPushed && (
          <span className="text-[10px] text-green-400 px-1.5">{t.plans.pushedToTasks}</span>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
