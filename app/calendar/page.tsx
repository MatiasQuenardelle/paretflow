'use client'

import { useState } from 'react'
import { format, addDays, addWeeks, subDays, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTaskStore } from '@/stores/taskStore'
import { DayView } from '@/components/calendar/DayView'
import { WeekView } from '@/components/calendar/WeekView'

type ViewMode = 'day' | 'week'

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isExpanded, setIsExpanded] = useState(true)
  const [scheduledItemsCount, setScheduledItemsCount] = useState(0)

  const { tasks, toggleStep, selectTask, mode, isLoading } = useTaskStore()

  // Show loading state
  if (mode === 'loading' || isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  const handlePrev = () => {
    if (viewMode === 'day') {
      setSelectedDate(subDays(selectedDate, 1))
    } else {
      setSelectedDate(subWeeks(selectedDate, 1))
    }
  }

  const handleNext = () => {
    if (viewMode === 'day') {
      setSelectedDate(addDays(selectedDate, 1))
    } else {
      setSelectedDate(addWeeks(selectedDate, 1))
    }
  }

  const handleToggleStep = (taskId: string, stepId: string) => {
    toggleStep(taskId, stepId)
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrev}>
            <ChevronLeft size={18} />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[140px] text-center">
            {format(selectedDate, 'MMMM d, yyyy')}
          </span>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <ChevronRight size={18} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Day/Week toggle */}
          <div className="flex items-center gap-1 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                viewMode === 'day'
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-muted hover:text-foreground hover:bg-white/10'
              }`}
            >
              <CalendarDays size={16} />
              Day
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all duration-200 ${
                viewMode === 'week'
                  ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-muted hover:text-foreground hover:bg-white/10'
              }`}
            >
              <LayoutGrid size={16} />
              Week
            </button>
          </div>

          {/* Scheduled items count */}
          <span className="text-xs text-muted hidden sm:block">
            {scheduledItemsCount} {scheduledItemsCount === 1 ? 'item' : 'items'}
          </span>

          {/* Compact/Expand toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-all duration-200 px-2 py-1.5 rounded-lg hover:bg-white/10 active:scale-95 border border-white/10 dark:border-white/5"
          >
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span className="hidden sm:inline">{isExpanded ? 'Compact' : 'Expand'}</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl p-4 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20">
        {viewMode === 'day' ? (
          <DayView
            date={selectedDate}
            tasks={tasks}
            onToggleStep={handleToggleStep}
            onSelectTask={selectTask}
            isExpanded={isExpanded}
            onToggleExpanded={() => setIsExpanded(!isExpanded)}
            onScheduledItemsChange={setScheduledItemsCount}
          />
        ) : (
          <WeekView
            date={selectedDate}
            tasks={tasks}
            onToggleStep={handleToggleStep}
            onSelectDay={(day) => {
              setSelectedDate(day)
              setViewMode('day')
            }}
            onSelectTask={selectTask}
          />
        )}
      </div>
    </div>
  )
}
