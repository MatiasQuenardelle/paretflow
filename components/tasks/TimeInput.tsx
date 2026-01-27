'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

interface TimeInputProps {
  value?: string
  onChange: (time: string | undefined) => void
}

export function TimeInput({ value, onChange }: TimeInputProps) {
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="time"
        value={value || ''}
        onChange={(e) => onChange(e.target.value || undefined)}
        onBlur={() => setIsEditing(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === 'Escape') {
            setIsEditing(false)
          }
        }}
        className="w-20 text-xs px-1.5 py-0.5 bg-surface border border-border rounded text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    )
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors ${
        value
          ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
          : 'text-muted hover:text-foreground hover:bg-border/50'
      }`}
    >
      <Clock size={12} />
      {value || 'Time'}
    </button>
  )
}
