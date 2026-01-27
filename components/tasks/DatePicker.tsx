'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns'

interface DatePickerProps {
  value?: string
  onChange: (date: string | undefined) => void
  onClose: () => void
}

export function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    return value ? new Date(value) : new Date()
  })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get the day of week for the first day (0 = Sunday)
  const startDayOfWeek = monthStart.getDay()

  // Create empty cells for days before the month starts
  const emptyCells = Array(startDayOfWeek).fill(null)

  const selectedDate = value ? new Date(value) : null

  const handleSelectDate = (day: Date) => {
    onChange(format(day, 'yyyy-MM-dd'))
    onClose()
  }

  const handleClear = () => {
    onChange(undefined)
    onClose()
  }

  const handleSelectToday = () => {
    onChange(format(new Date(), 'yyyy-MM-dd'))
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute top-full right-0 mt-1 z-50 bg-surface border border-border rounded-lg shadow-lg p-3 w-64"
    >
      {/* Header with month/year navigation */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-border/50 text-muted hover:text-foreground"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-medium text-sm">
          {format(currentMonth, 'MMMM yyyy')}
        </span>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 rounded hover:bg-border/50 text-muted hover:text-foreground"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
          <div key={day} className="text-center text-xs text-muted font-medium py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="h-7" />
        ))}
        {days.map((day) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const isTodayDate = isToday(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleSelectDate(day)}
              className={`h-7 w-7 text-xs rounded flex items-center justify-center transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : isTodayDate
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                  : isCurrentMonth
                  ? 'hover:bg-border/50 text-foreground'
                  : 'text-muted'
              }`}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>

      {/* Footer with quick actions */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
        <button
          onClick={handleSelectToday}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium"
        >
          Today
        </button>
        {value && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-xs text-muted hover:text-foreground"
          >
            <X size={12} />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
