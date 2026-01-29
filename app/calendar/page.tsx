'use client'

import { useState } from 'react'
import { format, addDays, addWeeks, subDays, subWeeks } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTaskStore } from '@/stores/taskStore'
import { DayView } from '@/components/calendar/DayView'
import { WeekView } from '@/components/calendar/WeekView'

type ViewMode = 'day' | 'week'

export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [selectedDate, setSelectedDate] = useState(new Date())

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

  const handleToday = () => {
    setSelectedDate(new Date())
  }

  const handleToggleStep = (taskId: string, stepId: string) => {
    toggleStep(taskId, stepId)
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex flex-col">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handlePrev}>
            <ChevronLeft size={18} />
          </Button>
          <Button variant="secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={handleNext}>
            <ChevronRight size={18} />
          </Button>
          <span className="text-lg font-medium ml-2">
            {viewMode === 'day'
              ? format(selectedDate, 'MMMM d, yyyy')
              : format(selectedDate, 'MMMM yyyy')}
          </span>
        </div>

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
      </div>

      {/* Calendar View */}
      <div className="flex-1 bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl p-4 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20">
        {viewMode === 'day' ? (
          <DayView
            date={selectedDate}
            tasks={tasks}
            onToggleStep={handleToggleStep}
            onSelectTask={selectTask}
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
