'use client'

import { useState } from 'react'
import { format, isToday, setHours, setMinutes } from 'date-fns'
import { Task } from '@/stores/taskStore'

interface DayTimelineProps {
  tasks: Task[]
  selectedDate: Date
  onSelectTask: (id: string) => void
  onUpdateTaskSchedule: (id: string, scheduledDate?: string, scheduledTime?: string) => void
}

const START_HOUR = 6
const END_HOUR = 22
const HOUR_HEIGHT = 48 // pixels per hour in expanded view
const COLLAPSED_HOUR_HEIGHT = 24 // pixels per hour in collapsed view

export function DayTimeline({ tasks, selectedDate, onSelectTask, onUpdateTaskSchedule }: DayTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedTaskForScheduling, setSelectedTaskForScheduling] = useState<string | null>(null)

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const hourHeight = isExpanded ? HOUR_HEIGHT : COLLAPSED_HOUR_HEIGHT

  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const showNowIndicator = isToday(selectedDate) && currentHour >= START_HOUR && currentHour <= END_HOUR

  const getTimePosition = (hour: number, minute: number = 0) => {
    return ((hour - START_HOUR) * 60 + minute) / 60 * hourHeight
  }

  const parseTime = (time: string): { hour: number; minute: number } | null => {
    const match = time.match(/^(\d{1,2}):(\d{2})$/)
    if (!match) return null
    return { hour: parseInt(match[1], 10), minute: parseInt(match[2], 10) }
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  const scheduledTasks = tasks.filter(t => t.scheduledTime && !t.completed)
  const unscheduledTasks = tasks.filter(t => !t.scheduledTime && !t.completed)

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!selectedTaskForScheduling) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickY = e.clientY - rect.top
    const totalMinutes = (clickY / hourHeight) * 60
    const hour = Math.floor(totalMinutes / 60) + START_HOUR
    const minute = Math.round((totalMinutes % 60) / 15) * 15

    const timeStr = `${hour.toString().padStart(2, '0')}:${(minute % 60).toString().padStart(2, '0')}`
    onUpdateTaskSchedule(selectedTaskForScheduling, selectedDateStr, timeStr)
    setSelectedTaskForScheduling(null)
  }

  // Calculate task block positions (handle overlapping)
  const getTaskBlocks = () => {
    const sorted = [...scheduledTasks].sort((a, b) => {
      const timeA = parseTime(a.scheduledTime!)
      const timeB = parseTime(b.scheduledTime!)
      if (!timeA || !timeB) return 0
      return (timeA.hour * 60 + timeA.minute) - (timeB.hour * 60 + timeB.minute)
    })

    const blocks: { task: Task; top: number; height: number; left: number; width: number }[] = []
    const columns: { endTime: number }[] = []

    sorted.forEach((task) => {
      const time = parseTime(task.scheduledTime!)
      if (!time) return

      const startMinutes = time.hour * 60 + time.minute
      const duration = 60 // Default 1 hour duration
      const endMinutes = startMinutes + duration

      // Find available column
      let column = columns.findIndex(col => col.endTime <= startMinutes)
      if (column === -1) {
        column = columns.length
        columns.push({ endTime: endMinutes })
      } else {
        columns[column].endTime = endMinutes
      }

      const top = getTimePosition(time.hour, time.minute)
      const height = (duration / 60) * hourHeight

      blocks.push({
        task,
        top,
        height: Math.max(height, isExpanded ? 40 : 20),
        left: column * (100 / (columns.length + 1)),
        width: 100 / (columns.length + 1)
      })
    })

    // Recalculate widths based on final column count
    const totalColumns = Math.max(columns.length, 1)
    blocks.forEach((block, index) => {
      block.width = 100 / totalColumns
      const col = blocks.slice(0, index + 1).filter(b =>
        Math.abs(b.top - block.top) < (isExpanded ? 40 : 20)
      ).length - 1
      block.left = col * (100 / totalColumns)
    })

    return blocks
  }

  if (tasks.length === 0) {
    return null
  }

  const totalHeight = (END_HOUR - START_HOUR) * hourHeight
  const taskBlocks = getTaskBlocks()

  // Hours to display labels
  const hourLabels = isExpanded
    ? Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
    : [6, 9, 12, 15, 18, 21]

  return (
    <div className="mt-4 pt-4 border-t border-border/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted uppercase tracking-wide">Schedule</span>
          {scheduledTasks.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
              {scheduledTasks.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-border/30"
        >
          <svg
            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      {/* Calendar Grid */}
      <div
        className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(15,15,15,0.9) 0%, rgba(10,10,10,0.95) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div className="flex">
          {/* Time Labels Column */}
          <div className="flex-shrink-0 w-12 border-r border-border/30">
            <div className="relative" style={{ height: totalHeight }}>
              {hourLabels.map((hour) => {
                const top = getTimePosition(hour)
                return (
                  <div
                    key={hour}
                    className="absolute right-2 text-[10px] text-muted/70 font-medium"
                    style={{
                      top: top,
                      transform: 'translateY(-50%)'
                    }}
                  >
                    {formatHour(hour)}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Timeline Area */}
          <div
            className={`flex-1 relative ${selectedTaskForScheduling ? 'cursor-crosshair' : ''}`}
            style={{ height: totalHeight }}
            onClick={handleTimelineClick}
          >
            {/* Hour grid lines */}
            {hourLabels.map((hour) => {
              const top = getTimePosition(hour)
              return (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-border/20"
                  style={{ top }}
                />
              )
            })}

            {/* Current time indicator */}
            {showNowIndicator && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center"
                style={{ top: getTimePosition(currentHour, currentMinute) }}
              >
                <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
                <div className="flex-1 h-0.5 bg-red-500/80" />
              </div>
            )}

            {/* Task Blocks */}
            {taskBlocks.map(({ task, top, height, left, width }) => {
              const time = parseTime(task.scheduledTime!)
              return (
                <button
                  key={task.id}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectTask(task.id)
                  }}
                  className="absolute rounded-lg transition-all hover:scale-[1.02] hover:shadow-lg group overflow-hidden"
                  style={{
                    top: top + 1,
                    height: height - 2,
                    left: `calc(${left}% + 4px)`,
                    width: `calc(${width}% - 8px)`,
                    background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <div className="h-full w-full p-2 flex flex-col justify-start">
                    <span className="text-[11px] font-medium text-white truncate text-left">
                      {task.title}
                    </span>
                    {isExpanded && time && (
                      <span className="text-[9px] text-white/70 mt-0.5">
                        {format(setHours(setMinutes(new Date(), time.minute), time.hour), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </button>
              )
            })}

            {/* Empty state */}
            {scheduledTasks.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-xs text-muted/50">No tasks scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] text-muted mt-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-2 rounded-sm" style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }} />
          <span>Task</span>
        </div>
        {showNowIndicator && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span>Now</span>
          </div>
        )}
      </div>

      {/* Unscheduled tasks */}
      {unscheduledTasks.length > 0 && (
        <div className="mt-4">
          <p className="text-[10px] text-muted mb-2">
            {selectedTaskForScheduling ? 'Tap the timeline to set time:' : 'Tap to schedule:'}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {unscheduledTasks.map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTaskForScheduling(
                  selectedTaskForScheduling === task.id ? null : task.id
                )}
                className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all ${
                  selectedTaskForScheduling === task.id
                    ? 'border-transparent scale-105 text-white'
                    : 'bg-surface/50 border-border/50 hover:border-blue-400/50'
                }`}
                style={selectedTaskForScheduling === task.id ? {
                  background: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                } : {}}
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
