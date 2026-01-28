'use client'

import { useState, useEffect } from 'react'
import { format, isToday } from 'date-fns'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { Task, Step, useTaskStore } from '@/stores/taskStore'
import { StepDetailPopup } from './StepDetailPopup'

interface CalendarPopupProps {
  isOpen: boolean
  onClose: () => void
  tasks: Task[]
  selectedDate: Date
  onSelectTask: (id: string) => void
}

const START_HOUR = 6
const END_HOUR = 23
const HOUR_HEIGHT_COLLAPSED = 20
const HOUR_HEIGHT_EXPANDED = 48

interface ScheduledStep {
  step: Step
  task: Task
  hour: number
  minute: number
}

export function CalendarPopup({ isOpen, onClose, tasks, selectedDate, onSelectTask }: CalendarPopupProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedStep, setSelectedStep] = useState<{ step: Step; task: Task } | null>(null)
  const { updateStep, toggleStep } = useTaskStore()
  const hourHeight = isExpanded ? HOUR_HEIGHT_EXPANDED : HOUR_HEIGHT_COLLAPSED

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()
  const showNowIndicator = isToday(selectedDate) && currentHour >= START_HOUR && currentHour <= END_HOUR

  // Collect all scheduled steps for the selected date
  const scheduledSteps: ScheduledStep[] = []
  tasks.forEach(task => {
    task.steps.forEach(step => {
      if (step.scheduledDate === selectedDateStr && step.scheduledTime && step.text) {
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
  const getStepBlocks = () => {
    const blocks: { item: ScheduledStep; top: number; height: number; left: number; width: number }[] = []
    const columns: { endMinutes: number }[] = []

    scheduledSteps.forEach((item) => {
      const startMinutes = item.hour * 60 + item.minute
      const duration = 45 // 45 min default
      const endMinutes = startMinutes + duration

      let column = columns.findIndex(col => col.endMinutes <= startMinutes)
      if (column === -1) {
        column = columns.length
        columns.push({ endMinutes })
      } else {
        columns[column].endMinutes = endMinutes
      }

      const top = getTimePosition(item.hour, item.minute)
      const height = (duration / 60) * hourHeight

      blocks.push({
        item,
        top,
        height: Math.max(height, isExpanded ? 36 : 18),
        left: 0,
        width: 100
      })
    })

    // Recalculate widths for overlapping blocks
    const totalColumns = Math.max(columns.length, 1)
    if (totalColumns > 1) {
      blocks.forEach((block, index) => {
        const overlapping = blocks.filter((b, i) =>
          i !== index && Math.abs(b.top - block.top) < (isExpanded ? 36 : 18)
        )
        if (overlapping.length > 0) {
          block.width = 100 / (overlapping.length + 1)
          const colIndex = blocks.slice(0, index + 1).filter(b =>
            Math.abs(b.top - block.top) < (isExpanded ? 36 : 18)
          ).length - 1
          block.left = colIndex * block.width
        }
      })
    }

    return blocks
  }

  const totalHeight = (END_HOUR - START_HOUR) * hourHeight
  const stepBlocks = getStepBlocks()

  // Hour labels - show fewer in collapsed mode
  const hourLabels = isExpanded
    ? Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
    : [6, 9, 12, 15, 18, 21]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {format(selectedDate, 'EEEE')}
            </h2>
            <p className="text-sm text-white/50">
              {format(selectedDate, 'MMMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: isExpanded ? '70vh' : '50vh' }}
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

              {/* Step Blocks */}
              {stepBlocks.map(({ item, top, height, left, width }) => (
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
                  <div className="h-full w-full px-3 py-2 flex flex-col justify-center">
                    <span className={`font-medium text-white truncate text-left ${isExpanded ? 'text-sm' : 'text-xs'} ${
                      item.step.completed ? 'line-through' : ''
                    }`}>
                      {item.step.text}
                    </span>
                    {isExpanded && (
                      <span className="text-[10px] text-white/70 mt-0.5 truncate">
                        {item.task.title} - {format(new Date().setHours(item.hour, item.minute), 'h:mm a')}
                      </span>
                    )}
                  </div>
                </button>
              ))}

              {/* Empty state */}
              {scheduledSteps.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-white/40">No scheduled steps</p>
                    <p className="text-xs text-white/25 mt-1">Add time to your steps to see them here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-white/40">
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-2 rounded-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}
              />
              <span>Step</span>
            </div>
            {showNowIndicator && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span>Now</span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-white/30">
            {scheduledSteps.length} step{scheduledSteps.length !== 1 ? 's' : ''} scheduled
          </span>
        </div>
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
          onSelectTask={() => {
            onSelectTask(selectedStep.task.id)
            setSelectedStep(null)
            onClose()
          }}
        />
      )}
    </div>
  )
}
