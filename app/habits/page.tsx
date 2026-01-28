'use client'

import { format } from 'date-fns'
import { Sparkles, Trophy, Flame, Target } from 'lucide-react'
import { HabitCard } from '@/components/habits/HabitCard'
import { POWER_HABITS, useHabitStore } from '@/stores/habitStore'

export default function HabitsPage() {
  const { getTodayScore, completions, getCompletionsForDate } = useHabitStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayScore = getTodayScore()
  const todayCompletions = getCompletionsForDate(today)
  const completedCount = todayCompletions.length
  const totalHabits = POWER_HABITS.length
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
    <div className="flex-1 overflow-auto">
      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header with Score */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl md:text-3xl font-bold">Pareto Power Habits</h1>
          </div>
          <p className="text-muted">
            Small habits, big impact. Focus on the 20% that gives 80% of results.
          </p>
        </div>

        {/* Score Card */}
        <div className="rounded-2xl p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted uppercase tracking-wider">Today's Score</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl font-bold text-yellow-600 dark:text-yellow-400">
                  {todayScore}
                </span>
                <span className="text-lg text-muted">/ {maxPossibleScore}</span>
              </div>
              <p className="text-sm text-muted mt-1">
                {completedCount} of {totalHabits} habits completed
              </p>
            </div>
            <div className="text-right">
              <Trophy className="w-12 h-12 text-yellow-500 mb-2 ml-auto" />
              {todayScore >= maxPossibleScore && (
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Perfect Day!
                </span>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${(todayScore / maxPossibleScore) * 100}%` }}
            />
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-xl p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center gap-3">
              <Flame className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{streak}</p>
                <p className="text-sm text-muted">Day Streak</p>
              </div>
            </div>
          </div>
          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <Target className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{completions.length}</p>
                <p className="text-sm text-muted">Total Completions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Habit Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Power Habits</h2>
          {POWER_HABITS.map(habit => (
            <HabitCard key={habit.id} habit={habit} />
          ))}
        </div>

        {/* Coming Soon */}
        <div className="rounded-xl p-4 bg-border/30 border border-border text-center">
          <p className="text-sm text-muted">
            More power habits coming soon... Stay focused on these first!
          </p>
        </div>
      </div>
    </div>
  )
}
