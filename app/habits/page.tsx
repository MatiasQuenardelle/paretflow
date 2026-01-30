'use client'

import { useState, useRef } from 'react'
import { format, addDays } from 'date-fns'
import { ChevronDown, Flame, Target, Pencil, Check, X, Sparkles } from 'lucide-react'
import { HabitCard } from '@/components/habits/HabitCard'
import { PowerScorePanel } from '@/components/habits/PowerScorePanel'
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

// Recommended banner component
function RecommendedBanner({ onAddAll, onDismiss }: { onAddAll: () => void, onDismiss: () => void }) {
  const t = useTranslations()
  const recommendedHabits = POWER_HABITS.filter(h => h.isRecommended)

  return (
    <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 p-4 mb-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-green-400">{t.habits.startWithEasyWins}</h3>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X size={16} className="text-muted" />
        </button>
      </div>
      <p className="text-sm text-muted mb-3">{t.habits.theseHabitsTakeMinimal}</p>
      <div className="flex flex-wrap gap-2 mb-4">
        {recommendedHabits.map(habit => (
          <span
            key={habit.id}
            className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80"
          >
            {habit.name}
          </span>
        ))}
      </div>
      <button
        onClick={onAddAll}
        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium text-sm shadow-lg shadow-green-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Sparkles size={16} />
        {t.habits.addToEveryDay}
      </button>
    </div>
  )
}

// Habit toggle for edit mode
function HabitToggle({
  habit,
  enabled,
  onToggle,
}: {
  habit: HabitDefinition
  enabled: boolean
  onToggle: () => void
}) {
  const t = useTranslations()
  const habitTranslation = t.powerHabits[habit.id as keyof typeof t.powerHabits]
  const habitName = habitTranslation?.name || habit.name

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
        enabled
          ? 'bg-white/5 border-white/20'
          : 'bg-white/[0.02] border-white/5 opacity-50'
      }`}
    >
      <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
        <img
          src={habit.illustration}
          alt={habitName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm truncate block">{habitName}</span>
        <span className="text-xs text-muted">+{habit.points} pts</span>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition-all ${
          enabled ? 'bg-green-500' : 'bg-white/10'
        }`}
      >
        <div
          className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

export default function HabitsPage() {
  const {
    reorderHabits,
    habitOrder,
    enabledHabits,
    dailyHabitOverrides,
    recommendedBannerDismissed,
    setEnabledHabits,
    setDailyOverride,
    dismissRecommendedBanner,
    scheduleHabitForDays,
  } = useHabitStore()
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)
  const [editScope, setEditScope] = useState<'global' | 'today'>('global')

  // Drag state
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const dragOverRef = useRef<string | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Touch drag state
  const [touchDragId, setTouchDragId] = useState<string | null>(null)

  // Get enabled habits for current date (using direct state access for proper reactivity)
  // Fallback to all habits if enabledHabits is empty (for backwards compatibility with existing users)
  const effectiveEnabledHabits = enabledHabits?.length > 0 ? enabledHabits : POWER_HABITS.map(h => h.id)
  const currentEnabledHabits = dailyHabitOverrides[today] || effectiveEnabledHabits

  // Show recommended banner when user has < 3 habits enabled and hasn't dismissed
  const showRecommendedBanner = currentEnabledHabits.length < 3 && !recommendedBannerDismissed

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

  // Get displayed habits (filtered by enabled status unless in edit mode)
  const getDisplayedHabits = (): HabitDefinition[] => {
    if (isEditMode) return orderedHabits
    return orderedHabits.filter(h => currentEnabledHabits.includes(h.id))
  }

  const displayedHabits = getDisplayedHabits()

  // Toggle habit enabled status
  const toggleHabitEnabled = (habitId: string) => {
    const currentEnabled = editScope === 'today'
      ? (dailyHabitOverrides[today] || effectiveEnabledHabits)
      : effectiveEnabledHabits

    const isEnabling = !currentEnabled.includes(habitId)
    const newEnabled = isEnabling
      ? [...currentEnabled, habitId]
      : currentEnabled.filter(id => id !== habitId)

    if (editScope === 'today') {
      setDailyOverride(today, newEnabled)
    } else {
      // Update global
      setEnabledHabits(newEnabled)

      // If disabling globally and there's a today override, also remove from today
      if (!isEnabling && dailyHabitOverrides[today]) {
        const todayEnabled = dailyHabitOverrides[today].filter(id => id !== habitId)
        setDailyOverride(today, todayEnabled)
      }
    }
  }

  // Handle adding recommended habits to every day
  const handleAddRecommended = () => {
    const recommendedHabits = POWER_HABITS.filter(h => h.isRecommended)
    const recommendedIds = recommendedHabits.map(h => h.id)

    // Add to global enabled if not already
    const newEnabled = Array.from(new Set([...effectiveEnabledHabits, ...recommendedIds]))
    setEnabledHabits(newEnabled)

    // Schedule each recommended habit for the next 4 weeks
    const dates: string[] = []
    for (let i = 0; i < 28; i++) {
      dates.push(format(addDays(new Date(), i), 'yyyy-MM-dd'))
    }

    recommendedHabits.forEach(habit => {
      scheduleHabitForDays(habit.id, dates, habit.suggestedTime)
    })

    dismissRecommendedBanner()
  }

  // Get the enabled habits for edit mode display
  const getEditModeEnabled = () => {
    return editScope === 'today'
      ? (dailyHabitOverrides[today] || effectiveEnabledHabits)
      : effectiveEnabledHabits
  }

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
      {/* Mobile: StatsHeader */}
      <div className="md:hidden">
        <StatsHeader />
      </div>

      {/* Desktop: two-panel layout */}
      <div className="hidden md:flex md:flex-1 md:p-6 md:gap-6 overflow-hidden">
        {/* Left: Score Panel (340px fixed) */}
        <div className="w-[340px] shrink-0">
          <PowerScorePanel />
        </div>

        {/* Right: Habit Cards (flex-1, scrollable) */}
        <div className="flex-1 overflow-auto rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold">{t.habits.title}</h1>
              <p className="text-sm text-muted">{t.habits.tapToExpand}</p>
            </div>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check size={16} />
                  {t.habits.doneEditing}
                </>
              ) : (
                <>
                  <Pencil size={16} />
                  {t.habits.editHabits}
                </>
              )}
            </button>
          </div>

          {/* Edit Mode Scope Toggle */}
          {isEditMode && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditScope('global')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editScope === 'global'
                      ? 'bg-white/20 text-white'
                      : 'text-muted hover:bg-white/10'
                  }`}
                >
                  {t.habits.globalSettings}
                </button>
                <button
                  onClick={() => setEditScope('today')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editScope === 'today'
                      ? 'bg-white/20 text-white'
                      : 'text-muted hover:bg-white/10'
                  }`}
                >
                  {t.habits.todayOnlyScope}
                </button>
              </div>
              <p className="text-xs text-muted mt-2 text-center">
                {editScope === 'global' ? t.habits.enabledGlobally : t.habits.enabledForToday}
              </p>
            </div>
          )}

          {/* Recommended Banner */}
          {showRecommendedBanner && !isEditMode && (
            <RecommendedBanner
              onAddAll={handleAddRecommended}
              onDismiss={dismissRecommendedBanner}
            />
          )}

          {/* Edit Mode: Habit Toggles */}
          {isEditMode ? (
            <div className="space-y-2">
              {orderedHabits.map(habit => (
                <HabitToggle
                  key={habit.id}
                  habit={habit}
                  enabled={getEditModeEnabled().includes(habit.id)}
                  onToggle={() => toggleHabitEnabled(habit.id)}
                />
              ))}
            </div>
          ) : (
            /* Habit Cards */
            <div
              ref={listRef}
              className="space-y-2"
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {displayedHabits.map(habit => (
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
              {displayedHabits.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted">{t.habits.noHabitsEnabled}</p>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="mt-2 text-sm text-green-400 hover:text-green-300"
                  >
                    {t.habits.editHabits}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coming Soon */}
          {!isEditMode && (
            <div className="pt-4">
              <p className="text-xs text-center text-muted">
                {t.habits.moreComingSoon}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: existing vertical stack */}
      <div className="md:hidden flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{t.habits.title}</h1>
              <p className="text-sm text-muted">{t.habits.tapToExpand}</p>
            </div>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isEditMode
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check size={16} />
                  {t.habits.doneEditing}
                </>
              ) : (
                <>
                  <Pencil size={16} />
                  {t.habits.editHabits}
                </>
              )}
            </button>
          </div>

          {/* Edit Mode Scope Toggle */}
          {isEditMode && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditScope('global')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editScope === 'global'
                      ? 'bg-white/20 text-white'
                      : 'text-muted hover:bg-white/10'
                  }`}
                >
                  {t.habits.globalSettings}
                </button>
                <button
                  onClick={() => setEditScope('today')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    editScope === 'today'
                      ? 'bg-white/20 text-white'
                      : 'text-muted hover:bg-white/10'
                  }`}
                >
                  {t.habits.todayOnlyScope}
                </button>
              </div>
              <p className="text-xs text-muted mt-2 text-center">
                {editScope === 'global' ? t.habits.enabledGlobally : t.habits.enabledForToday}
              </p>
            </div>
          )}

          {/* Recommended Banner */}
          {showRecommendedBanner && !isEditMode && (
            <RecommendedBanner
              onAddAll={handleAddRecommended}
              onDismiss={dismissRecommendedBanner}
            />
          )}

          {/* Edit Mode: Habit Toggles */}
          {isEditMode ? (
            <div className="space-y-2">
              {orderedHabits.map(habit => (
                <HabitToggle
                  key={habit.id}
                  habit={habit}
                  enabled={getEditModeEnabled().includes(habit.id)}
                  onToggle={() => toggleHabitEnabled(habit.id)}
                />
              ))}
            </div>
          ) : (
            /* Habit Cards - draggable and with checkboxes */
            <div
              className="space-y-2"
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {displayedHabits.map(habit => (
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
              {displayedHabits.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted">{t.habits.noHabitsEnabled}</p>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="mt-2 text-sm text-green-400 hover:text-green-300"
                  >
                    {t.habits.editHabits}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Coming Soon */}
          {!isEditMode && (
            <div className="pt-4">
              <p className="text-xs text-center text-muted">
                {t.habits.moreComingSoon}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
