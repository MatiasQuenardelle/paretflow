'use client'

import { useState } from 'react'
import { Plus, Trash2, Clock } from 'lucide-react'
import { WeeklyDayTemplate, WeeklyBlock } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'
import { formatTimeSlot } from '@/lib/utils'

const blockColorMap: Record<string, string> = {
  blue: 'bg-blue-500/15 border-blue-500/20',
  purple: 'bg-purple-500/15 border-purple-500/20',
  green: 'bg-green-500/15 border-green-500/20',
  orange: 'bg-orange-500/15 border-orange-500/20',
  red: 'bg-red-500/15 border-red-500/20',
  pink: 'bg-pink-500/15 border-pink-500/20',
  sky: 'bg-sky-500/15 border-sky-500/20',
  gray: 'bg-gray-500/15 border-gray-500/20',
}

interface WeeklyTemplateGridProps {
  template: WeeklyDayTemplate[]
  onAddBlock: (dayOfWeek: number, title: string) => void
  onDeleteBlock: (dayOfWeek: number, blockId: string) => void
  onGenerateTasks: () => void
  generatedCount: number | null
}

export function WeeklyTemplateGrid({ template, onAddBlock, onDeleteBlock, onGenerateTasks, generatedCount }: WeeklyTemplateGridProps) {
  const t = useTranslations()
  const dayNames = [t.plans.sunday, t.plans.monday, t.plans.tuesday, t.plans.wednesday, t.plans.thursday, t.plans.friday, t.plans.saturday]
  // Display order: Mon-Sun (1,2,3,4,5,6,0)
  const displayOrder = [1, 2, 3, 4, 5, 6, 0]
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [newBlockTitle, setNewBlockTitle] = useState('')

  const getBlocksForDay = (dow: number): WeeklyBlock[] => {
    const day = template.find(d => d.dayOfWeek === dow)
    return day?.blocks || []
  }

  const handleAdd = (dow: number) => {
    if (!newBlockTitle.trim()) return
    onAddBlock(dow, newBlockTitle.trim())
    setNewBlockTitle('')
    setAddingTo(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{t.plans.weeklySchedule}</h3>
        <button
          onClick={onGenerateTasks}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
        >
          {t.plans.generateTasks}
        </button>
      </div>

      {generatedCount !== null && (
        <div className="mb-4 p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400">
          {generatedCount} {t.plans.tasksGenerated}
        </div>
      )}

      {/* Desktop grid */}
      <div className="hidden md:grid grid-cols-7 gap-2">
        {displayOrder.map(dow => {
          const blocks = getBlocksForDay(dow)
          return (
            <div key={dow} className="rounded-xl bg-white/5 border border-white/5 p-2 min-h-[200px]">
              <h4 className="text-xs font-semibold text-center text-muted mb-2 uppercase tracking-wider">
                {dayNames[dow]}
              </h4>
              <div className="space-y-1.5">
                {blocks.map(block => {
                  const colors = blockColorMap[block.color || 'blue'] || blockColorMap.blue
                  return (
                    <div key={block.id} className={`p-2 rounded-lg border ${colors} group relative`}>
                      <p className="text-xs font-medium leading-tight">{block.title}</p>
                      {block.startTime && (
                        <p className="text-[10px] text-muted mt-0.5 flex items-center gap-1">
                          <Clock size={8} />
                          {formatTimeSlot(block.startTime)}
                          {block.endTime && ` – ${formatTimeSlot(block.endTime)}`}
                        </p>
                      )}
                      <button
                        onClick={() => onDeleteBlock(dow, block.id)}
                        className="absolute top-1 right-1 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 text-muted hover:text-red-400 transition-all"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  )
                })}
                {blocks.length === 0 && (
                  <p className="text-[10px] text-muted/50 text-center py-4">{t.plans.noBlocks}</p>
                )}
              </div>

              {addingTo === dow ? (
                <div className="mt-2">
                  <input
                    value={newBlockTitle}
                    onChange={e => setNewBlockTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd(dow); if (e.key === 'Escape') setAddingTo(null) }}
                    placeholder={t.plans.addBlock}
                    className="w-full px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs focus:outline-none focus:border-blue-500/50"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => { setAddingTo(dow); setNewBlockTitle('') }}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded-md hover:bg-white/5 text-[10px] text-muted hover:text-foreground transition-colors"
                >
                  <Plus size={10} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile vertical stack */}
      <div className="md:hidden space-y-3">
        {displayOrder.map(dow => {
          const blocks = getBlocksForDay(dow)
          return (
            <div key={dow} className="rounded-xl bg-white/5 border border-white/5 p-3">
              <h4 className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">
                {dayNames[dow]}
              </h4>
              <div className="space-y-1.5">
                {blocks.map(block => {
                  const colors = blockColorMap[block.color || 'blue'] || blockColorMap.blue
                  return (
                    <div key={block.id} className={`p-2.5 rounded-lg border ${colors} flex items-center justify-between`}>
                      <div>
                        <p className="text-sm font-medium">{block.title}</p>
                        {block.startTime && (
                          <p className="text-xs text-muted mt-0.5 flex items-center gap-1">
                            <Clock size={10} />
                            {formatTimeSlot(block.startTime)}
                            {block.endTime && ` – ${formatTimeSlot(block.endTime)}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteBlock(dow, block.id)}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}
                {blocks.length === 0 && (
                  <p className="text-xs text-muted/50 text-center py-2">{t.plans.noBlocks}</p>
                )}
              </div>

              {addingTo === dow ? (
                <div className="mt-2">
                  <input
                    value={newBlockTitle}
                    onChange={e => setNewBlockTitle(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAdd(dow); if (e.key === 'Escape') setAddingTo(null) }}
                    placeholder={t.plans.addBlock}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-blue-500/50"
                    autoFocus
                  />
                </div>
              ) : (
                <button
                  onClick={() => { setAddingTo(dow); setNewBlockTitle('') }}
                  className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg hover:bg-white/5 text-xs text-muted hover:text-foreground transition-colors"
                >
                  <Plus size={12} />
                  {t.plans.addBlock}
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
