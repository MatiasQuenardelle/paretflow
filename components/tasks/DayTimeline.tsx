'use client'

import { useState, useRef } from 'react'
import { format, isToday, setHours, setMinutes } from 'date-fns'
import { Clock } from 'lucide-react'
import { Task } from '@/stores/taskStore'

interface DayTimelineProps {
  tasks: Task[]
  selectedDate: Date
  onSelectTask: (id: string) => void
  onUpdateTaskSchedule: (id: string, scheduledDate?: string, scheduledTime?: string) => void
}

// Hours to show in the timeline (6 AM to 10 PM)
const START_HOUR = 6
const END_HOUR = 22
const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)

export function DayTimeline({ tasks, selectedDate, onSelectTask, onUpdateTaskSchedule }: DayTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null)
  const [draggingTask, setDraggingTask] = useState<string | null>(null)

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  // Get current time position for "now" indicator
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const showNowIndicator = isToday(selectedDate) && currentHour >= START_HOUR && currentHour <= END_HOUR

  // Calculate position percentage for a given time
  const getTimePosition = (hour: number, minute: number = 0) => {
    const totalMinutes = (hour - START_HOUR) * 60 + minute
    const totalRange = (END_HOUR - START_HOUR + 1) * 60
    return (totalMinutes / totalRange) * 100
  }

  // Parse time string (HH:MM) to hour and minute
  const parseTime = (time: string): { hour: number; minute: number } | null => {
    const match = time.match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return null
    return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) }
  }

  // Tasks with scheduled times
  const scheduledTasks = tasks.filter(t => t.scheduledTime && !t.completed)

  // Handle clicking on the timeline to schedule a task
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return

    const rect = timelineRef.current.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const percentage = clickY / rect.height
    const totalMinutes = percentage * (END_HOUR - START_HOUR + 1) * 60
    const hour = Math.floor(totalMinutes / 60) + START_HOUR
    const minute = Math.round((totalMinutes % 60) / 15) * 15 // Snap to 15 min

    // If we have a task being dragged, update its time
    if (draggingTask) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      onUpdateTaskSchedule(draggingTask, selectedDateStr, timeStr)
      setDraggingTask(null)
    }
  }

  // Tasks without scheduled times (to show in unscheduled section)
  const unscheduledTasks = tasks.filter(t => !t.scheduledTime && !t.completed)

  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <Clock size={14} className="text-muted" />
        <span className="text-sm font-medium text-muted">Day Schedule</span>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="relative h-40 bg-border/20 rounded-lg overflow-hidden cursor-crosshair"
        onClick={handleTimelineClick}
      >
        {/* Hour markers */}
        {HOURS.map((hour) => {
          const position = getTimePosition(hour)
          const isMainHour = hour % 3 === 0
          return (
            <div
              key={hour}
              className="absolute left-0 right-0 border-t border-border/50"
              style={{ top: `${position}%` }}
            >
              {isMainHour && (
                <span className="absolute left-1 -top-2.5 text-[10px] text-muted">
                  {format(setHours(setMinutes(new Date(), 0), hour), 'ha')}
                </span>
              )}
            </div>
          )
        })}

        {/* Current time indicator */}
        {showNowIndicator && (
          <div
            className="absolute left-0 right-0 h-0.5 bg-red-500 z-10"
            style={{ top: `${getTimePosition(currentHour, currentMinute)}%` }}
          >
            <div className="absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>
        )}

        {/* Scheduled tasks */}
        {scheduledTasks.map((task) => {
          const time = parseTime(task.scheduledTime!)
          if (!time) return null

          const position = getTimePosition(time.hour, time.minute)
          // Estimate task duration based on pomodoros (25 min each)
          const durationMinutes = (task.estimatedPomodoros || 1) * 25
          const height = (durationMinutes / ((END_HOUR - START_HOUR + 1) * 60)) * 100

          return (
            <div
              key={task.id}
              onClick={(e) => {
                e.stopPropagation()
                onSelectTask(task.id)
              }}
              className="absolute left-8 right-2 rounded px-2 py-1 bg-blue-500/20 border-l-2 border-blue-500 cursor-pointer hover:bg-blue-500/30 transition-colors overflow-hidden"
              style={{
                top: `${position}%`,
                height: `${Math.max(height, 5)}%`,
              }}
            >
              <div className="text-xs font-medium truncate">{task.title}</div>
              <div className="text-[10px] text-muted">
                {format(setHours(setMinutes(new Date(), time.minute), time.hour), 'h:mm a')}
              </div>
            </div>
          )
        })}
      </div>

      {/* Unscheduled tasks - drag to schedule */}
      {unscheduledTasks.length > 0 && (
        <div className="mt-3">
          <p className="text-[10px] text-muted mb-2">Tap a task, then tap the timeline to schedule:</p>
          <div className="flex flex-wrap gap-1.5">
            {unscheduledTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setDraggingTask(draggingTask === task.id ? null : task.id)}
                className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                  draggingTask === task.id
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-surface border-border hover:border-blue-300'
                }`}
              >
                {task.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
