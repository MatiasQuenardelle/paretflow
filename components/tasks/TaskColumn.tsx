'use client'

import { useState } from 'react'
import { Plus, Trash2, CheckCircle, Circle, Eye, EyeOff, Timer, Minus, Play, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns'
import { Task } from '@/stores/taskStore'
import { useTimerStore } from '@/stores/timerStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DatePicker } from './DatePicker'

interface TaskColumnProps {
  tasks: Task[]
  selectedTaskId: string | null
  showCompleted: boolean
  selectedDate: Date
  onDateChange: (date: Date) => void
  onSelectTask: (id: string | null) => void
  onAddTask: (title: string, scheduledDate: string) => void
  onDeleteTask: (id: string) => void
  onToggleCompleted: (id: string) => void
  onSetShowCompleted: (show: boolean) => void
  onUpdateEstimate: (id: string, estimate: number) => void
  onClearCompleted?: () => void
  onOpenCalendar?: () => void
}

export function TaskColumn({
  tasks,
  selectedTaskId,
  showCompleted,
  selectedDate,
  onDateChange,
  onSelectTask,
  onAddTask,
  onDeleteTask,
  onToggleCompleted,
  onSetShowCompleted,
  onUpdateEstimate,
  onClearCompleted,
  onOpenCalendar,
}: TaskColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { activeTaskId, setActiveTask } = useTimerStore()

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  // Helper to format the date label
  const getDateLabel = () => {
    if (isToday(selectedDate)) return 'Today'
    if (isTomorrow(selectedDate)) return 'Tomorrow'
    if (isYesterday(selectedDate)) return 'Yesterday'
    return format(selectedDate, 'MMM d')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskTitle.trim()) {
      onAddTask(newTaskTitle.trim(), selectedDateStr)
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }

  // Sort tasks: incomplete first, then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  // Filter out completed if not showing
  const visibleTasks = showCompleted
    ? sortedTasks
    : sortedTasks.filter(t => !t.completed)

  const completedCount = tasks.filter(t => t.completed).length
  const incompleteTasks = tasks.filter(t => !t.completed)

  // Calculate totals
  const totalPomodoros = incompleteTasks.reduce((acc, t) => acc + (t.estimatedPomodoros || 1), 0)
  const completedPomodoros = incompleteTasks.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0)

  return (
    <div className="h-full flex flex-col">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-2 md:mb-3 pb-2 md:pb-3 border-b border-white/10 dark:border-white/5">
        <button
          onClick={() => onDateChange(subDays(selectedDate, 1))}
          className="p-1 md:p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <Calendar size={14} className="md:w-4 md:h-4 text-muted" />
            <span className="font-medium text-sm md:text-base">{getDateLabel()}</span>
          </button>
          {showDatePicker && (
            <DatePicker
              value={selectedDateStr}
              onChange={(date) => {
                if (date) onDateChange(new Date(date))
                setShowDatePicker(false)
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
        <button
          onClick={() => onDateChange(addDays(selectedDate, 1))}
          className="p-1 md:p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-foreground transition-all duration-200 active:scale-95"
        >
          <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2 md:mb-4">
        <div>
          <h2 className="text-base md:text-lg font-semibold">Tasks</h2>
          {incompleteTasks.length > 0 && (
            <p className="text-[10px] md:text-xs text-muted">
              {completedPomodoros}/{totalPomodoros} pomodoros
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onOpenCalendar && (() => {
            const scheduledSteps = tasks.flatMap(t =>
              t.steps.filter(s => s.scheduledDate === selectedDateStr && s.scheduledTime && !s.completed)
            ).length
            return (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenCalendar}
                className={`relative transition-colors ${
                  scheduledSteps > 0
                    ? 'text-blue-500 hover:text-blue-600 hover:bg-blue-500/10'
                    : 'text-muted hover:text-foreground hover:bg-border/50'
                }`}
                title={scheduledSteps > 0 ? `${scheduledSteps} step${scheduledSteps !== 1 ? 's' : ''} scheduled` : 'View schedule'}
              >
                <Clock size={18} />
                {scheduledSteps > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {scheduledSteps > 9 ? '9+' : scheduledSteps}
                  </span>
                )}
              </Button>
            )
          })()}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="text-blue-600"
          >
            <Plus size={18} />
          </Button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-2 md:mb-4 flex gap-2">
          <Input
            autoFocus
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What are you working on?"
            onBlur={(e) => {
              // Don't close if clicking the submit button
              const relatedTarget = e.relatedTarget as HTMLButtonElement | null
              if (relatedTarget?.type === 'submit') return
              if (!newTaskTitle.trim()) setIsAdding(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewTaskTitle('')
              }
            }}
            className="flex-1 text-sm md:text-base"
          />
          <Button type="submit" disabled={!newTaskTitle.trim()}>
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          </Button>
        </form>
      )}

      <div className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2">
        {visibleTasks.length === 0 && !isAdding && (
          <div className="text-center py-6 md:py-8 text-muted">
            <Timer className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 opacity-50" />
            <p className="text-sm">No tasks yet</p>
            <button
              onClick={() => setIsAdding(true)}
              className="text-blue-600 text-sm hover:underline mt-2"
            >
              Add your first task
            </button>
          </div>
        )}

        {visibleTasks.map((task) => {
          const isSelected = selectedTaskId === task.id
          const isActive = activeTaskId === task.id
          const pomodorosDone = task.completedPomodoros || 0
          const pomodorosTotal = task.estimatedPomodoros || 1

          return (
            <div
              key={task.id}
              onClick={() => onSelectTask(task.id)}
              onTouchEnd={(e) => {
                // Ensure selection works on mobile touch
                if (e.target === e.currentTarget || !(e.target as HTMLElement).closest('button')) {
                  onSelectTask(task.id)
                }
              }}
              className={`p-2 md:p-3 rounded-xl border cursor-pointer transition-all duration-200 group touch-manipulation ${
                isActive
                  ? 'border-blue-500/50 bg-gradient-to-r from-blue-500/10 to-purple-500/10 ring-1 md:ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10'
                  : isSelected
                  ? 'border-blue-400/50 bg-blue-500/5'
                  : 'border-white/10 dark:border-white/5 hover:border-blue-400/50 hover:bg-white/5'
              } ${task.completed ? 'opacity-60' : ''}`}
            >
              <div className="flex items-start gap-1.5 md:gap-2">
                {/* Completion checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleCompleted(task.id)
                  }}
                  className={`mt-0.5 flex-shrink-0 transition-colors ${
                    task.completed
                      ? 'text-green-500 hover:text-green-600'
                      : 'text-muted hover:text-blue-500'
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle size={16} className="md:w-[18px] md:h-[18px]" />
                  ) : (
                    <Circle size={16} className="md:w-[18px] md:h-[18px]" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <h3 className={`text-sm md:text-base font-medium truncate ${
                      task.completed ? 'line-through text-muted' : ''
                    }`}>
                      {task.title}
                    </h3>
                    {isActive && (
                      <span className="flex-shrink-0 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                  </div>

                  {/* Pomodoro counter */}
                  {!task.completed && (
                    <div className="flex items-center gap-1 mt-1 md:mt-1.5">
                      <div className="flex items-center">
                        {Array.from({ length: pomodorosTotal }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 md:w-4 md:h-4 rounded-full border-[1.5px] md:border-2 mr-0.5 transition-colors ${
                              i < pomodorosDone
                                ? 'bg-red-500 border-red-500'
                                : 'border-red-300 dark:border-red-800'
                            }`}
                          />
                        ))}
                      </div>
                      {/* +/- buttons */}
                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateEstimate(task.id, pomodorosTotal - 1)
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50"
                          disabled={pomodorosTotal <= 1}
                        >
                          <Minus size={10} className="md:w-3 md:h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onUpdateEstimate(task.id, pomodorosTotal + 1)
                          }}
                          className="w-5 h-5 rounded flex items-center justify-center text-muted hover:text-foreground hover:bg-border/50"
                        >
                          <Plus size={10} className="md:w-3 md:h-3" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5 md:gap-1">
                  {!task.completed && !isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveTask(task.id)
                        onSelectTask(task.id)
                      }}
                      className="p-1 text-muted hover:text-blue-500 transition-colors"
                      title="Start focusing on this task"
                    >
                      <Play size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTask(task.id)
                    }}
                    className="p-1 text-muted hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      <div className="pt-2 md:pt-3 border-t border-white/10 dark:border-white/5 mt-2 md:mt-3 space-y-1 md:space-y-2">
        {completedCount > 0 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSetShowCompleted(!showCompleted)}
              className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm text-muted hover:text-foreground transition-colors"
            >
              {showCompleted ? (
                <>
                  <EyeOff size={12} className="md:w-[14px] md:h-[14px]" />
                  Hide completed
                </>
              ) : (
                <>
                  <Eye size={12} className="md:w-[14px] md:h-[14px]" />
                  Show completed ({completedCount})
                </>
              )}
            </button>
            {showCompleted && onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="text-xs md:text-sm text-red-500 hover:text-red-600 transition-colors"
              >
                Clear all
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
