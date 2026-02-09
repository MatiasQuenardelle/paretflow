'use client'

import { useState, useMemo } from 'react'
import { Plus, Trash2, Clock, CalendarDays, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { WeeklyDayTemplate, WeeklyBlock } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'
import { formatTimeSlot } from '@/lib/utils'

const blockColors: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  blue:   { bg: 'bg-blue-500/8',   border: 'border-blue-500/15', accent: 'bg-blue-500',   text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/8', border: 'border-purple-500/15', accent: 'bg-purple-500', text: 'text-purple-400' },
  green:  { bg: 'bg-green-500/8',  border: 'border-green-500/15', accent: 'bg-green-500',  text: 'text-green-400' },
  orange: { bg: 'bg-orange-500/8', border: 'border-orange-500/15', accent: 'bg-orange-500', text: 'text-orange-400' },
  red:    { bg: 'bg-red-500/8',    border: 'border-red-500/15', accent: 'bg-red-500',    text: 'text-red-400' },
  pink:   { bg: 'bg-pink-500/8',   border: 'border-pink-500/15', accent: 'bg-pink-500',   text: 'text-pink-400' },
  sky:    { bg: 'bg-sky-500/8',    border: 'border-sky-500/15', accent: 'bg-sky-500',    text: 'text-sky-400' },
  gray:   { bg: 'bg-gray-500/8',   border: 'border-gray-500/15', accent: 'bg-gray-500',   text: 'text-gray-400' },
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
  const dayNamesFull = [t.plans.sunday, t.plans.monday, t.plans.tuesday, t.plans.wednesday, t.plans.thursday, t.plans.friday, t.plans.saturday]
  const displayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun
  const today = new Date().getDay()

  const [selectedMobileDay, setSelectedMobileDay] = useState<number>(today)
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [newBlockTitle, setNewBlockTitle] = useState('')

  const getBlocksForDay = (dow: number): WeeklyBlock[] => {
    const day = template.find(d => d.dayOfWeek === dow)
    return day?.blocks || []
  }

  const totalBlocks = useMemo(() => {
    return template.reduce((sum, d) => sum + d.blocks.length, 0)
  }, [template])

  const handleAdd = (dow: number) => {
    if (!newBlockTitle.trim()) return
    onAddBlock(dow, newBlockTitle.trim())
    setNewBlockTitle('')
    setAddingTo(null)
  }

  const renderBlock = (block: WeeklyBlock, dow: number, compact: boolean) => {
    const colors = blockColors[block.color || 'blue'] || blockColors.blue
    return (
      <div
        key={block.id}
        className={`relative flex items-start gap-2.5 ${compact ? 'p-2' : 'p-3'} rounded-xl ${colors.bg} border ${colors.border} group transition-all hover:border-white/20`}
      >
        <div className={`w-1 ${compact ? 'h-6' : 'h-8'} rounded-full ${colors.accent} shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0">
          <p className={`${compact ? 'text-xs' : 'text-sm'} font-medium leading-snug`}>{block.title}</p>
          {block.startTime && (
            <p className={`${compact ? 'text-[10px]' : 'text-xs'} text-muted mt-0.5 flex items-center gap-1`}>
              <Clock size={compact ? 9 : 11} className="shrink-0" />
              {formatTimeSlot(block.startTime)}
              {block.endTime && <><span className="text-muted/40">-</span>{formatTimeSlot(block.endTime)}</>}
            </p>
          )}
        </div>
        <button
          onClick={() => onDeleteBlock(dow, block.id)}
          className={`${compact ? 'p-0.5' : 'p-1'} rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted hover:text-red-400 transition-all shrink-0`}
        >
          <Trash2 size={compact ? 11 : 13} />
        </button>
      </div>
    )
  }

  const renderAddBlock = (dow: number, compact: boolean) => {
    if (addingTo === dow) {
      return (
        <div className={`${compact ? 'mt-1.5' : 'mt-2'}`}>
          <input
            value={newBlockTitle}
            onChange={e => setNewBlockTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(dow); if (e.key === 'Escape') setAddingTo(null) }}
            onBlur={() => { if (!newBlockTitle.trim()) setAddingTo(null) }}
            placeholder={t.plans.addBlock}
            className={`w-full ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} rounded-lg bg-white/5 border border-white/10 focus:outline-none focus:border-blue-500/40 focus:bg-white/[0.03] transition-colors`}
            autoFocus
          />
        </div>
      )
    }
    return (
      <button
        onClick={() => { setAddingTo(dow); setNewBlockTitle('') }}
        className={`${compact ? 'mt-1.5' : 'mt-2'} w-full flex items-center justify-center gap-1 ${compact ? 'py-1' : 'py-1.5'} rounded-lg border border-dashed border-white/8 hover:border-white/20 hover:bg-white/[0.03] ${compact ? 'text-[10px]' : 'text-xs'} text-muted hover:text-foreground transition-all`}
      >
        <Plus size={compact ? 10 : 12} />
      </button>
    )
  }

  // Navigate mobile days
  const currentMobileIndex = displayOrder.indexOf(selectedMobileDay)
  const prevDay = () => setSelectedMobileDay(displayOrder[(currentMobileIndex - 1 + 7) % 7])
  const nextDay = () => setSelectedMobileDay(displayOrder[(currentMobileIndex + 1) % 7])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10">
            <CalendarDays size={18} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">{t.plans.weeklySchedule}</h3>
            <p className="text-xs text-muted">{totalBlocks} blocks</p>
          </div>
        </div>
        <button
          onClick={onGenerateTasks}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-medium shadow-lg shadow-blue-500/15 hover:shadow-blue-500/25 transition-all active:scale-[0.97]"
        >
          <Zap size={13} />
          {t.plans.generateTasks}
        </button>
      </div>

      {generatedCount !== null && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-sm text-green-400 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          {generatedCount} {t.plans.tasksGenerated}
        </div>
      )}

      {/* ─── Desktop: Clean column layout ─── */}
      <div className="hidden md:grid grid-cols-7 gap-1.5">
        {displayOrder.map(dow => {
          const blocks = getBlocksForDay(dow)
          const isToday = dow === today
          return (
            <div
              key={dow}
              className={`rounded-2xl p-2 min-h-[220px] flex flex-col transition-colors ${
                isToday
                  ? 'bg-blue-500/[0.06] border border-blue-500/20 ring-1 ring-blue-500/10'
                  : 'bg-white/[0.02] border border-white/5'
              }`}
            >
              {/* Day header */}
              <div className={`flex items-center justify-between mb-2 px-1`}>
                <div className="flex items-center gap-1.5">
                  {isToday && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${isToday ? 'text-blue-400' : 'text-muted'}`}>
                    {dayNamesFull[dow]}
                  </span>
                </div>
                {blocks.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${isToday ? 'bg-blue-500/15 text-blue-400' : 'bg-white/5 text-muted'}`}>
                    {blocks.length}
                  </span>
                )}
              </div>

              {/* Blocks */}
              <div className="flex-1 space-y-1.5">
                {blocks.map(block => renderBlock(block, dow, true))}
                {blocks.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-6">
                    <p className="text-[10px] text-muted/30">{t.plans.noBlocks}</p>
                  </div>
                )}
              </div>

              {renderAddBlock(dow, true)}
            </div>
          )
        })}
      </div>

      {/* ─── Mobile: Day selector + single day view ─── */}
      <div className="md:hidden space-y-3">
        {/* Day pill selector */}
        <div className="flex items-center gap-1">
          <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-white/5 text-muted">
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 flex gap-1 overflow-x-auto scrollbar-none">
            {displayOrder.map(dow => {
              const blocks = getBlocksForDay(dow)
              const isSelected = dow === selectedMobileDay
              const isToday = dow === today
              return (
                <button
                  key={dow}
                  onClick={() => setSelectedMobileDay(dow)}
                  className={`flex-1 min-w-0 flex flex-col items-center gap-0.5 py-2 px-1 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-blue-500/15 border border-blue-500/25'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isSelected ? 'text-blue-400' : isToday ? 'text-blue-400/70' : 'text-muted'
                  }`}>
                    {dayNamesFull[dow]}
                  </span>
                  {(blocks.length > 0 || isToday) && (
                    <div className="flex items-center gap-0.5">
                      {isToday && <div className="w-1 h-1 rounded-full bg-blue-400" />}
                      {blocks.length > 0 && (
                        <span className={`text-[9px] ${isSelected ? 'text-blue-400' : 'text-muted/50'}`}>
                          {blocks.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
          <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-white/5 text-muted">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Selected day content */}
        {(() => {
          const blocks = getBlocksForDay(selectedMobileDay)
          const isToday = selectedMobileDay === today
          return (
            <div className={`rounded-2xl p-4 ${
              isToday
                ? 'bg-blue-500/[0.06] border border-blue-500/20'
                : 'bg-white/[0.02] border border-white/5'
            }`}>
              <div className="flex items-center gap-2 mb-3">
                {isToday && <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />}
                <h4 className={`text-sm font-semibold ${isToday ? 'text-blue-400' : ''}`}>
                  {dayNamesFull[selectedMobileDay]}
                </h4>
                <span className="text-xs text-muted">
                  {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'}
                </span>
              </div>

              <div className="space-y-2">
                {blocks.map(block => renderBlock(block, selectedMobileDay, false))}
                {blocks.length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm text-muted/40">{t.plans.noBlocks}</p>
                  </div>
                )}
              </div>

              {renderAddBlock(selectedMobileDay, false)}
            </div>
          )
        })()}
      </div>
    </div>
  )
}
