'use client'

import { Check } from 'lucide-react'
import { Step, Task } from '@/stores/taskStore'

interface TimeBlockProps {
  step: Step
  task: Task
  onToggle: () => void
  compact?: boolean
}

export function TimeBlock({ step, task, onToggle, compact = false }: TimeBlockProps) {
  return (
    <div
      onClick={onToggle}
      className={`rounded-lg border cursor-pointer transition-all ${
        step.completed
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400'
      } ${compact ? 'p-2' : 'p-3'}`}
    >
      <div className="flex items-start gap-2">
        <div
          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center ${
            step.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-blue-400'
          }`}
        >
          {step.completed && <Check size={12} strokeWidth={3} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${step.completed ? 'line-through text-muted' : ''}`}>
            {step.text}
          </p>
          {!compact && (
            <p className="text-xs text-muted mt-1 truncate">
              {task.title}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
