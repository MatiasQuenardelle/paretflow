'use client'

import { useState, useRef } from 'react'
import { Plus, Trash2, Eye, EyeOff, Timer, Minus, Play, Calendar, ChevronLeft, ChevronRight, Clock, GripVertical, Tag, X, Filter } from 'lucide-react'
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from 'date-fns'
import { Task, TASK_LABELS } from '@/stores/taskStore'
import { useTimerStore } from '@/stores/timerStore'
import { DatePicker } from './DatePicker'

const LABEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  rose: { bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
}

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
  onReorderTasks?: (taskIds: string[]) => void
  onUpdateLabels?: (taskId: string, labels: string[]) => void
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
  onReorderTasks,
  onUpdateLabels,
}: TaskColumnProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [labelFilterId, setLabelFilterId] = useState<string | null>(null)
  const [showLabelFilter, setShowLabelFilter] = useState(false)
  const [editingLabelsTaskId, setEditingLabelsTaskId] = useState<string | null>(null)

  // Drag and drop state (desktop)
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null)
  const [dragOverTaskIdState, setDragOverTaskIdState] = useState<string | null>(null)
  const dragOverTaskId = useRef<string | null>(null)

  // Touch drag state (mobile)
  const [touchDragTaskId, setTouchDragTaskId] = useState<string | null>(null)
  const touchStartY = useRef<number>(0)
  const taskListRef = useRef<HTMLDivElement>(null)

  const { activeTaskId, setActiveTask } = useTimerStore()

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', taskId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (taskId: string) => {
    if (taskId !== draggedTaskId) {
      dragOverTaskId.current = taskId
      setDragOverTaskIdState(taskId)
    }
  }

  const handleDragEnd = () => {
    if (draggedTaskId && dragOverTaskId.current && onReorderTasks) {
      const incompleteTasks = tasks.filter(t => !t.completed)
      const draggedIndex = incompleteTasks.findIndex(t => t.id === draggedTaskId)
      const dropIndex = incompleteTasks.findIndex(t => t.id === dragOverTaskId.current)

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const newOrder = [...incompleteTasks]
        const [draggedTask] = newOrder.splice(draggedIndex, 1)
        newOrder.splice(dropIndex, 0, draggedTask)

        // Include completed tasks at the end
        const completedTasks = tasks.filter(t => t.completed)
        const allTaskIds = [...newOrder, ...completedTasks].map(t => t.id)
        onReorderTasks(allTaskIds)
      }
    }

    setDraggedTaskId(null)
    dragOverTaskId.current = null
    setDragOverTaskIdState(null)
  }

  // Touch handlers for mobile reordering
  const handleTouchStart = (e: React.TouchEvent, taskId: string) => {
    touchStartY.current = e.touches[0].clientY
    // Use a timeout to distinguish between tap and drag
    const timeout = setTimeout(() => {
      setTouchDragTaskId(taskId)
      // Vibrate on supported devices
      if (navigator.vibrate) navigator.vibrate(50)
    }, 200)

    const handleTouchEnd = () => {
      clearTimeout(timeout)
      document.removeEventListener('touchend', handleTouchEnd)
    }
    document.addEventListener('touchend', handleTouchEnd)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDragTaskId || !taskListRef.current || !onReorderTasks) return

    const touch = e.touches[0]
    const elements = taskListRef.current.querySelectorAll('[data-task-id]')

    Array.from(elements).forEach(el => {
      const rect = el.getBoundingClientRect()
      if (touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
        const taskId = el.getAttribute('data-task-id')
        if (taskId && taskId !== touchDragTaskId) {
          setDragOverTaskIdState(taskId)
          dragOverTaskId.current = taskId
        }
      }
    })
  }

  const handleTouchEnd = () => {
    if (touchDragTaskId && dragOverTaskId.current && onReorderTasks) {
      const incompleteTasks = tasks.filter(t => !t.completed)
      const draggedIndex = incompleteTasks.findIndex(t => t.id === touchDragTaskId)
      const dropIndex = incompleteTasks.findIndex(t => t.id === dragOverTaskId.current)

      if (draggedIndex !== -1 && dropIndex !== -1 && draggedIndex !== dropIndex) {
        const newOrder = [...incompleteTasks]
        const [draggedTask] = newOrder.splice(draggedIndex, 1)
        newOrder.splice(dropIndex, 0, draggedTask)

        const completedTasks = tasks.filter(t => t.completed)
        const allTaskIds = [...newOrder, ...completedTasks].map(t => t.id)
        onReorderTasks(allTaskIds)
      }
    }

    setTouchDragTaskId(null)
    dragOverTaskId.current = null
    setDragOverTaskIdState(null)
  }

  const toggleTaskLabel = (taskId: string, labelId: string) => {
    if (!onUpdateLabels) return
    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const currentLabels = task.labels || []
    const newLabels = currentLabels.includes(labelId)
      ? currentLabels.filter(l => l !== labelId)
      : [...currentLabels, labelId]

    onUpdateLabels(taskId, newLabels)
  }

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

  // Sort tasks: incomplete first (in order), then completed
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      // Within same completion status, sort by order if available
      const orderA = a.order ?? Infinity
      const orderB = b.order ?? Infinity
      return orderA - orderB
    }
    return a.completed ? 1 : -1
  })

  // Filter out completed if not showing
  let visibleTasks = showCompleted
    ? sortedTasks
    : sortedTasks.filter(t => !t.completed)

  // Apply label filter if set
  if (labelFilterId) {
    visibleTasks = visibleTasks.filter(t => t.labels?.includes(labelFilterId))
  }

  const completedCount = tasks.filter(t => t.completed).length
  const incompleteTasks = tasks.filter(t => !t.completed)

  // Calculate totals
  const totalPomodoros = incompleteTasks.reduce((acc, t) => acc + (t.estimatedPomodoros || 1), 0)
  const completedPomodoros = incompleteTasks.reduce((acc, t) => acc + (t.completedPomodoros || 0), 0)

  return (
    <div className="h-full flex flex-col">
      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-3 md:mb-4 pb-3 md:pb-4 border-b border-white/[0.06]">
        <button
          onClick={() => onDateChange(subDays(selectedDate, 1))}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] text-muted hover:text-foreground transition-all duration-300 active:scale-95"
        >
          <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/[0.08] hover:border-white/15 transition-all duration-300"
          >
            <Calendar size={14} className="md:w-4 md:h-4 text-blue-400" />
            <span className="font-semibold text-sm md:text-base bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{getDateLabel()}</span>
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
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/[0.06] text-muted hover:text-foreground transition-all duration-300 active:scale-95"
        >
          <ChevronRight size={16} className="md:w-[18px] md:h-[18px]" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-3 md:mb-4">
        <div>
          <h2 className="text-lg md:text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Tasks</h2>
          {incompleteTasks.length > 0 && (
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-400 to-rose-500" />
                <span className="text-[10px] md:text-xs text-muted font-medium">
                  {completedPomodoros}/{totalPomodoros}
                </span>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Label filter */}
          <div className="relative">
            <button
              onClick={() => setShowLabelFilter(!showLabelFilter)}
              className={`p-2 rounded-xl border transition-all duration-300 ${
                labelFilterId
                  ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20'
                  : 'bg-white/5 border-white/[0.06] text-muted hover:text-foreground hover:bg-white/10'
              }`}
              title="Filter by label"
            >
              <Filter size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            {showLabelFilter && (
              <div className="absolute right-0 top-full mt-2 z-50 w-48 p-2 rounded-xl bg-surface/95 backdrop-blur-xl md:bg-surface md:backdrop-blur-sm border border-white/15 shadow-2xl shadow-black/50 ring-1 ring-white/5">
                <div className="text-xs text-muted font-medium mb-2 px-2">Filter by label</div>
                <button
                  onClick={() => {
                    setLabelFilterId(null)
                    setShowLabelFilter(false)
                  }}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                    !labelFilterId ? 'bg-white/15 text-foreground' : 'text-foreground/90 hover:bg-white/10'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full border border-white/30" />
                  All tasks
                </button>
                {TASK_LABELS.map(label => {
                  const colors = LABEL_COLORS[label.color]
                  return (
                    <button
                      key={label.id}
                      onClick={() => {
                        setLabelFilterId(label.id)
                        setShowLabelFilter(false)
                      }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm transition-colors ${
                        labelFilterId === label.id ? 'bg-white/15 text-foreground' : 'text-foreground/90 hover:bg-white/10'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${colors.bg} ${colors.border} border`} />
                      {label.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
          {onOpenCalendar && (() => {
            const scheduledSteps = tasks.flatMap(t =>
              t.steps.filter(s => s.scheduledDate === selectedDateStr && s.scheduledTime && !s.completed)
            ).length
            return (
              <button
                onClick={onOpenCalendar}
                className={`relative p-2 rounded-xl border transition-all duration-300 ${
                  scheduledSteps > 0
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20'
                    : 'bg-white/5 border-white/[0.06] text-muted hover:text-foreground hover:bg-white/10'
                }`}
                title={scheduledSteps > 0 ? `${scheduledSteps} step${scheduledSteps !== 1 ? 's' : ''} scheduled` : 'View schedule'}
              >
                <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                {scheduledSteps > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/30">
                    {scheduledSteps > 9 ? '9+' : scheduledSteps}
                  </span>
                )}
              </button>
            )
          })()}
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-3 md:mb-4 flex gap-2">
          <div className="flex-1 relative">
            <input
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
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-blue-500/50 focus:bg-white/[0.07] text-sm md:text-base text-foreground placeholder:text-muted/60 outline-none transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </form>
      )}

      <div
        ref={taskListRef}
        className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2"
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {visibleTasks.length === 0 && !isAdding && (
          <div className="text-center py-8 md:py-12">
            <div className="relative inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 mb-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
              <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center">
                <Timer className="w-6 h-6 md:w-8 md:h-8 text-muted" />
              </div>
            </div>
            <p className="text-sm text-muted mb-3">No tasks for this day</p>
            <button
              onClick={() => setIsAdding(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300"
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
          const stepsCount = task.steps?.length || 0
          const completedSteps = task.steps?.filter(s => s.completed).length || 0
          const taskLabels = task.labels || []
          const isDragging = draggedTaskId === task.id || touchDragTaskId === task.id

          return (
            <div
              key={task.id}
              data-task-id={task.id}
              draggable={!task.completed && !!onReorderTasks}
              onDragStart={(e) => handleDragStart(e, task.id)}
              onDragOver={handleDragOver}
              onDragEnter={() => handleDragEnter(task.id)}
              onDragEnd={handleDragEnd}
              onClick={() => {
                if (!touchDragTaskId) onSelectTask(task.id)
              }}
              className={`relative p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-300 group touch-manipulation overflow-hidden ${
                isDragging ? 'opacity-50 scale-95 ring-2 ring-blue-500/50' : ''
              } ${
                dragOverTaskIdState === task.id && draggedTaskId && draggedTaskId !== task.id ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
              } ${
                isActive
                  ? 'bg-gradient-to-br from-blue-500/20 via-purple-500/15 to-indigo-500/20 shadow-glow-blue'
                  : isSelected
                  ? 'bg-gradient-to-br from-white/10 to-white/5 dark:from-white/10 dark:to-white/5'
                  : 'bg-white/5 dark:bg-white/[0.03] hover:bg-white/10 dark:hover:bg-white/[0.06]'
              } ${task.completed ? 'opacity-50' : ''}`}
              style={{
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}
            >
              {/* Gradient border effect */}
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 ${
                isActive
                  ? 'opacity-100'
                  : isSelected
                  ? 'opacity-70'
                  : 'opacity-0 group-hover:opacity-50'
              }`} style={{
                padding: '1px',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(59,130,246,0.6), rgba(147,51,234,0.4), rgba(59,130,246,0.6))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                borderRadius: '1rem',
              }} />

              {/* Active glow effect */}
              {isActive && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl animate-glow-pulse -z-10" />
              )}

              <div className="relative flex items-start gap-2">
                {/* Drag handle - always visible, touch-drag on mobile */}
                {!task.completed && onReorderTasks && (
                  <div
                    className={`mt-1 cursor-grab active:cursor-grabbing transition-all flex-shrink-0 p-1 -m-0.5 rounded ${
                      touchDragTaskId === task.id
                        ? 'text-blue-400 bg-blue-500/20 scale-110'
                        : 'text-muted/60 md:text-muted/50 md:hover:text-foreground/70 md:hover:scale-110 md:hover:bg-white/10'
                    }`}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => {
                      e.stopPropagation()
                      handleTouchStart(e, task.id)
                    }}
                    title="Hold to drag"
                  >
                    <GripVertical size={18} className="md:w-5 md:h-5" />
                  </div>
                )}

                {/* Premium checkbox */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleCompleted(task.id)
                  }}
                  className={`mt-0.5 flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    task.completed
                      ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-transparent shadow-lg shadow-green-500/30'
                      : 'border-white/30 dark:border-white/20 hover:border-blue-400 hover:bg-blue-500/10 group-hover:border-white/40'
                  }`}
                >
                  {task.completed && (
                    <svg className="w-3 h-3 md:w-3.5 md:h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" className="animate-checkmark" />
                    </svg>
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  {/* Title row */}
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm md:text-base font-semibold tracking-tight truncate ${
                      task.completed ? 'line-through text-muted' : 'text-foreground'
                    }`}>
                      {task.title}
                    </h3>
                    {isActive && (
                      <span className="flex-shrink-0 relative">
                        <span className="absolute inset-0 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-blue-400 animate-ping opacity-75" />
                        <span className="relative w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 block" />
                      </span>
                    )}
                  </div>

                  {/* Labels row */}
                  {(taskLabels.length > 0 || editingLabelsTaskId === task.id) && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5">
                      {taskLabels.map(labelId => {
                        const label = TASK_LABELS.find(l => l.id === labelId)
                        if (!label) return null
                        const colors = LABEL_COLORS[label.color]
                        return (
                          <span
                            key={labelId}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                          >
                            {label.name}
                            {editingLabelsTaskId === task.id && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleTaskLabel(task.id, labelId)
                                }}
                                className="hover:text-white"
                              >
                                <X size={10} />
                              </button>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Label picker (when editing) */}
                  {editingLabelsTaskId === task.id && (
                    <div className="flex flex-wrap items-center gap-1 mt-1.5 p-2 rounded-lg bg-white/5 border border-white/10">
                      {TASK_LABELS.filter(l => !taskLabels.includes(l.id)).map(label => {
                        const colors = LABEL_COLORS[label.color]
                        return (
                          <button
                            key={label.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleTaskLabel(task.id, label.id)
                            }}
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium ${colors.bg} ${colors.text} ${colors.border} border opacity-60 hover:opacity-100 transition-opacity`}
                          >
                            <Plus size={10} />
                            {label.name}
                          </button>
                        )
                      })}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingLabelsTaskId(null)
                        }}
                        className="ml-auto text-[9px] text-muted hover:text-foreground"
                      >
                        Done
                      </button>
                    </div>
                  )}

                  {/* Stats row */}
                  {!task.completed && (
                    <div className="flex items-center gap-3 mt-2">
                      {/* Pomodoro pills */}
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 dark:bg-white/[0.03] border border-white/10">
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: Math.min(pomodorosTotal, 5) }).map((_, i) => (
                            <div
                              key={i}
                              className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                                i < pomodorosDone
                                  ? 'bg-gradient-to-br from-red-400 to-rose-500 shadow-sm shadow-red-500/50'
                                  : 'bg-white/20 dark:bg-white/10'
                              }`}
                            />
                          ))}
                          {pomodorosTotal > 5 && (
                            <span className="text-[10px] text-muted ml-0.5">+{pomodorosTotal - 5}</span>
                          )}
                        </div>
                        {/* Inline +/- */}
                        <div className="flex items-center border-l border-white/10 pl-1.5 ml-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateEstimate(task.id, pomodorosTotal - 1)
                            }}
                            className="w-4 h-4 rounded flex items-center justify-center text-muted hover:text-foreground transition-colors"
                            disabled={pomodorosTotal <= 1}
                          >
                            <Minus size={10} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onUpdateEstimate(task.id, pomodorosTotal + 1)
                            }}
                            className="w-4 h-4 rounded flex items-center justify-center text-muted hover:text-foreground transition-colors"
                          >
                            <Plus size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Steps indicator */}
                      {stepsCount > 0 && (
                        <div className="flex items-center gap-1 text-[10px] md:text-xs text-muted">
                          <div className="w-3 h-3 rounded-full border border-white/20 flex items-center justify-center">
                            <span className="text-[8px]">{completedSteps}</span>
                          </div>
                          <span>/</span>
                          <span>{stepsCount}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 transition-opacity duration-200">
                  {/* Label button - always visible for incomplete tasks */}
                  {onUpdateLabels && !task.completed && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingLabelsTaskId(editingLabelsTaskId === task.id ? null : task.id)
                      }}
                      className={`p-1.5 rounded-lg transition-all duration-200 ${
                        editingLabelsTaskId === task.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : taskLabels.length > 0
                          ? 'bg-purple-500/10 text-purple-400/70 hover:bg-purple-500/20 hover:text-purple-400'
                          : 'text-muted/40 hover:bg-purple-500/10 hover:text-purple-400'
                      }`}
                      title="Add labels"
                    >
                      <Tag size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                  )}
                  {/* Play/Delete - always visible on mobile, hover on desktop */}
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    {!task.completed && !isActive && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveTask(task.id)
                          onSelectTask(task.id)
                        }}
                        className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 transition-all duration-200"
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
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted hover:text-red-400 transition-all duration-200"
                    >
                      <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer actions */}
      {completedCount > 0 && (
        <div className="pt-3 md:pt-4 border-t border-white/[0.06] mt-3 md:mt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => onSetShowCompleted(!showCompleted)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs md:text-sm text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200"
            >
              {showCompleted ? (
                <>
                  <EyeOff size={14} />
                  <span>Hide completed</span>
                </>
              ) : (
                <>
                  <Eye size={14} />
                  <span>Show completed</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-medium">{completedCount}</span>
                </>
              )}
            </button>
            {showCompleted && onClearCompleted && (
              <button
                onClick={onClearCompleted}
                className="px-3 py-1.5 rounded-lg text-xs md:text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
              >
                Clear all
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
