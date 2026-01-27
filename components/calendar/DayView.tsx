'use client'

import { format, isToday, parseISO } from 'date-fns'
import { Task, Step } from '@/stores/taskStore'
import { TimeBlock } from './TimeBlock'
import { formatTimeSlot } from '@/lib/utils'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onToggleStep: (taskId: string, stepId: string) => void
}

interface ScheduledStep {
  step: Step
  task: Task
}

export function DayView({ date, tasks, onToggleStep }: DayViewProps) {
  const dateStr = format(date, 'yyyy-MM-dd')

  // Get all steps scheduled for this day
  const scheduledSteps: ScheduledStep[] = []
  tasks.forEach(task => {
    task.steps.forEach(step => {
      if (step.scheduledDate === dateStr && step.scheduledTime) {
        scheduledSteps.push({ step, task })
      }
    })
  })

  // Sort by time
  scheduledSteps.sort((a, b) => {
    const timeA = a.step.scheduledTime || '00:00'
    const timeB = b.step.scheduledTime || '00:00'
    return timeA.localeCompare(timeB)
  })

  // Group by hour
  const hours = Array.from({ length: 14 }, (_, i) => i + 6) // 6 AM to 7 PM

  const getStepsForHour = (hour: number) => {
    return scheduledSteps.filter(({ step }) => {
      if (!step.scheduledTime) return false
      const stepHour = parseInt(step.scheduledTime.split(':')[0])
      return stepHour === hour
    })
  }

  const dayIsToday = isToday(date)

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 bg-surface z-10 pb-4 border-b border-border mb-4">
        <h3 className="text-lg font-semibold">
          {format(date, 'EEEE, MMMM d')}
          {dayIsToday && (
            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
              Today
            </span>
          )}
        </h3>
        <p className="text-sm text-muted">
          {scheduledSteps.length} scheduled {scheduledSteps.length === 1 ? 'step' : 'steps'}
        </p>
      </div>

      {scheduledSteps.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <p>No scheduled steps for this day</p>
          <p className="text-sm mt-1">Add times to steps in the Tasks view</p>
        </div>
      ) : (
        <div className="space-y-1">
          {hours.map(hour => {
            const stepsForHour = getStepsForHour(hour)
            if (stepsForHour.length === 0) return null

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-16 flex-shrink-0 text-sm text-muted pt-3">
                  {formatTimeSlot(`${hour.toString().padStart(2, '0')}:00`)}
                </div>
                <div className="flex-1 space-y-2 py-2">
                  {stepsForHour.map(({ step, task }) => (
                    <TimeBlock
                      key={step.id}
                      step={step}
                      task={task}
                      onToggle={() => onToggleStep(task.id, step.id)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
