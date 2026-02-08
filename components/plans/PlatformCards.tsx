'use client'

import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { PlatformChannel } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'

const platformColorMap: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  red: { bg: 'from-red-500/10 to-red-600/10', border: 'border-red-500/20', text: 'text-red-400', icon: 'bg-red-500' },
  pink: { bg: 'from-pink-500/10 to-pink-600/10', border: 'border-pink-500/20', text: 'text-pink-400', icon: 'bg-pink-500' },
  sky: { bg: 'from-sky-500/10 to-sky-600/10', border: 'border-sky-500/20', text: 'text-sky-400', icon: 'bg-sky-500' },
  blue: { bg: 'from-blue-500/10 to-blue-600/10', border: 'border-blue-500/20', text: 'text-blue-400', icon: 'bg-blue-500' },
  green: { bg: 'from-green-500/10 to-green-600/10', border: 'border-green-500/20', text: 'text-green-400', icon: 'bg-green-500' },
  purple: { bg: 'from-purple-500/10 to-purple-600/10', border: 'border-purple-500/20', text: 'text-purple-400', icon: 'bg-purple-500' },
  orange: { bg: 'from-orange-500/10 to-orange-600/10', border: 'border-orange-500/20', text: 'text-orange-400', icon: 'bg-orange-500' },
}

interface PlatformCardsProps {
  platforms: PlatformChannel[]
  onAdd: (name: string, hours: number) => void
  onDelete: (id: string) => void
}

export function PlatformCards({ platforms, onAdd, onDelete }: PlatformCardsProps) {
  const t = useTranslations()
  const [isAdding, setIsAdding] = useState(false)
  const [newName, setNewName] = useState('')
  const [newHours, setNewHours] = useState('5')

  const totalHours = platforms.reduce((sum, p) => sum + p.hoursPerWeek, 0)

  const handleAdd = () => {
    if (!newName.trim()) return
    onAdd(newName.trim(), Number(newHours) || 5)
    setNewName('')
    setNewHours('5')
    setIsAdding(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold">{t.plans.platformStrategy}</h3>
          <p className="text-xs text-muted mt-0.5">
            {t.plans.totalHours}: {totalHours} {t.plans.hoursPerWeek}
          </p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-sm transition-colors flex items-center gap-1.5"
        >
          <Plus size={14} />
          {t.plans.addPlatform}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {platforms.map(platform => {
          const colors = platformColorMap[platform.color] || platformColorMap.blue
          const widthPercent = totalHours > 0 ? (platform.hoursPerWeek / totalHours) * 100 : 0

          return (
            <div
              key={platform.id}
              className={`p-4 rounded-xl bg-gradient-to-br ${colors.bg} border ${colors.border} group`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors.icon}`} />
                  <h4 className="font-medium text-sm">{platform.name}</h4>
                </div>
                <button
                  onClick={() => onDelete(platform.id)}
                  className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted hover:text-red-400 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-2">
                <Clock size={14} className={colors.text} />
                <span className={`text-lg font-bold ${colors.text}`}>{platform.hoursPerWeek}</span>
                <span className="text-xs text-muted">{t.plans.hoursPerWeek}</span>
              </div>

              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full ${colors.icon} rounded-full transition-all duration-500`}
                  style={{ width: `${widthPercent}%` }}
                />
              </div>

              {platform.notes && (
                <p className="text-xs text-muted mt-2">{platform.notes}</p>
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
            placeholder="Platform name"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
            autoFocus
          />
          <input
            type="number"
            value={newHours}
            onChange={e => setNewHours(e.target.value)}
            placeholder="Hours/week"
            className="w-24 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
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
