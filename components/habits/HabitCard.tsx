'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, Info, Calendar, Clock, X, Brain, Pill } from 'lucide-react'
import { HabitDefinition, useHabitStore } from '@/stores/habitStore'

interface HabitCardProps {
  habit: HabitDefinition
}

const iconMap: Record<string, React.ElementType> = {
  Brain,
  Pill,
}

const colorClasses: Record<string, { bg: string; border: string; check: string; badge: string }> = {
  purple: {
    bg: 'from-purple-500/10 to-violet-500/10',
    border: 'border-purple-500/30',
    check: 'bg-purple-500',
    badge: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
  },
  cyan: {
    bg: 'from-cyan-500/10 to-teal-500/10',
    border: 'border-cyan-500/30',
    check: 'bg-cyan-500',
    badge: 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
  },
}

export function HabitCard({ habit }: HabitCardProps) {
  const [showInfoPopup, setShowInfoPopup] = useState(false)
  const [showSchedulePopup, setShowSchedulePopup] = useState(false)
  const [scheduleTime1, setScheduleTime1] = useState(habit.suggestedTime)
  const [scheduleTime2, setScheduleTime2] = useState('')
  const [enableSecondTime, setEnableSecondTime] = useState(false)

  const {
    completeHabit,
    uncompleteHabit,
    isCompletedToday,
    scheduleHabit,
    getScheduledForDate,
    getTotalCompletions,
  } = useHabitStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const completed = isCompletedToday(habit.id)
  const totalCompletions = getTotalCompletions(habit.id)
  const scheduledToday = getScheduledForDate(today).filter(s => s.habitId === habit.id)

  const Icon = iconMap[habit.icon] || Brain
  const colors = colorClasses[habit.color] || colorClasses.purple

  const handleToggleComplete = () => {
    if (completed) {
      uncompleteHabit(habit.id, today)
    } else {
      completeHabit(habit.id)
    }
  }

  const handleSchedule = () => {
    if (scheduleTime1) {
      scheduleHabit(habit.id, today, scheduleTime1)
    }
    if (enableSecondTime && scheduleTime2) {
      // For second time, we'll create a task in calendar
      scheduleHabit(habit.id, today, scheduleTime2)
    }
    setShowSchedulePopup(false)
    setShowInfoPopup(false)
  }

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return format(new Date(0, 0, 0, h, m), 'h:mm a')
  }

  return (
    <>
      {/* Main Card */}
      <div
        className={`relative rounded-2xl p-4 transition-all duration-300 bg-gradient-to-br ${colors.bg} border ${colors.border} ${
          completed ? 'opacity-75' : ''
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={handleToggleComplete}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              completed
                ? `${colors.check} text-white`
                : 'border-2 border-muted hover:border-foreground'
            }`}
          >
            {completed && <Check size={18} />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon size={20} className="text-foreground" />
              <h3 className={`font-semibold ${completed ? 'line-through text-muted' : ''}`}>
                {habit.name}
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${colors.badge}`}>
                +{habit.points} pts
              </span>
            </div>
            <p className="text-sm text-muted mt-1">{habit.description}</p>

            {/* Scheduled times */}
            {scheduledToday.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <Clock size={14} className="text-muted" />
                <span className="text-xs text-muted">
                  Scheduled: {scheduledToday.map(s => formatTimeDisplay(s.time)).join(', ')}
                </span>
              </div>
            )}

            {/* Total completions badge */}
            {totalCompletions > 0 && (
              <div className="mt-2">
                <span className="text-xs text-muted">
                  Completed {totalCompletions} time{totalCompletions !== 1 ? 's' : ''} total
                </span>
              </div>
            )}
          </div>

          {/* Info button */}
          <button
            onClick={() => setShowInfoPopup(true)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-border/50 transition-colors"
            title="Learn more"
          >
            <Info size={20} />
          </button>
        </div>
      </div>

      {/* Info Popup */}
      {showInfoPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowInfoPopup(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={24} className="text-white" />
                  <h2 className="text-xl font-semibold text-white">{habit.name}</h2>
                </div>
                <button
                  onClick={() => setShowInfoPopup(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-white/5 p-4">
                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">
                  Why This Matters
                </h3>
                <p className="text-sm text-white/90 leading-relaxed">
                  {habit.benefit}
                </p>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                <Clock size={18} className="text-cyan-400" />
                <div>
                  <p className="text-xs text-white/40">Suggested Time</p>
                  <p className="text-sm text-white">{formatTimeDisplay(habit.suggestedTime)}</p>
                </div>
              </div>

              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${colors.badge}`}>
                <span className="text-lg font-bold">+{habit.points}</span>
                <span className="text-sm">points per completion</span>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowInfoPopup(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowInfoPopup(false)
                  setShowSchedulePopup(true)
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <Calendar size={16} />
                  Schedule
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Popup */}
      {showSchedulePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSchedulePopup(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Schedule {habit.name}</h2>
                <button
                  onClick={() => setShowSchedulePopup(false)}
                  className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <p className="text-sm text-white/60">
                Set a time to be reminded about this habit. It will appear in your calendar.
              </p>

              {/* First time slot */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white">First session</label>
                <input
                  type="time"
                  value={scheduleTime1}
                  onChange={(e) => setScheduleTime1(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Toggle for second time */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableSecondTime}
                  onChange={(e) => setEnableSecondTime(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-white/80">Add a second session</span>
              </label>

              {/* Second time slot */}
              {enableSecondTime && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Second session</label>
                  <input
                    type="time"
                    value={scheduleTime2}
                    onChange={(e) => setScheduleTime2(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 text-white border border-white/10 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 flex gap-3">
              <button
                onClick={() => setShowSchedulePopup(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                }}
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
