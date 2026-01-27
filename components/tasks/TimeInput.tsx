'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock, X } from 'lucide-react'

interface TimeInputProps {
  value?: string
  onChange: (time: string | undefined) => void
}

// Parse various time formats into 24h format (HH:mm)
function parseTime(input: string): string | null {
  const trimmed = input.trim().toLowerCase()

  // Handle formats like "15hs", "15h", "3hs", "3h"
  const hsMatch = trimmed.match(/^(\d{1,2})h[s]?$/)
  if (hsMatch) {
    const hour = parseInt(hsMatch[1], 10)
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`
    }
  }

  // Handle formats like "3pm", "3am", "3:30pm", "3:30am", "3 pm", "3 am"
  const ampmMatch = trimmed.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10)
    const minute = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0
    const period = ampmMatch[3]

    if (hour >= 1 && hour <= 12 && minute >= 0 && minute <= 59) {
      if (period === 'pm' && hour !== 12) {
        hour += 12
      } else if (period === 'am' && hour === 12) {
        hour = 0
      }
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  }

  // Handle 24h format "15:00", "9:30", "09:30"
  const h24Match = trimmed.match(/^(\d{1,2}):(\d{2})$/)
  if (h24Match) {
    const hour = parseInt(h24Match[1], 10)
    const minute = parseInt(h24Match[2], 10)
    if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
      return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    }
  }

  // Handle just hour "15", "9"
  const hourOnlyMatch = trimmed.match(/^(\d{1,2})$/)
  if (hourOnlyMatch) {
    const hour = parseInt(hourOnlyMatch[1], 10)
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`
    }
  }

  return null
}

// Format 24h time (HH:mm) for display
function formatTimeForDisplay(time: string): string {
  const [hourStr, minuteStr] = time.split(':')
  const hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr, 10)

  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour

  if (minute === 0) {
    return `${displayHour} ${period}`
  }
  return `${displayHour}:${minuteStr} ${period}`
}

export function TimeInput({ value, onChange }: TimeInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleStartEditing = () => {
    setInputValue(value || '')
    setIsEditing(true)
  }

  const handleSave = () => {
    if (inputValue.trim()) {
      const parsed = parseTime(inputValue)
      if (parsed) {
        onChange(parsed)
      }
    }
    setIsEditing(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(undefined)
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSave()
          }
          if (e.key === 'Escape') {
            setIsEditing(false)
          }
        }}
        placeholder="e.g. 3pm, 15hs"
        className="w-24 text-xs px-1.5 py-0.5 bg-surface border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )
  }

  if (value) {
    return (
      <div className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600">
        <button
          onClick={handleStartEditing}
          className="flex items-center gap-1"
        >
          <Clock size={12} />
          {formatTimeForDisplay(value)}
        </button>
        <button
          onClick={handleClear}
          className="hover:text-blue-800 dark:hover:text-blue-400"
        >
          <X size={12} />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleStartEditing}
      className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded text-muted hover:text-foreground hover:bg-border/50 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Clock size={12} />
      Time
    </button>
  )
}
