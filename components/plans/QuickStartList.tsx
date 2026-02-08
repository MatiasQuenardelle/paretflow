'use client'

import { useState } from 'react'
import { Plus, Rocket } from 'lucide-react'
import { PlanItem } from '@/stores/planStore'
import { PlanItemRow } from './PlanItemRow'
import { useTranslations } from '@/lib/i18n'

interface QuickStartListProps {
  items: PlanItem[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onAdd: (text: string) => void
  onPush: (text: string, itemId: string) => void
}

export function QuickStartList({ items, onToggle, onDelete, onAdd, onPush }: QuickStartListProps) {
  const t = useTranslations()
  const [newText, setNewText] = useState('')

  const handleAdd = () => {
    if (!newText.trim()) return
    onAdd(newText.trim())
    setNewText('')
  }

  const completedCount = items.filter(i => i.completed).length

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Rocket size={18} className="text-blue-400" />
          <div>
            <h3 className="font-semibold">{t.plans.quickStartChecklist}</h3>
            <p className="text-xs text-muted">{t.plans.firstSevenDays}</p>
          </div>
        </div>
        <span className="text-sm text-muted">{completedCount}/{items.length} {t.plans.itemsCompleted}</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${items.length > 0 ? (completedCount / items.length) * 100 : 0}%` }}
        />
      </div>

      <div className="rounded-xl bg-white/5 border border-white/5 p-4">
        {items.map((item, index) => (
          <div key={item.id}>
            <div className="flex items-start gap-3">
              <span className="text-xs text-muted shrink-0 mt-2.5 w-5 text-right">{index + 1}.</span>
              <div className="flex-1">
                <PlanItemRow
                  text={item.text}
                  completed={item.completed}
                  hasPushed={!!item.generatedTaskId}
                  onToggle={() => onToggle(item.id)}
                  onPush={() => onPush(item.text, item.id)}
                  onDelete={() => onDelete(item.id)}
                />
              </div>
            </div>
            {index < items.length - 1 && <div className="border-b border-white/5 ml-8" />}
          </div>
        ))}

        {/* Add item */}
        <div className="flex gap-2 mt-3 ml-8">
          <input
            value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            placeholder={t.plans.addQuickStartItem}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50 placeholder:text-muted/50"
          />
          <button
            onClick={handleAdd}
            disabled={!newText.trim()}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-30"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
