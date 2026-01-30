'use client'

import { useState, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import { Task, Step, useTaskStore } from '@/stores/taskStore'
import { useHabitStore, POWER_HABITS, HabitDefinition } from '@/stores/habitStore'
import { StepDetailPopup } from './StepDetailPopup'

interface DayViewProps {
  date: Date
  tasks: Task[]
  onToggleStep: (taskId: string, stepId: string) => void
  onSelectTask?: (taskId: string) => void
  isExpanded?: boolean
  onToggleExpanded?: () => void
  onScheduledItemsChange?: (count: number) => void
  showHabits?: boolean
}

const START_HOUR = 6
const END_HOUR = 23
const HOUR_HEIGHT_COLLAPSED = 20
const HOUR_HEIGHT_EXPANDED = 36

interface ScheduledStep {
  step: Step
  task: Task
  hour: number
  minute: number
}

interface ScheduledHabitItem {
  habit: HabitDefinition
  hour: number
  minute: number
  completed: boolean
}

export function DayView({ date, tasks, onToggleStep, onSelectTask, isExpanded: isExpandedProp, onToggleExpanded, onScheduledItemsChange, showHabits = true }: DayViewProps) {
  const [isExpandedInternal, setIsExpandedInternal] = useState(true)
  const isExpanded = isExpandedProp !== undefined ? isExpandedProp : isExpandedInternal
  const [selectedStep, setSelectedStep] = useState<{ step: Step; task: Task } | null>(null)
  const { updateStep } = useTaskStore()
  const { getScheduledForDate, getCompletionsForDate } = useHabitStore()
  const hourHeight = isExpanded ? HOUR_HEIGHT_EXPANDED : HOUR_HEIGHT_COLLAPSED

  const dateStr = format(date, 'yyyy-MM-dd')
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const showNowIndicator = isToday(date) && currentHour >= START_HOUR && currentHour <= END_HOUR

  // Collect all scheduled steps for the selected date
  const scheduledSteps: ScheduledStep[] = []
  tasks.forEach(task => {
    task.steps.forEach(step => {
      if (step.scheduledDate === dateStr && step.scheduledTime && step.text) {
        const match = step.scheduledTime.match(/^(\d{1,2}):(\d{2})$/)
        if (match) {
          const hour = parseInt(match[1], 10)
          const minute = parseInt(match[2], 10)
          if (hour >= START_HOUR && hour <= END_HOUR) {
            scheduledSteps.push({ step, task, hour, minute })
          }
        }
      }
    })
  })

  // Sort by time
  scheduledSteps.sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))

  // Collect all scheduled habits for the selected date (only if showHabits is true)
  const scheduledHabitsForDate = showHabits ? getScheduledForDate(dateStr) : []
  const completionsForDate = showHabits ? getCompletionsForDate(dateStr) : []
  const scheduledHabits: ScheduledHabitItem[] = scheduledHabitsForDate
    .map(scheduled => {
      const habit = POWER_HABITS.find(h => h.id === scheduled.habitId)
      if (!habit) return null
      const match = scheduled.time.match(/^(\d{1,2}):(\d{2})$/)
      if (!match) return null
      const hour = parseInt(match[1], 10)
      const minute = parseInt(match[2], 10)
      if (hour < START_HOUR || hour > END_HOUR) return null
      const completed = completionsForDate.some(c => c.habitId === habit.id)
      return { habit, hour, minute, completed }
    })
    .filter((item): item is ScheduledHabitItem => item !== null)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))

  const getTimePosition = (hour: number, minute: number = 0) => {
    return ((hour - START_HOUR) * 60 + minute) / 60 * hourHeight
  }

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    if (hour > 12) return `${hour - 12} PM`
    return `${hour} AM`
  }

  // Calculate block positions with overlap handling
  type CalendarBlock = {
    type: 'step'
    item: ScheduledStep
    top: number
    height: number
    left: number
    width: number
  } | {
    type: 'habit'
    item: ScheduledHabitItem
    top: number
    height: number
    left: number
    width: number
  }

  const getCalendarBlocks = () => {
    const blocks: CalendarBlock[] = []
    const columns: { endMinutes: number }[] = []

    // Combine steps and habits into a single list sorted by time
    const allItems: Array<{ type: 'step' | 'habit'; hour: number; minute: number; data: ScheduledStep | ScheduledHabitItem }> = [
      ...scheduledSteps.map(item => ({ type: 'step' as const, hour: item.hour, minute: item.minute, data: item })),
      ...scheduledHabits.map(item => ({ type: 'habit' as const, hour: item.hour, minute: item.minute, data: item })),
    ].sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute))

    allItems.forEach(({ type, hour, minute, data }) => {
      const startMinutes = hour * 60 + minute
      const duration = 45
      const endMinutes = startMinutes + duration

      let column = columns.findIndex(col => col.endMinutes <= startMinutes)
      if (column === -1) {
        column = columns.length
        columns.push({ endMinutes })
      } else {
        columns[column].endMinutes = endMinutes
      }

      const top = getTimePosition(hour, minute)
      const height = (duration / 60) * hourHeight

      const minHeight = isExpanded ? 40 : 24
      if (type === 'step') {
        blocks.push({
          type: 'step',
          item: data as ScheduledStep,
          top,
          height: Math.max(height, minHeight),
          left: 0,
          width: 100
        })
      } else {
        blocks.push({
          type: 'habit',
          item: data as ScheduledHabitItem,
          top,
          height: Math.max(height, minHeight),
          left: 0,
          width: 100
        })
      }
    })

    // Recalculate widths for overlapping blocks
    const totalColumns = Math.max(columns.length, 1)
    const overlapThreshold = isExpanded ? 40 : 24
    if (totalColumns > 1) {
      blocks.forEach((block, index) => {
        const overlapping = blocks.filter((b, i) =>
          i !== index && Math.abs(b.top - block.top) < overlapThreshold
        )
        if (overlapping.length > 0) {
          block.width = 100 / (overlapping.length + 1)
          const colIndex = blocks.slice(0, index + 1).filter(b =>
            Math.abs(b.top - block.top) < overlapThreshold
          ).length - 1
          block.left = colIndex * block.width
        }
      })
    }

    return blocks
  }

  const totalHeight = (END_HOUR - START_HOUR) * hourHeight
  const calendarBlocks = getCalendarBlocks()
  const totalScheduledItems = scheduledSteps.length + scheduledHabits.length

  // Report scheduled items count to parent
  useEffect(() => {
    onScheduledItemsChange?.(totalScheduledItems)
  }, [totalScheduledItems, onScheduledItemsChange])

  // Hour labels
  const hourLabels = isExpanded
    ? Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
    : [6, 9, 12, 15, 18, 21]

  return (
    <div className="h-full flex flex-col">
      {/* Calendar Grid */}
      <div
        className="flex-1 relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, rgba(26,26,46,0.95) 0%, rgba(22,22,42,0.98) 100%)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        <div
          className="overflow-y-auto h-full"
          style={{ maxHeight: 'calc(100vh - 280px)' }}
        >
          <div className="flex">
            {/* Time Labels */}
            <div className="flex-shrink-0 w-14 border-r border-white/10">
              <div className="relative" style={{ height: totalHeight }}>
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
            </div>

            {/* Timeline */}
            <div className="flex-1 relative" style={{ height: totalHeight }}>
              {/* Grid lines */}
              {hourLabels.map((hour) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ top: getTimePosition(hour) }}
                />
              ))}

              {/* Current time indicator */}
              {showNowIndicator && (
                <div
                  className="absolute left-0 right-0 z-20 flex items-center pointer-events-none"
                  style={{ top: getTimePosition(currentHour, currentMinute) }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-1 shadow-lg shadow-red-500/50" />
                  <div className="flex-1 h-[2px] bg-red-500 shadow-lg shadow-red-500/30" />
                </div>
              )}

              {/* Calendar Blocks (Steps and Habits) */}
              {calendarBlocks.map((block) => {
                if (block.type === 'step') {
                  const { item, top, height, left, width } = block
                  return (
                    <button
                      key={item.step.id}
                      onClick={() => setSelectedStep(item)}
                      className={`absolute rounded-lg transition-all hover:scale-[1.02] hover:brightness-110 overflow-hidden group ${
                        item.step.completed ? 'opacity-50' : ''
                      }`}
                      style={{
                        top: top + 2,
                        height: height - 4,
                        left: `calc(${left}% + 8px)`,
                        width: `calc(${width}% - 16px)`,
                        background: item.step.completed
                          ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
                          : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
                        boxShadow: item.step.completed
                          ? 'none'
                          : '0 4px 12px rgba(59, 130, 246, 0.3)'
                      }}
                    >
                      <div className="h-full w-full px-2 py-1 flex flex-col justify-center overflow-hidden">
                        <span className={`font-medium text-white text-left leading-tight ${isExpanded ? 'text-xs' : 'text-[10px]'} ${
                          item.step.completed ? 'line-through' : ''
                        }`} style={{ wordBreak: 'break-word' }}>
                          {item.step.text}
                        </span>
                        {isExpanded && (
                          <span className="text-[9px] text-white/80 mt-0.5 leading-tight truncate">
                            {item.task.title} - {format(new Date().setHours(item.hour, item.minute), 'h:mm a')}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                } else {
                  const { item, top, height, left, width } = block
                  return (
                    <div
                      key={`habit-${item.habit.id}`}
                      className={`absolute rounded-lg transition-all hover:scale-[1.02] hover:brightness-110 overflow-hidden ${
                        item.completed ? 'opacity-50' : ''
                      }`}
                      style={{
                        top: top + 2,
                        height: height - 4,
                        left: `calc(${left}% + 8px)`,
                        width: `calc(${width}% - 16px)`,
                        background: item.completed
                          ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
                          : 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                        boxShadow: item.completed
                          ? 'none'
                          : '0 4px 12px rgba(245, 158, 11, 0.3)'
                      }}
                    >
                      <div className="h-full w-full px-2 py-1 flex flex-col justify-center overflow-hidden">
                        <span className={`font-medium text-white text-left leading-tight ${isExpanded ? 'text-xs' : 'text-[10px]'} ${
                          item.completed ? 'line-through' : ''
                        }`} style={{ wordBreak: 'break-word' }}>
                          {item.habit.name}
                        </span>
                        {isExpanded && (
                          <span className="text-[9px] text-white/80 mt-0.5 leading-tight">
                            {format(new Date().setHours(item.hour, item.minute), 'h:mm a')}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                }
              })}

              {/* Empty state */}
              {totalScheduledItems === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-white/40">No scheduled items</p>
                    <p className="text-xs text-white/25 mt-1">Add time to your steps or habits to see them here</p>
                  </div>
                </div>
              )}
            </div>
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
          <div
            className="w-3 h-2 rounded-sm"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)' }}
          />
          <span>Habit</span>
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
          onToggleStep={() => onToggleStep(selectedStep.task.id, selectedStep.step.id)}
          onUpdateStep={(updates) => updateStep(selectedStep.task.id, selectedStep.step.id, updates)}
          onSelectTask={() => onSelectTask?.(selectedStep.task.id)}
        />
      )}
    </div>
  )
}
