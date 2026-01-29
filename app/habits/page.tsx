'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronUp, Flame, Target } from 'lucide-react'
import { HabitCard } from '@/components/habits/HabitCard'
import { POWER_HABITS, useHabitStore } from '@/stores/habitStore'

function StatsFooter() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getTodayScore, completions } = useHabitStore()

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
    <div className="border-t border-white/10 dark:border-white/5 bg-surface/80 backdrop-blur-xl">
      {/* Collapsed preview */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-sm hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Target className="w-4 h-4 text-yellow-500" />
            <span className="text-muted">Today:</span>
            <span className="font-medium">{todayScore}/{maxPossibleScore} pts</span>
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium">{streak} day streak</span>
          </span>
        </div>
        <ChevronUp
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
            <p className="text-xs text-muted">Points Today</p>
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
            <p className="text-xs text-muted">Day Streak</p>
            <p className="text-xs text-muted mt-2">
              {completions.length} total completions
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4 space-y-2">
          {/* Header */}
          <div className="mb-4">
            <h1 className="text-xl font-bold">Power Habits</h1>
            <p className="text-sm text-muted">Tap to expand</p>
          </div>

          {/* Habit Cards */}
          {POWER_HABITS.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}

          {/* Coming Soon */}
          <div className="pt-4">
            <p className="text-xs text-center text-muted">
              More habits coming soon...
            </p>
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <StatsFooter />
    </div>
  )
}
