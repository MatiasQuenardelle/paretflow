'use client'

import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { Task, Step } from '@/stores/taskStore'

interface WeekViewProps {
  date: Date
  tasks: Task[]
  onToggleStep: (taskId: string, stepId: string) => void
  onSelectDay: (date: Date) => void
  onSelectTask?: (taskId: string) => void
}

interface ScheduledStep {
  step: Step
  task: Task
}

export function WeekView({ date, tasks, onToggleStep, onSelectDay, onSelectTask }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getStepsForDay = (day: Date): ScheduledStep[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const steps: ScheduledStep[] = []

    tasks.forEach(task => {
      task.steps.forEach(step => {
        if (step.scheduledDate === dateStr && step.text) {
          steps.push({ step, task })
        }
      })
    })

    // Sort by time
    steps.sort((a, b) => {
      const timeA = a.step.scheduledTime || '23:59'
      const timeB = b.step.scheduledTime || '23:59'
      return timeA.localeCompare(timeB)
    })

    return steps
  }

  const formatTime = (time: string | undefined) => {
    if (!time) return ''
    const [h, m] = time.split(':').map(Number)
    const date = new Date(0, 0, 0, h, m)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Week header */}
      <div className="mb-4 pb-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">
          {format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}
        </h3>
        <p className="text-sm text-muted">Click a day to see details</p>
      </div>

      {/* Week grid */}
      <div
        className="flex-1 rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,46,0.95) 0%, rgba(22,22,42,0.98) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div className="grid grid-cols-7 h-full">
          {days.map((day, index) => {
            const stepsForDay = getStepsForDay(day)
            const dayIsToday = isToday(day)
            const isSelected = isSameDay(day, date)

            return (
              <div
                key={day.toISOString()}
                onClick={() => onSelectDay(day)}
                className={`flex flex-col cursor-pointer transition-all ${
                  index < 6 ? 'border-r border-white/10' : ''
                } ${
                  isSelected
                    ? 'bg-blue-500/10'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Day header */}
                <div className={`text-center py-3 border-b border-white/10 ${
                  dayIsToday ? 'bg-blue-500/20' : ''
                }`}>
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

                {/* Day content */}
                <div className="flex-1 p-1.5 space-y-1 overflow-y-auto">
                  {stepsForDay.slice(0, 5).map(({ step, task }) => (
                    <button
                      key={step.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (onSelectTask) {
                          onSelectTask(task.id)
                        }
                      }}
                      className={`w-full text-left rounded-md px-1.5 py-1 transition-all hover:scale-[1.02] ${
                        step.completed ? 'opacity-50' : ''
                      }`}
                      style={{
                        background: step.completed
                          ? 'linear-gradient(135deg, rgba(75,85,99,0.8) 0%, rgba(55,65,81,0.8) 100%)'
                          : 'linear-gradient(135deg, rgba(59,130,246,0.9) 0%, rgba(6,182,212,0.9) 50%, rgba(16,185,129,0.9) 100%)',
                        boxShadow: step.completed
                          ? 'none'
                          : '0 2px 6px rgba(59, 130, 246, 0.25)'
                      }}
                    >
                      <div className={`text-[10px] font-medium text-white truncate ${
                        step.completed ? 'line-through' : ''
                      }`}>
                        {step.text}
                      </div>
                      {step.scheduledTime && (
                        <div className="text-[9px] text-white/60">
                          {formatTime(step.scheduledTime)}
                        </div>
                      )}
                    </button>
                  ))}
                  {stepsForDay.length > 5 && (
                    <div className="text-[10px] text-white/40 text-center pt-1">
                      +{stepsForDay.length - 5} more
                    </div>
                  )}
                  {stepsForDay.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[10px] text-white/20">No steps</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
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
      </div>
    </div>
  )
}
