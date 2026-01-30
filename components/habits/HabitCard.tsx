'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { ChevronDown, Clock, Calendar, X, CalendarPlus, Check } from 'lucide-react'
import { HabitDefinition, useHabitStore } from '@/stores/habitStore'

interface HabitCardProps {
  habit: HabitDefinition
}

const colorGradients: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
  blue: 'from-blue-500 to-blue-600',
}

const colorShadows: Record<string, string> = {
  purple: 'shadow-purple-500/30 hover:shadow-purple-500/50',
  cyan: 'shadow-cyan-500/30 hover:shadow-cyan-500/50',
  blue: 'shadow-blue-500/30 hover:shadow-blue-500/50',
}

function AnimatedCheckbox({
  checked,
  onToggle,
  color,
}: {
  checked: boolean
  onToggle: () => void
  color: string
}) {
  const colorClasses: Record<string, string> = {
    purple: 'bg-purple-500',
    cyan: 'bg-cyan-500',
    blue: 'bg-blue-500',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 ${
        checked
          ? `${colorClasses[color] || colorClasses.purple} animate-bounce-in shadow-lg ${color === 'purple' ? 'shadow-purple-500/40' : color === 'blue' ? 'shadow-blue-500/40' : 'shadow-cyan-500/40'}`
          : 'border-2 border-white/20 hover:border-white/40 dark:border-white/10 dark:hover:border-white/20'
      }`}
    >
      {checked && (
        <svg
          className="w-4 h-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" className="animate-checkmark" />
        </svg>
      )}
    </button>
  )
}

export function HabitCard({ habit }: HabitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSchedulePopup, setShowSchedulePopup] = useState(false)
  const [scheduleTime, setScheduleTime] = useState(habit.suggestedTime)

  const {
    completeHabit,
    uncompleteHabit,
    isCompletedToday,
    scheduleHabit,
    getScheduledForDate,
  } = useHabitStore()

  const today = format(new Date(), 'yyyy-MM-dd')
  const completed = isCompletedToday(habit.id)
  const scheduledToday = getScheduledForDate(today).filter(s => s.habitId === habit.id)

  const handleToggleComplete = () => {
    if (completed) {
      uncompleteHabit(habit.id, today)
    } else {
      completeHabit(habit.id)
    }
  }

  const handleSchedule = () => {
    if (scheduleTime) {
      scheduleHabit(habit.id, today, scheduleTime)
    }
    setShowSchedulePopup(false)
  }

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return format(new Date(0, 0, 0, h, m), 'h:mm a')
  }

  return (
    <>
      <div
        className={`rounded-xl border border-white/10 dark:border-white/5 bg-surface/80 backdrop-blur-xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'shadow-2xl shadow-black/10 dark:shadow-black/30' : 'shadow-lg shadow-black/5 dark:shadow-black/20'
        }`}
      >
        {/* Always visible: checkbox row */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 p-4 text-left"
        >
          <AnimatedCheckbox
            checked={completed}
            onToggle={handleToggleComplete}
            color={habit.color}
          />
          <span
            className={`flex-1 font-medium transition-all duration-200 ${
              completed ? 'line-through text-muted' : ''
            }`}
          >
            {habit.name}
          </span>
          <ChevronDown
            className={`w-5 h-5 text-muted transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Expandable content */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {/* Illustration */}
          <div className="relative h-40 overflow-hidden">
            <img
              src={habit.illustration}
              alt={habit.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-surface/90 to-transparent" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 font-medium">
                +{habit.points} pts
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted">{habit.description}</p>

            {/* Why This Matters */}
            <div className="rounded-lg bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/5 p-3">
              <p className="text-xs text-muted uppercase tracking-wider mb-1">
                Why This Matters
              </p>
              <p className="text-sm leading-relaxed">{habit.benefit}</p>
            </div>

            {/* Schedule CTA Section */}
            <div className="rounded-xl overflow-hidden border border-white/10 dark:border-white/5">
              {scheduledToday.length > 0 ? (
                // Already scheduled state
                <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-green-400">Scheduled for today</p>
                      <p className="text-xs text-muted">
                        {scheduledToday.map(s => formatTimeDisplay(s.time)).join(', ')}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowSchedulePopup(true)
                      }}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                // Not scheduled - CTA state
                <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Best time: {formatTimeDisplay(habit.suggestedTime)}</p>
                      <p className="text-xs text-muted">Schedule it to build consistency</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowSchedulePopup(true)
                    }}
                    className={`w-full py-3 px-4 rounded-xl bg-gradient-to-r ${colorGradients[habit.color] || colorGradients.purple} text-white font-medium text-sm shadow-lg ${colorShadows[habit.color] || colorShadows.purple} transition-all active:scale-[0.98] flex items-center justify-center gap-2`}
                  >
                    <CalendarPlus size={18} />
                    Add to Today's Calendar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Popup */}
      {showSchedulePopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSchedulePopup(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
          <div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-surface/90 backdrop-blur-xl border border-white/10 dark:border-white/5 shadow-2xl shadow-black/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/10 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{habit.name}</h2>
                  <p className="text-xs text-muted">Add to your calendar</p>
                </div>
                <button
                  onClick={() => setShowSchedulePopup(false)}
                  className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
                <p className="text-xs text-amber-400 font-medium mb-1">Recommended time</p>
                <p className="text-sm text-muted">
                  {formatTimeDisplay(habit.suggestedTime)} is optimal for this habit
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Select time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 dark:border-white/5 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all text-lg"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/10 dark:border-white/5 flex gap-3">
              <button
                onClick={() => setShowSchedulePopup(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-b ${colorGradients[habit.color] || colorGradients.purple} text-white shadow-lg ${colorShadows[habit.color] || colorShadows.purple} transition-all flex items-center justify-center gap-2 active:scale-[0.98]`}
              >
                <CalendarPlus size={18} />
                Add to Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
