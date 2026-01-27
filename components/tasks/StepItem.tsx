'use client'

import { useState, useRef, useEffect } from 'react'
import { GripVertical, Trash2, Calendar } from 'lucide-react'
import { Step } from '@/stores/taskStore'
import { Checkbox } from '@/components/ui/Checkbox'
import { TimeInput } from './TimeInput'

interface StepItemProps {
  step: Step
  onToggle: () => void
  onUpdate: (updates: Partial<Step>) => void
  onDelete: () => void
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  isDragging: boolean
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
}: StepItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(step.text)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    if (text.trim() && text !== step.text) {
      onUpdate({ text: text.trim() })
    } else {
      setText(step.text)
    }
    setIsEditing(false)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      className={`flex items-center gap-3 p-3 bg-surface border border-border rounded-lg group transition-all ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${step.completed ? 'opacity-60' : ''}`}
    >
      <div className="cursor-grab active:cursor-grabbing text-muted hover:text-foreground">
        <GripVertical size={16} />
      </div>

      <Checkbox checked={step.completed} onChange={onToggle} />

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') {
                setText(step.text)
                setIsEditing(false)
              }
            }}
            className="w-full bg-transparent border-none outline-none text-foreground"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`cursor-text ${step.completed ? 'line-through text-muted' : ''}`}
          >
            {step.text}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <TimeInput
          value={step.scheduledTime}
          onChange={(time) => onUpdate({ scheduledTime: time })}
        />

        <button
          onClick={() => onUpdate({
            scheduledDate: step.scheduledDate === today ? undefined : today
          })}
          className={`p-1 rounded transition-colors ${
            step.scheduledDate
              ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30'
              : 'text-muted hover:text-foreground opacity-0 group-hover:opacity-100'
          }`}
          title={step.scheduledDate ? 'Scheduled' : 'Schedule for today'}
        >
          <Calendar size={14} />
        </button>

        <button
          onClick={onDelete}
          className="p-1 text-muted hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
