'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Phase } from '@/stores/planStore'
import { PlanItemRow } from './PlanItemRow'
import { useTranslations } from '@/lib/i18n'

const phaseColors: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400' },
  green: { bg: 'from-green-500/10 to-green-600/10', border: 'border-green-500/20', text: 'text-green-400' },
  purple: { bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400' },
  orange: { bg: 'from-orange-500/10 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400' },
}

interface PhaseCardProps {
  phase: Phase
  onToggleMilestone: (milestoneId: string) => void
  onDeleteMilestone: (milestoneId: string) => void
  onAddMilestone: (title: string) => void
  onToggleItem: (milestoneId: string, itemId: string) => void
  onDeleteItem: (milestoneId: string, itemId: string) => void
  onAddItem: (milestoneId: string, text: string) => void
  onPushItem: (text: string, itemId: string, milestoneId: string) => void
}

export function PhaseCard({
  phase,
  onToggleMilestone,
  onDeleteMilestone,
  onAddMilestone,
  onToggleItem,
  onDeleteItem,
  onAddItem,
  onPushItem,
}: PhaseCardProps) {
  const t = useTranslations()
  const colors = phaseColors[phase.color] || phaseColors.blue
  const [expandedMs, setExpandedMs] = useState<Set<string>>(new Set(phase.milestones.map(m => m.id)))
  const [newMilestoneText, setNewMilestoneText] = useState('')
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null)
  const [newItemText, setNewItemText] = useState('')

  const toggleExpanded = (msId: string) => {
    setExpandedMs(prev => {
      const next = new Set(prev)
      if (next.has(msId)) next.delete(msId)
      else next.add(msId)
      return next
    })
  }

  const handleAddMilestone = () => {
    if (!newMilestoneText.trim()) return
    onAddMilestone(newMilestoneText.trim())
    setNewMilestoneText('')
  }

  const handleAddItem = (msId: string) => {
    if (!newItemText.trim()) return
    onAddItem(msId, newItemText.trim())
    setNewItemText('')
    setAddingItemTo(null)
  }

  return (
    <div className={`rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} p-4`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className={`font-semibold ${colors.text}`}>{phase.name}</h3>
          {phase.description && <p className="text-xs text-muted mt-0.5">{phase.description}</p>}
        </div>
        {phase.startMonth && phase.endMonth && (
          <span className="text-xs text-muted shrink-0">{t.plans.months} {phase.startMonth}–{phase.endMonth}</span>
        )}
      </div>

      <div className="space-y-3">
        {phase.milestones.map(ms => {
          const isExpanded = expandedMs.has(ms.id)
          const totalItems = ms.items.length
          const doneItems = ms.items.filter(i => i.completed).length

          return (
            <div key={ms.id} className="rounded-lg bg-white/5 border border-white/5">
              <button
                onClick={() => toggleExpanded(ms.id)}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 transition-colors rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={ms.completed}
                  onChange={(e) => { e.stopPropagation(); onToggleMilestone(ms.id) }}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded accent-green-500"
                />
                <span className={`flex-1 text-sm font-medium ${ms.completed ? 'line-through text-muted' : ''}`}>
                  {ms.title}
                </span>
                {totalItems > 0 && (
                  <span className="text-xs text-muted">{doneItems}/{totalItems}</span>
                )}
                <ChevronDown size={14} className={`text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 border-t border-white/5">
                  <div className="pl-7 pt-2">
                    {ms.items.map(item => (
                      <PlanItemRow
                        key={item.id}
                        text={item.text}
                        completed={item.completed}
                        hasPushed={!!item.generatedTaskId}
                        onToggle={() => onToggleItem(ms.id, item.id)}
                        onPush={() => onPushItem(item.text, item.id, ms.id)}
                        onDelete={() => onDeleteItem(ms.id, item.id)}
                      />
                    ))}

                    {addingItemTo === ms.id ? (
                      <div className="flex gap-2 mt-2">
                        <input
                          value={newItemText}
                          onChange={e => setNewItemText(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddItem(ms.id); if (e.key === 'Escape') setAddingItemTo(null) }}
                          placeholder={t.plans.addItem}
                          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingItemTo(ms.id); setNewItemText('') }}
                        className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground mt-2 py-1 transition-colors"
                      >
                        <Plus size={12} />
                        {t.plans.addItem}
                      </button>
                    )}
                  </div>

                  <div className="flex justify-end mt-1">
                    <button
                      onClick={() => onDeleteMilestone(ms.id)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Add milestone */}
      <div className="flex gap-2 mt-3">
        <input
          value={newMilestoneText}
          onChange={e => setNewMilestoneText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddMilestone() }}
          placeholder={t.plans.addMilestone}
          className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-muted/50"
        />
        <button
          onClick={handleAddMilestone}
          disabled={!newMilestoneText.trim()}
          className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  )
}
