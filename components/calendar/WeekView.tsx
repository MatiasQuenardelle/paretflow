'use client'

import { useState } from 'react'
import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { Task, Step, useTaskStore } from '@/stores/taskStore'
import { StepDetailPopup } from './StepDetailPopup'

interface WeekViewProps {
  date: Date
  tasks: Task[]
  onToggleStep: (taskId: string, stepId: string) => void
  onSelectDay: (date: Date) => void
  onSelectTask?: (taskId: string) => void
  isExpanded?: boolean
}

interface ScheduledStep {
  step: Step
  task: Task
  hour: number
  minute: number
}

const START_HOUR = 6
const END_HOUR = 23
const HOUR_HEIGHT_EXPANDED = 48
const HOUR_HEIGHT_COLLAPSED = 24 // Compact height to fit all hours without scrolling

export function WeekView({ date, tasks, onToggleStep, onSelectDay, onSelectTask, isExpanded = true }: WeekViewProps) {
  const [selectedStep, setSelectedStep] = useState<{ step: Step; task: Task } | null>(null)
  const { updateStep, toggleStep } = useTaskStore()
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Dynamic hour height based on expanded state
  const hourHeight = isExpanded ? HOUR_HEIGHT_EXPANDED : HOUR_HEIGHT_COLLAPSED

  const getStepsForDay = (day: Date): ScheduledStep[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const steps: ScheduledStep[] = []

    tasks.forEach(task => {
      task.steps.forEach(step => {
        if (step.scheduledDate === dateStr && step.scheduledTime && step.text) {
          const match = step.scheduledTime.match(/^(\d{1,2}):(\d{2})$/)
          if (match) {
            const hour = parseInt(match[1], 10)
            const minute = parseInt(match[2], 10)
            if (hour >= START_HOUR && hour <= END_HOUR) {
              steps.push({ step, task, hour, minute })
            }
          }
        }
      })
    })

    // Sort by time
    steps.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))

    return steps
  }

  const getTimePosition = (hour: number, minute: number = 0) => {
    return ((hour - START_HOUR) * 60 + minute) / 60 * hourHeight
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  const totalHeight = (END_HOUR - START_HOUR) * hourHeight
  // Show fewer hour labels when collapsed for cleaner look
  const hourLabels = isExpanded
    ? [6, 8, 10, 12, 14, 16, 18, 20, 22]
    : [6, 9, 12, 15, 18, 21]

  // Check if today is in the current week
  const todayInWeek = days.find(day => isToday(day))
  const showNowIndicator = todayInWeek && currentHour >= START_HOUR && currentHour <= END_HOUR

  return (
    <div className="h-full flex flex-col">
      {/* Week header */}
      <div className="mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-muted">Click a day column to see details</p>
      </div>

      {/* Week grid with time */}
      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,46,0.95) 0%, rgba(22,22,42,0.98) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Day headers (fixed) */}
        <div className="flex border-b border-white/10">
          {/* Time column spacer */}
          <div className="flex-shrink-0 w-14 border-r border-white/10" />

          {/* Day headers */}
          {days.map((day, index) => {
            const dayIsToday = isToday(day)
            const isSelected = isSameDay(day, date)

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDay(day)}
                className={`flex-1 text-center py-3 cursor-pointer transition-all ${
                  index < 6 ? 'border-r border-white/10' : ''
                } ${
                  isSelected
                    ? 'bg-blue-500/10'
                    : 'hover:bg-white/5'
                } ${
                  dayIsToday ? 'bg-blue-500/20' : ''
                }`}
              >
                <div className="text-[10px] text-white/40 uppercase tracking-wider">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-lg font-semibold mt-0.5 ${
                    dayIsToday
                      ? 'w-8 h-8 mx-auto rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30'
                      : 'text-white/80'
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable time grid (no scroll needed when collapsed) */}
        <div
          className={isExpanded ? "overflow-y-auto" : "overflow-hidden"}
          style={isExpanded ? { maxHeight: 'calc(100vh - 320px)' } : undefined}
        >
          <div className="flex" style={{ height: totalHeight }}>
            {/* Time Labels */}
            <div className="flex-shrink-0 w-14 border-r border-white/10 relative">
              {hourLabels.map((hour) => (
                <div
                  key={hour}
                  className="absolute right-3 text-[11px] text-white/40 font-medium"
                  style={{
                    top: getTimePosition(hour),
                    transform: 'translateY(-50%)'
                  }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Day columns with grid */}
            {days.map((day, dayIndex) => {
              const stepsForDay = getStepsForDay(day)
              const dayIsToday = isToday(day)
              const isSelected = isSameDay(day, date)

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => onSelectDay(day)}
                  className={`flex-1 relative cursor-pointer ${
                    dayIndex < 6 ? 'border-r border-white/10' : ''
                  } ${
                    isSelected
                      ? 'bg-blue-500/5'
                      : 'hover:bg-white/[0.02]'
                  }`}
                >
                  {/* Hour grid lines */}
                  {hourLabels.map((hour) => (
                    <div
                      key={hour}
                      className="absolute left-0 right-0 border-t border-white/5"
                      style={{ top: getTimePosition(hour) }}
                    />
                  ))}

                  {/* Current time indicator (only for today) */}
                  {dayIsToday && showNowIndicator && (
                    <div
                      className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                      style={{ top: getTimePosition(currentHour, currentMinute) }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-lg shadow-red-500/50" />
                      <div className="flex-1 h-[2px] bg-red-500 shadow-lg shadow-red-500/30" />
                    </div>
                  )}

                  {/* Steps for this day */}
                  {stepsForDay.map(({ step, task, hour, minute }) => {
                    const top = getTimePosition(hour, minute)
                    const duration = 45 // Default 45 minutes
                    const height = Math.max((duration / 60) * hourHeight, isExpanded ? 28 : 18)

                    return (
                      <button
                        key={step.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedStep({ step, task })
                        }}
                        className={`absolute left-1 right-1 rounded-md transition-all hover:scale-[1.02] hover:brightness-110 overflow-hidden ${
                          step.completed ? 'opacity-50' : ''
                        }`}
                        style={{
                          top: top + 1,
                          height: height - 2,
                          background: step.completed
                            ? 'linear-gradient(135deg, rgba(75,85,99,0.9) 0%, rgba(55,65,81,0.9) 100%)'
                            : 'linear-gradient(135deg, rgba(59,130,246,0.95) 0%, rgba(6,182,212,0.95) 50%, rgba(16,185,129,0.95) 100%)',
                          boxShadow: step.completed
                            ? 'none'
                            : '0 2px 8px rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <div className="h-full w-full px-1.5 py-0.5 flex flex-col justify-center overflow-hidden">
                          <span className={`font-medium text-white text-left leading-tight text-[9px] truncate ${
                            step.completed ? 'line-through' : ''
                          }`}>
                            {step.text}
                          </span>
                          <span className="text-[8px] text-white/70 truncate">
                            {format(new Date().setHours(hour, minute), 'h:mm a')}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted mt-3">
        <div className="flex items-center gap-1.5">
          <div
            className="w-3 h-2 rounded-sm"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}
          />
          <span>Step</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>Today</span>
        </div>
        {showNowIndicator && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Now</span>
          </div>
        )}
      </div>

      {/* Step Detail Popup */}
      {selectedStep && (
        <StepDetailPopup
          isOpen={!!selectedStep}
          onClose={() => setSelectedStep(null)}
          step={selectedStep.step}
          task={selectedStep.task}
          onToggleStep={() => toggleStep(selectedStep.task.id, selectedStep.step.id)}
          onUpdateStep={(updates) => updateStep(selectedStep.task.id, selectedStep.step.id, updates)}
          onSelectTask={() => onSelectTask?.(selectedStep.task.id)}
        />
      )}
    </div>
  )
}
