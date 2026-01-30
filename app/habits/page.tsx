'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, Flame, Target, CalendarPlus, Check, Sparkles } from 'lucide-react'
import { HabitCard } from '@/components/habits/HabitCard'
import { POWER_HABITS, useHabitStore } from '@/stores/habitStore'
import { useTranslations } from '@/lib/i18n'

function StatsHeader() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getTodayScore, completions } = useHabitStore()
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayScore = getTodayScore()
  const maxPossibleScore = POWER_HABITS.reduce((sum, h) => sum + h.points, 0)

  // Calculate streak (consecutive days with at least one completion)
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
        // Today hasn't been completed yet, but don't break streak
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
      {/* Collapsed preview */}
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

      {/* Expanded stats */}
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

function ScheduleActions() {
  const { scheduleHabit, getScheduledForDate } = useHabitStore()
  const [justScheduledAll, setJustScheduledAll] = useState(false)
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')
  const scheduledToday = getScheduledForDate(today)

  // Check if all habits are already scheduled
  const allScheduled = POWER_HABITS.every(habit =>
    scheduledToday.some(s => s.habitId === habit.id)
  )

  const handleAddAllToToday = () => {
    POWER_HABITS.forEach(habit => {
      // Only schedule if not already scheduled
      if (!scheduledToday.some(s => s.habitId === habit.id)) {
        scheduleHabit(habit.id, today, habit.suggestedTime)
      }
    })
    setJustScheduledAll(true)
    setTimeout(() => setJustScheduledAll(false), 3000)
  }

  return (
    <div className="rounded-xl border border-white/10 dark:border-white/5 bg-surface/60 backdrop-blur-xl overflow-hidden">
      {allScheduled || justScheduledAll ? (
        // All scheduled state
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-400">{t.habits.allScheduled}</p>
              <p className="text-xs text-muted">
                {POWER_HABITS.length} {t.habits.habitsAddedToToday}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Not all scheduled - show CTA
        <div className="p-4">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.habits.addAllHabitsToSchedule}</p>
              <p className="text-xs text-muted mt-0.5">{t.habits.orSelectIndividually}</p>
            </div>
          </div>
          <button
            onClick={handleAddAllToToday}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <CalendarPlus size={18} />
            {t.habits.addAllToToday}
          </button>
        </div>
      )}
    </div>
  )
}

export default function HabitsPage() {
  const t = useTranslations()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Stats Header at Top */}
      <StatsHeader />

      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4 space-y-3">
          {/* Header */}
          <div className="mb-2">
            <h1 className="text-xl font-bold">{t.habits.title}</h1>
            <p className="text-sm text-muted">{t.habits.tapToExpand}</p>
          </div>

          {/* Schedule All Action */}
          <ScheduleActions />

          {/* Habit Cards */}
          {POWER_HABITS.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}

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
