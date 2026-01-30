'use client'

import { useState } from 'react'
import { format, addDays, startOfWeek, getDay } from 'date-fns'
import { ChevronDown, Clock, X, CalendarPlus, Check, CalendarDays, CalendarRange } from 'lucide-react'
import { HabitDefinition, useHabitStore } from '@/stores/habitStore'

type ScheduleMode = 'today' | 'select-days' | 'every-day'

const DAYS_OF_WEEK = [
  { id: 0, short: 'S', name: 'Sunday' },
  { id: 1, short: 'M', name: 'Monday' },
  { id: 2, short: 'T', name: 'Tuesday' },
  { id: 3, short: 'W', name: 'Wednesday' },
  { id: 4, short: 'T', name: 'Thursday' },
  { id: 5, short: 'F', name: 'Friday' },
  { id: 6, short: 'S', name: 'Saturday' },
]

interface HabitCardProps {
  habit: HabitDefinition
}

const colorGradients: Record<string, string> = {
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
  blue: 'from-blue-500 to-blue-600',
  red: 'from-red-500 to-red-600',
  green: 'from-green-500 to-green-600',
  rose: 'from-rose-500 to-rose-600',
  orange: 'from-orange-500 to-orange-600',
}

const colorShadows: Record<string, string> = {
  purple: 'shadow-purple-500/30 hover:shadow-purple-500/50',
  cyan: 'shadow-cyan-500/30 hover:shadow-cyan-500/50',
  blue: 'shadow-blue-500/30 hover:shadow-blue-500/50',
  red: 'shadow-red-500/30 hover:shadow-red-500/50',
  green: 'shadow-green-500/30 hover:shadow-green-500/50',
  rose: 'shadow-rose-500/30 hover:shadow-rose-500/50',
  orange: 'shadow-orange-500/30 hover:shadow-orange-500/50',
}

const colorBorders: Record<string, string> = {
  purple: 'border-purple-500/30',
  cyan: 'border-cyan-500/30',
  blue: 'border-blue-500/30',
  red: 'border-red-500/30',
  green: 'border-green-500/30',
  rose: 'border-rose-500/30',
  orange: 'border-orange-500/30',
}

const colorBg: Record<string, string> = {
  purple: 'bg-purple-500/10',
  cyan: 'bg-cyan-500/10',
  blue: 'bg-blue-500/10',
  red: 'bg-red-500/10',
  green: 'bg-green-500/10',
  rose: 'bg-rose-500/10',
  orange: 'bg-orange-500/10',
}

const colorText: Record<string, string> = {
  purple: 'text-purple-400',
  cyan: 'text-cyan-400',
  blue: 'text-blue-400',
  red: 'text-red-400',
  green: 'text-green-400',
  rose: 'text-rose-400',
  orange: 'text-orange-400',
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
    red: 'bg-red-500',
    green: 'bg-green-500',
    rose: 'bg-rose-500',
    orange: 'bg-orange-500',
  }

  const shadowClasses: Record<string, string> = {
    purple: 'shadow-purple-500/40',
    cyan: 'shadow-cyan-500/40',
    blue: 'shadow-blue-500/40',
    red: 'shadow-red-500/40',
    green: 'shadow-green-500/40',
    rose: 'shadow-rose-500/40',
    orange: 'shadow-orange-500/40',
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 shrink-0 ${
        checked
          ? `${colorClasses[color] || colorClasses.purple} animate-bounce-in shadow-lg ${shadowClasses[color] || shadowClasses.purple}`
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
  const [scheduleMode, setScheduleMode] = useState<ScheduleMode>('today')
  const [selectedDays, setSelectedDays] = useState<number[]>([]) // Days of week (0-6)

  const {
    completeHabit,
    uncompleteHabit,
    isCompletedToday,
    scheduleHabit,
    scheduleHabitForDays,
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

  const getDatesForNextWeeks = (daysOfWeek: number[], weeks: number = 4): string[] => {
    const dates: string[] = []
    const startDate = new Date()

    for (let i = 0; i < weeks * 7; i++) {
      const date = addDays(startDate, i)
      const dayOfWeek = getDay(date)
      if (daysOfWeek.includes(dayOfWeek)) {
        dates.push(format(date, 'yyyy-MM-dd'))
      }
    }
    return dates
  }

  const handleSchedule = () => {
    if (!scheduleTime) {
      setShowSchedulePopup(false)
      return
    }

    if (scheduleMode === 'today') {
      scheduleHabit(habit.id, today, scheduleTime)
    } else if (scheduleMode === 'every-day') {
      // Schedule for every day for the next 4 weeks
      const allDays = [0, 1, 2, 3, 4, 5, 6]
      const dates = getDatesForNextWeeks(allDays, 4)
      scheduleHabitForDays(habit.id, dates, scheduleTime)
    } else if (scheduleMode === 'select-days' && selectedDays.length > 0) {
      // Schedule for selected days of the week for the next 4 weeks
      const dates = getDatesForNextWeeks(selectedDays, 4)
      scheduleHabitForDays(habit.id, dates, scheduleTime)
    }

    setShowSchedulePopup(false)
    setScheduleMode('today')
    setSelectedDays([])
  }

  const toggleDaySelection = (dayId: number) => {
    setSelectedDays(prev =>
      prev.includes(dayId)
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    )
  }

  const formatTimeDisplay = (time: string) => {
    const [h, m] = time.split(':').map(Number)
    return format(new Date(0, 0, 0, h, m), 'h:mm a')
  }

  return (
    <>
      <div
        className={`rounded-xl border ${colorBorders[habit.color] || 'border-white/10'} bg-surface/80 backdrop-blur-xl overflow-hidden transition-all duration-300 ${
          isExpanded ? 'shadow-2xl shadow-black/10 dark:shadow-black/30' : 'shadow-lg shadow-black/5 dark:shadow-black/20'
        }`}
      >
        {/* Always visible: collapsed card */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center gap-3 p-3 text-left"
        >
          {/* Thumbnail image */}
          <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
            <img
              src={habit.illustration}
              alt={habit.name}
              className="w-full h-full object-cover"
            />
            <div className={`absolute inset-0 ${colorBg[habit.color] || 'bg-white/10'} mix-blend-overlay`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`font-medium transition-all duration-200 truncate ${
                  completed ? 'line-through text-muted' : ''
                }`}
              >
                {habit.name}
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded-md ${colorBg[habit.color]} ${colorText[habit.color]} font-medium shrink-0`}>
                +{habit.points}
              </span>
            </div>
            <p className="text-xs text-muted truncate mt-0.5">{habit.description}</p>
          </div>

          {/* Checkbox */}
          <AnimatedCheckbox
            checked={completed}
            onToggle={handleToggleComplete}
            color={habit.color}
          />

          <ChevronDown
            className={`w-5 h-5 text-muted transition-transform duration-300 shrink-0 ${
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

              {/* Schedule Mode Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Schedule for</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => setScheduleMode('today')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      scheduleMode === 'today'
                        ? `${colorBg[habit.color]} border-${habit.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <CalendarPlus size={18} className={scheduleMode === 'today' ? colorText[habit.color] : 'text-muted'} />
                    <div className="text-left">
                      <p className="text-sm font-medium">Today only</p>
                      <p className="text-xs text-muted">Add to today's calendar</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setScheduleMode('select-days')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      scheduleMode === 'select-days'
                        ? `${colorBg[habit.color]} border-${habit.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <CalendarDays size={18} className={scheduleMode === 'select-days' ? colorText[habit.color] : 'text-muted'} />
                    <div className="text-left">
                      <p className="text-sm font-medium">Select days</p>
                      <p className="text-xs text-muted">Choose specific days of the week</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setScheduleMode('every-day')}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      scheduleMode === 'every-day'
                        ? `${colorBg[habit.color]} border-${habit.color}-500/50`
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <CalendarRange size={18} className={scheduleMode === 'every-day' ? colorText[habit.color] : 'text-muted'} />
                    <div className="text-left">
                      <p className="text-sm font-medium">Every day</p>
                      <p className="text-xs text-muted">Schedule for the next 4 weeks</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Day selection (only shown when select-days mode is active) */}
              {scheduleMode === 'select-days' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select days of the week</label>
                  <div className="flex gap-1.5 justify-between">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day.id}
                        onClick={() => toggleDaySelection(day.id)}
                        className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${
                          selectedDays.includes(day.id)
                            ? `bg-gradient-to-r ${colorGradients[habit.color]} text-white shadow-lg`
                            : 'bg-white/5 border border-white/10 hover:bg-white/10'
                        }`}
                        title={day.name}
                      >
                        {day.short}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted">
                    {selectedDays.length === 0
                      ? 'Select at least one day'
                      : `Will be scheduled for ${selectedDays.length} day${selectedDays.length > 1 ? 's' : ''} per week`}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Time</label>
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
                onClick={() => {
                  setShowSchedulePopup(false)
                  setScheduleMode('today')
                  setSelectedDays([])
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/5 border border-white/10 dark:border-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSchedule}
                disabled={scheduleMode === 'select-days' && selectedDays.length === 0}
                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-b ${colorGradients[habit.color] || colorGradients.purple} text-white shadow-lg ${colorShadows[habit.color] || colorShadows.purple} transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100`}
              >
                <CalendarPlus size={18} />
                {scheduleMode === 'today' && 'Add to Today'}
                {scheduleMode === 'select-days' && 'Schedule Days'}
                {scheduleMode === 'every-day' && 'Schedule Daily'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
