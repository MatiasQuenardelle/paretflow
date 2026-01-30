'use client'

import { useEffect, useState, useRef } from 'react'
import { format } from 'date-fns'
import { Flame } from 'lucide-react'
import { POWER_HABITS, useHabitStore } from '@/stores/habitStore'
import { useTranslations } from '@/lib/i18n'

export function PowerScorePanel() {
  const { getTodayScore, completions } = useHabitStore()
  const t = useTranslations()

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayScore = getTodayScore()
  const maxPossibleScore = POWER_HABITS.reduce((sum, h) => sum + h.points, 0)
  const todayCompletions = completions.filter(c => c.date === today)
  const completedCount = todayCompletions.length
  const totalHabits = POWER_HABITS.length
  const completionPercent = (completedCount / totalHabits) * 100
  const scorePercent = (todayScore / maxPossibleScore) * 100

  // Track score changes for animation
  const [animateScore, setAnimateScore] = useState(false)
  const prevScoreRef = useRef(todayScore)

  useEffect(() => {
    if (todayScore > prevScoreRef.current) {
      setAnimateScore(true)
      const timer = setTimeout(() => setAnimateScore(false), 400)
      return () => clearTimeout(timer)
    }
    prevScoreRef.current = todayScore
  }, [todayScore])

  // Calculate streak
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

  // Get motivational message based on completion %
  const getMotivationalMessage = () => {
    if (completionPercent === 100) return t.habits.motivationPerfect
    if (completionPercent >= 75) return t.habits.motivationAlmost
    if (completionPercent >= 50) return t.habits.motivationHalf
    return t.habits.motivationStart
  }

  // SVG circular progress
  const radius = 80
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (scorePercent / 100) * circumference

  return (
    <div className="h-full rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 p-6 flex flex-col">
      {/* Header */}
      <h2 className="text-lg font-semibold text-center mb-6">{t.habits.powerScore}</h2>

      {/* Circular Progress */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative w-48 h-48">
          {/* Glow effect */}
          <div
            className="absolute inset-0 rounded-full animate-glow-pulse"
            style={{
              background: `radial-gradient(circle, rgba(234, 179, 8, 0.2) 0%, transparent 70%)`,
            }}
          />

          {/* SVG Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="12"
              className="text-white/10"
            />
            {/* Progress circle with gradient */}
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
            <circle
              cx="100"
              cy="100"
              r={radius}
              fill="none"
              stroke="url(#scoreGradient)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-500 ease-out"
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-5xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent ${
                animateScore ? 'animate-score-pop' : ''
              }`}
            >
              {todayScore}
            </span>
            <span className="text-sm text-muted">/{maxPossibleScore} pts</span>
          </div>
        </div>

        {/* Streak display */}
        {streak > 0 && (
          <div className="mt-6 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">{streak} {t.habits.dayStreak}</span>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="mt-6 w-full grid grid-cols-2 gap-3">
          <div className="rounded-xl p-3 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 text-center">
            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {completedCount}/{totalHabits}
            </p>
            <p className="text-xs text-muted">{t.habits.completed}</p>
          </div>
          <div className="rounded-xl p-3 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {todayScore}
            </p>
            <p className="text-xs text-muted">{t.habits.pointsEarned}</p>
          </div>
        </div>

        {/* Motivational message */}
        <p className="mt-6 text-center text-sm text-muted italic">
          "{getMotivationalMessage()}"
        </p>
      </div>
    </div>
  )
}
