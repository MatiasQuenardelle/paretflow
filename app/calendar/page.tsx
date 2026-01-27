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
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { tasks, toggleStep } = useTaskStore()

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
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-muted text-sm">View your scheduled steps</p>
      </header>

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

        <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1">
          <button
            onClick={() => setViewMode('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <CalendarDays size={16} />
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <LayoutGrid size={16} />
            Week
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 bg-surface border border-border rounded-xl p-4 overflow-hidden">
        {viewMode === 'day' ? (
          <DayView
            date={selectedDate}
            tasks={tasks}
            onToggleStep={handleToggleStep}
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
          />
        )}
      </div>
    </div>
  )
}
