'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { GripVertical, Trash2, Calendar } from 'lucide-react'
import { format, isToday, isTomorrow, parseISO } from 'date-fns'
import { Step } from '@/stores/taskStore'
import { Checkbox } from '@/components/ui/Checkbox'
import { TimeInput } from './TimeInput'
import { DatePicker } from './DatePicker'
import { useTranslations } from '@/lib/i18n'

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
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const t = useTranslations()

  useEffect(() => {
    setText(step.text)
  }, [step.text])

  useEffect(() => {
    if (isEditing && inputRef.current) {
      // Small delay to ensure the input is ready, especially on mobile
      setTimeout(() => {
        inputRef.current?.focus()
        if (step.text) {
          inputRef.current?.select()
        }
      }, 50)
    }
  }, [isEditing, step.text])

  // Auto-resize textarea as content changes
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
    }
  }, [text, isEditing])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleSave = useCallback((createNext = false) => {
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
  }, [text, step.text, onUpdate, onDelete, onCreateNext])

  const handleBlur = useCallback(() => {
    // Delay the blur handler to allow click events to fire first on mobile
    // This prevents the input from closing when tapping other elements
    blurTimeoutRef.current = setTimeout(() => {
      handleSave(false)
    }, 150)
  }, [handleSave])

  const handleFocus = useCallback(() => {
    // Cancel any pending blur when refocusing
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
  }, [])

  const formatDateDisplay = (dateStr: string) => {
    const date = parseISO(dateStr)
    if (isToday(date)) return 'Today'
    if (isTomorrow(date)) return 'Tomorrow'
    return format(date, 'MMM d')
  }

  return (
    <div
      draggable={!isEditing}
      onDragStart={isEditing ? undefined : onDragStart}
      onDragEnter={isEditing ? undefined : onDragEnter}
      onDragEnd={isEditing ? undefined : onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-start gap-2 md:gap-3 p-2 md:p-3 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-xl group transition-all duration-200 hover:bg-white/5 ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${step.completed ? 'opacity-60' : ''}`}
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground mt-0.5 touch-none"
        onTouchStart={(e) => e.stopPropagation()}
      >
        <GripVertical size={14} className="md:w-4 md:h-4" />
      </div>

      <div className="mt-0.5">
        <Checkbox checked={step.completed} onChange={onToggle} />
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <textarea
            ref={inputRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleBlur}
            onFocus={handleFocus}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                // Clear any pending blur timeout before saving
                if (blurTimeoutRef.current) {
                  clearTimeout(blurTimeoutRef.current)
                  blurTimeoutRef.current = null
                }
                handleSave(true)
              }
              if (e.key === 'Escape') {
                // Clear any pending blur timeout
                if (blurTimeoutRef.current) {
                  clearTimeout(blurTimeoutRef.current)
                  blurTimeoutRef.current = null
                }
                setText(step.text)
                setIsEditing(false)
              }
            }}
            placeholder={t.tasks.enterStep}
            className="w-full bg-transparent border-none outline-none text-sm md:text-base text-foreground placeholder:text-muted resize-none overflow-hidden"
            style={{ fontSize: '16px' }} // Prevent iOS zoom on focus
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            onTouchEnd={(e) => {
              e.preventDefault()
              setIsEditing(true)
            }}
            className={`cursor-text text-sm md:text-base whitespace-pre-wrap ${step.completed ? 'line-through text-muted' : ''} ${!step.text ? 'text-muted italic' : ''}`}
          >
            {step.text || t.tasks.clickToAddStepText}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2 mt-0.5">
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
