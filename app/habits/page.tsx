'use client'

import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { ChevronDown, Flame, Target } from 'lucide-react'
import { HabitCard } from '@/components/habits/HabitCard'
import { POWER_HABITS, useHabitStore, HabitDefinition } from '@/stores/habitStore'
import { useTranslations } from '@/lib/i18n'

function StatsHeader() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getTodayScore, completions } = useHabitStore()
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayScore = getTodayScore()
  const maxPossibleScore = POWER_HABITS.reduce((sum, h) => sum + h.points, 0)

  const calculateStreak = () => {
    const dates = new Set(completions.map(c => c.date))
    let streak = 0
    let checkDate = new Date()

    while (true) {
      const dateStr = format(checkDate, 'yyyy-MM-dd')
      if (dates.has(dateStr)) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else if (dateStr === today) {
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
    return streak
  }

  const streak = calculateStreak()

  return (
    <div className="border-b border-white/10 dark:border-white/5 bg-surface/80 backdrop-blur-xl">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-yellow-500" />
            <span className="text-muted">{t.habits.todayLabel}</span>
            <span className="font-medium">{todayScore}/{maxPossibleScore} pts</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{streak} {t.habits.dayStreak}</span>
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-muted transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {todayScore}
            </p>
            <p className="text-xs text-muted">{t.habits.pointsToday}</p>
            <div className="mt-2 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${(todayScore / maxPossibleScore) * 100}%` }}
              />
            </div>
          </div>
          <div className="rounded-xl p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {streak}
            </p>
            <p className="text-xs text-muted">{t.habits.dayStreakLabel}</p>
            <p className="text-xs text-muted mt-2">
              {completions.length} {t.habits.totalCompletions}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const { reorderHabits, habitOrder } = useHabitStore()
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragOverRef = useRef<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Touch drag state
  const [touchDragId, setTouchDragId] = useState<string | null>(null)

  // Get ordered habits
  const getOrderedHabits = (): HabitDefinition[] => {
    const customOrder = habitOrder[today]
    if (customOrder && customOrder.length > 0) {
      return [...POWER_HABITS].sort((a, b) => {
        const orderA = customOrder.indexOf(a.id)
        const orderB = customOrder.indexOf(b.id)
        if (orderA !== -1 && orderB !== -1) return orderA - orderB
        if (orderA !== -1) return -1
        if (orderB !== -1) return 1
        return a.suggestedTime.localeCompare(b.suggestedTime)
      })
    }
    // Default: sort by suggested time
    return [...POWER_HABITS].sort((a, b) => a.suggestedTime.localeCompare(b.suggestedTime))
  }

  const orderedHabits = getOrderedHabits()

  const handleDragStart = (e: React.DragEvent, habitId: string) => {
    setDraggedId(habitId)
    e.dataTransfer.effectAllowed = 'move'

    // Create a custom drag image - clone the element
    const target = e.currentTarget as HTMLElement
    const clone = target.cloneNode(true) as HTMLElement

    // Style the clone for drag preview
    clone.style.position = 'absolute'
    clone.style.top = '-9999px'
    clone.style.left = '-9999px'
    clone.style.width = `${target.offsetWidth}px`
    clone.style.opacity = '0.9'
    clone.style.transform = 'rotate(2deg)'
    clone.style.pointerEvents = 'none'

    document.body.appendChild(clone)

    // Set as drag image
    e.dataTransfer.setDragImage(clone, target.offsetWidth / 2, 30)

    // Remove clone after drag starts
    requestAnimationFrame(() => {
      setTimeout(() => {
        document.body.removeChild(clone)
      }, 0)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (habitId: string) => {
    if (habitId !== draggedId) {
      dragOverRef.current = habitId
      setDragOverId(habitId)
    }
  }

  const handleDragEnd = () => {
    if (draggedId && dragOverRef.current) {
      const draggedIndex = orderedHabits.findIndex(h => h.id === draggedId)
      const dropIndex = orderedHabits.findIndex(h => h.id === dragOverRef.current)

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const newOrder = [...orderedHabits]
        const [dragged] = newOrder.splice(draggedIndex, 1)
        newOrder.splice(dropIndex, 0, dragged)
        reorderHabits(today, newOrder.map(h => h.id))
      }
    }
    setDraggedId(null)
    dragOverRef.current = null
    setDragOverId(null)
  }

  const handleTouchStart = (e: React.TouchEvent, habitId: string) => {
    const timeout = setTimeout(() => {
      setTouchDragId(habitId)
      if (navigator.vibrate) navigator.vibrate(50)
    }, 200)

    const handleTouchEnd = () => {
      clearTimeout(timeout)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    document.addEventListener('touchend', handleTouchEnd)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragId || !listRef.current) return

    const touch = e.touches[0]
    const elements = listRef.current.querySelectorAll('[data-habit-id]')

    Array.from(elements).forEach(el => {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const habitId = el.getAttribute('data-habit-id')
        if (habitId && habitId !== touchDragId) {
          setDragOverId(habitId)
          dragOverRef.current = habitId
        }
      }
    })
  }

  const handleTouchEnd = () => {
    if (touchDragId && dragOverRef.current) {
      const draggedIndex = orderedHabits.findIndex(h => h.id === touchDragId)
      const dropIndex = orderedHabits.findIndex(h => h.id === dragOverRef.current)

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const newOrder = [...orderedHabits]
        const [dragged] = newOrder.splice(draggedIndex, 1)
        newOrder.splice(dropIndex, 0, dragged)
        reorderHabits(today, newOrder.map(h => h.id))
      }
    }
    setTouchDragId(null)
    dragOverRef.current = null
    setDragOverId(null)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <StatsHeader />

      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Header */}
          <div>
            <h1 className="text-xl font-bold">{t.habits.title}</h1>
            <p className="text-sm text-muted">{t.habits.tapToExpand}</p>
          </div>

          {/* Habit Cards - draggable and with checkboxes */}
          <div
            ref={listRef}
            className="space-y-2"
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {orderedHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                isDragging={draggedId === habit.id || touchDragId === habit.id}
                isDragOver={dragOverId === habit.id && (draggedId !== habit.id && touchDragId !== habit.id)}
                onDragStart={(e) => handleDragStart(e, habit.id)}
                onDragOver={handleDragOver}
                onDragEnter={() => handleDragEnter(habit.id)}
                onDragEnd={handleDragEnd}
                onTouchDragStart={(e) => handleTouchStart(e, habit.id)}
                isTouchDragging={touchDragId === habit.id}
              />
            ))}
          </div>

          {/* Coming Soon */}
          <div className="pt-4">
            <p className="text-xs text-center text-muted">
              {t.habits.moreComingSoon}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
