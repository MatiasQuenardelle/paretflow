'use client'

import { Phase } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'

const phaseColorMap: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', bar: 'bg-blue-500' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', bar: 'bg-green-500' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', bar: 'bg-purple-500' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', bar: 'bg-orange-500' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', bar: 'bg-red-500' },
}

export function PhaseTimeline({ phases, selectedId, onSelect }: {
  phases: Phase[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const t = useTranslations()

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {phases.map(phase => {
        const colors = phaseColorMap[phase.color] || phaseColorMap.blue
        const totalMs = phase.milestones.length
        const doneMs = phase.milestones.filter(m => m.completed).length
        const progress = totalMs > 0 ? (doneMs / totalMs) * 100 : 0
        const isSelected = selectedId === phase.id

        return (
          <button
            key={phase.id}
            onClick={() => onSelect(phase.id)}
            className={`shrink-0 w-44 p-3 rounded-xl border transition-all text-left ${colors.bg} ${
              isSelected ? `${colors.border} ring-1 ring-${phase.color}-500/20` : 'border-white/5 hover:border-white/15'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>
                {phase.name}
              </span>
            </div>
            {phase.startMonth && phase.endMonth && (
              <p className="text-[10px] text-muted mb-2">
                {t.plans.months} {phase.startMonth}–{phase.endMonth}
              </p>
            )}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[10px] text-muted mt-1">
              {doneMs}/{totalMs} {t.plans.milestonesCompleted}
            </p>
          </button>
        )
      })}
    </div>
  )
}
