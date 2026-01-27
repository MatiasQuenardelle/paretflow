'use client'

import { format, startOfWeek, addDays, isToday, isSameDay } from 'date-fns'
import { Task, Step } from '@/stores/taskStore'
import { TimeBlock } from './TimeBlock'

interface WeekViewProps {
  date: Date
  tasks: Task[]
  onToggleStep: (taskId: string, stepId: string) => void
  onSelectDay: (date: Date) => void
}

interface ScheduledStep {
  step: Step
  task: Task
}

export function WeekView({ date, tasks, onToggleStep, onSelectDay }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }) // Monday start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const getStepsForDay = (day: Date): ScheduledStep[] => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const steps: ScheduledStep[] = []

    tasks.forEach(task => {
      task.steps.forEach(step => {
        if (step.scheduledDate === dateStr) {
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const stepsForDay = getStepsForDay(day)
          const dayIsToday = isToday(day)
          const isSelected = isSameDay(day, date)

          return (
            <div
              key={day.toISOString()}
              onClick={() => onSelectDay(day)}
              className={`min-h-[200px] p-2 rounded-lg border cursor-pointer transition-colors ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                  : 'border-border hover:border-blue-300'
              }`}
            >
              <div className={`text-center mb-2 pb-2 border-b border-border`}>
                <div className="text-xs text-muted uppercase">
                  {format(day, 'EEE')}
                </div>
                <div
                  className={`text-lg font-semibold ${
                    dayIsToday
                      ? 'w-8 h-8 mx-auto rounded-full bg-blue-600 text-white flex items-center justify-center'
                      : ''
                  }`}
                >
                  {format(day, 'd')}
                </div>
              </div>

              <div className="space-y-1">
                {stepsForDay.slice(0, 4).map(({ step, task }) => (
                  <TimeBlock
                    key={step.id}
                    step={step}
                    task={task}
                    onToggle={() => onToggleStep(task.id, step.id)}
                    compact
                  />
                ))}
                {stepsForDay.length > 4 && (
                  <div className="text-xs text-muted text-center pt-1">
                    +{stepsForDay.length - 4} more
                  </div>
                )}
                {stepsForDay.length === 0 && (
                  <div className="text-xs text-muted text-center py-4">
                    No steps
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
