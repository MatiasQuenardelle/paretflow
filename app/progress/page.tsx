'use client'

import Link from 'next/link'
import { Timer, ListTodo, Calendar, Play, CheckCircle, TrendingUp, Target } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useTimerStore } from '@/stores/timerStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTranslations, useI18n } from '@/lib/i18n'

export default function ProgressPage() {
  const { sessionsToday, allSessions, mode: timerMode, customWork } = useTimerStore()
  const { tasks } = useTaskStore()
  const t = useTranslations()
  const { locale } = useI18n()

  // Today's stats
  const today = new Date().toDateString()
  const todaySessions = sessionsToday.filter(
    s => new Date(s.completedAt).toDateString() === today
  )
  const todayMinutes = todaySessions.reduce((acc, s) => acc + s.duration, 0)

  // This week's stats
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  weekStart.setHours(0, 0, 0, 0)

  const weekSessions = allSessions.filter(
    s => new Date(s.completedAt) >= weekStart
  )
  const weekMinutes = weekSessions.reduce((acc, s) => acc + s.duration, 0)

  // Get last 7 days data for chart
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toDateString()

    const dayMinutes = allSessions
      .filter(s => new Date(s.completedAt).toDateString() === dateStr)
      .reduce((acc, s) => acc + s.duration, 0)

    return {
      day: date.toLocaleDateString(locale, { weekday: 'short' }),
      date: date.getDate(),
      minutes: dayMinutes,
    }
  })

  const maxMinutes = Math.max(...last7Days.map(d => d.minutes), 60)

  // Task stats
  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const completedSteps = tasks.reduce((acc, t) => acc + t.steps.filter(s => s.completed).length, 0)
  const totalSteps = tasks.reduce((acc, t) => acc + t.steps.length, 0)

  // Pomodoro stats
  const focusDuration = timerMode === '25/5' ? 25 : timerMode === '50/10' ? 50 : customWork
  const dailyGoal = 8 // 8 pomodoros per day target
  const dailyProgress = Math.min((todaySessions.length / dailyGoal) * 100, 100)

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{t.progress.title}</h1>
        <p className="text-muted">{t.progress.subtitle}</p>
      </header>

      {/* Daily Progress Ring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 flex flex-col items-center justify-center py-6 relative overflow-hidden">
          {/* Glow behind progress ring */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-2xl animate-glow-pulse" />
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                className="stroke-white/10 dark:stroke-white/5"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#progressGradientRing)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 40}
                strokeDashoffset={2 * Math.PI * 40 * (1 - dailyProgress / 100)}
                style={{ filter: 'drop-shadow(0 0 6px rgb(59, 130, 246))' }}
              />
              <defs>
                <linearGradient id="progressGradientRing" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{todaySessions.length}</span>
              <span className="text-xs text-muted">{t.common.of} {dailyGoal}</span>
            </div>
          </div>
          <p className="mt-4 font-medium">{t.progress.dailyGoal}</p>
          <p className="text-sm text-muted">{todayMinutes} {t.progress.focusedToday}</p>
        </Card>

        {/* Stats Cards */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4">
          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{todaySessions.length}</p>
              <p className="text-sm text-muted">{t.progress.pomodorosToday}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{weekSessions.length}</p>
              <p className="text-sm text-muted">{t.progress.thisWeek}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
              <p className="text-sm text-muted">{t.tasks.tasksDone}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold">{Math.round(weekMinutes / 60)}h</p>
              <p className="text-sm text-muted">{t.progress.focusThisWeek}</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly Chart */}
      <Card className="mb-8">
        <h2 className="text-lg font-semibold mb-4">{t.progress.lastSevenDays}</h2>
        <div className="flex items-end gap-2 h-40">
          {last7Days.map((day, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex-1 flex items-end">
                <div
                  className={`w-full rounded-t-lg transition-all ${
                    day.day === new Date().toLocaleDateString(locale, { weekday: 'short' })
                      ? 'bg-blue-500'
                      : 'bg-blue-200 dark:bg-blue-900/50'
                  }`}
                  style={{
                    height: `${Math.max((day.minutes / maxMinutes) * 100, 4)}%`,
                  }}
                />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium">{day.day}</p>
                <p className="text-xs text-muted">{day.minutes}m</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <h2 className="text-lg font-semibold mb-4">{t.progress.quickActions}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <Play className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{t.progress.startFocus}</span>
            </div>
            <p className="text-sm text-muted">{t.progress.beginSession.replace('{duration}', String(focusDuration))}</p>
          </Card>
        </Link>

        <Link href="/">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <ListTodo className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{t.progress.manageTasks}</span>
            </div>
            <p className="text-sm text-muted">{t.progress.planSessions}</p>
          </Card>
        </Link>

        <Link href="/calendar">
          <Card className="hover:border-blue-500 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium">{t.progress.viewSchedule}</span>
            </div>
            <p className="text-sm text-muted">{t.progress.seePlannedActivities}</p>
          </Card>
        </Link>
      </div>

      {/* Recent Activity */}
      {allSessions.length > 0 && (
        <>
          <h2 className="text-lg font-semibold mb-4">{t.progress.recentSessions}</h2>
          <Card>
            <div className="divide-y divide-border">
              {allSessions.slice(-5).reverse().map((session) => {
                const task = tasks.find(t => t.id === session.taskId)
                const date = new Date(session.completedAt)
                return (
                  <div key={session.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Timer className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{task?.title || t.progress.focusSession}</p>
                        <p className="text-xs text-muted">
                          {date.toLocaleDateString(locale)} at {date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm text-muted">{session.duration} {t.common.min}</span>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
