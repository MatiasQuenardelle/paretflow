'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ContentPillar } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'

const pillarColorMap: Record<string, { bg: string; bar: string; text: string }> = {
  blue: { bg: 'bg-blue-500/10', bar: 'bg-blue-500', text: 'text-blue-400' },
  green: { bg: 'bg-green-500/10', bar: 'bg-green-500', text: 'text-green-400' },
  purple: { bg: 'bg-purple-500/10', bar: 'bg-purple-500', text: 'text-purple-400' },
  orange: { bg: 'bg-orange-500/10', bar: 'bg-orange-500', text: 'text-orange-400' },
  red: { bg: 'bg-red-500/10', bar: 'bg-red-500', text: 'text-red-400' },
  pink: { bg: 'bg-pink-500/10', bar: 'bg-pink-500', text: 'text-pink-400' },
}

interface ContentPillarsChartProps {
  pillars: ContentPillar[]
  onAdd: (name: string, percentage: number) => void
  onDelete: (id: string) => void
}

export function ContentPillarsChart({ pillars, onAdd, onDelete }: ContentPillarsChartProps) {
  const t = useTranslations()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPercent, setNewPercent] = useState('10')

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim(), Number(newPercent) || 10)
    setNewName('')
    setNewPercent('10')
    setIsAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{t.plans.contentPillars}</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          {t.plans.addPillar}
        </button>
      </div>

      {/* Stacked bar */}
      <div className="h-6 rounded-full overflow-hidden flex mb-6">
        {pillars.map(pillar => {
          const colors = pillarColorMap[pillar.color] || pillarColorMap.blue
          return (
            <div
              key={pillar.id}
              className={`${colors.bar} transition-all duration-500 relative group`}
              style={{ width: `${pillar.percentage}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                {pillar.percentage}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Pillar cards */}
      <div className="space-y-3">
        {pillars.map(pillar => {
          const colors = pillarColorMap[pillar.color] || pillarColorMap.blue
          return (
            <div key={pillar.id} className={`p-3 rounded-xl ${colors.bg} border border-white/5 group`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colors.bar}`} />
                  <span className="font-medium text-sm">{pillar.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${colors.text}`}>{pillar.percentage}%</span>
                  <button
                    onClick={() => onDelete(pillar.id)}
                    className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted hover:text-red-400 transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${pillar.percentage}%` }}
                />
              </div>
              {pillar.description && (
                <p className="text-xs text-muted mt-2">{pillar.description}</p>
              )}
            </div>
          )
        })}
      </div>

      {isAdding && (
        <div className="mt-3 p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Pillar name"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
            autoFocus
          />
          <input
            type="number"
            value={newPercent}
            onChange={e => setNewPercent(e.target.value)}
            placeholder="%"
            className="w-20 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-medium"
            >
              {t.common.add}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg bg-white/10 text-sm"
            >
              {t.common.cancel}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
