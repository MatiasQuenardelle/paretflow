'use client'

import { useState, useRef, useEffect } from 'react'
import { GripVertical, Trash2, Calendar } from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { Step } from '@/stores/taskStore'
import { Checkbox } from '@/components/ui/Checkbox'
import { TimeInput } from './TimeInput'
import { DatePicker } from './DatePicker'

interface StepItemProps {
  step: Step
  onToggle: () => void
  onUpdate: (updates: Partial<Step>) => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  isDragging: boolean
  onCreateNext?: () => void
}

export function StepItem({
  step,
  onToggle,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnter,
  onDragEnd,
  isDragging,
  onCreateNext,
}: StepItemProps) {
  const [isEditing, setIsEditing] = useState(!step.text)
  const [text, setText] = useState(step.text)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setText(step.text)
  }, [step.text])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      if (step.text) {
        inputRef.current.select()
      }
    }
  }, [isEditing, step.text])

  const handleSave = (createNext = false) => {
    const trimmedText = text.trim()
    if (trimmedText && trimmedText !== step.text) {
      onUpdate({ text: trimmedText })
    } else if (!trimmedText && !step.text) {
      // Empty new step, delete it
      onDelete()
      return
    } else {
      setText(step.text)
    }
    setIsEditing(false)

    // Create next step if requested and current step has content
    if (createNext && trimmedText && onCreateNext) {
      onCreateNext()
    }
  }

  const formatDateDisplay = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl group transition-all duration-200 hover:bg-white/5 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${step.completed ? 'opacity-60' : ''}`}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground">
        <GripVertical size={14} className="md:w-4 md:h-4" />
      </div>

      <Checkbox checked={step.completed} onChange={onToggle} />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => handleSave(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSave(true)
              }
              if (e.key === 'Escape') {
                setText(step.text)
                setIsEditing(false)
              }
            }}
            placeholder="Enter step..."
            className="w-full bg-transparent border-none outline-none text-sm md:text-base text-foreground placeholder:text-muted"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`cursor-text text-sm md:text-base ${step.completed ? 'line-through text-muted' : ''} ${!step.text ? 'text-muted italic' : ''}`}
          >
            {step.text || 'Click to add step...'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        <TimeInput
          value={step.scheduledTime}
          onChange={(time) => onUpdate({ scheduledTime: time })}
        />

        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className={`flex items-center gap-0.5 md:gap-1 px-1 md:px-1.5 py-0.5 rounded-md text-[10px] md:text-xs transition-all duration-200 ${
              step.scheduledDate
                ? 'text-blue-500 bg-blue-500/10 border border-blue-500/20'
                : 'text-muted hover:text-foreground hover:bg-white/10'
            }`}
            title={step.scheduledDate ? `Scheduled for ${step.scheduledDate}` : 'Schedule'}
          >
            <Calendar size={12} className="md:w-[14px] md:h-[14px]" />
            {step.scheduledDate && (
              <span className="hidden sm:inline">{formatDateDisplay(step.scheduledDate)}</span>
            )}
          </button>
          {showDatePicker && (
            <DatePicker
              value={step.scheduledDate}
              onChange={(date) => onUpdate({ scheduledDate: date })}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>

        <button
          onClick={onDelete}
          className="p-0.5 md:p-1 text-muted hover:text-red-500 transition-colors"
        >
          <Trash2 size={12} className="md:w-[14px] md:h-[14px]" />
        </button>
      </div>
    </div>
  )
}
