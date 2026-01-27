'use client'

import { useState, useRef } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, subDays, isToday } from 'date-fns'
import { Task, Step } from '@/stores/taskStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StepItem } from './StepItem'

interface StepsColumnProps {
  task: Task | null
  selectedDate: Date
  onDateChange: (date: Date) => void
  onAddStep: (text: string) => void
  onUpdateStep: (stepId: string, updates: Partial<Step>) => void
  onDeleteStep: (stepId: string) => void
  onToggleStep: (stepId: string) => void
  onReorderSteps: (stepIds: string[]) => void
}

export function StepsColumn({
  task,
  selectedDate,
  onDateChange,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onToggleStep,
  onReorderSteps,
}: StepsColumnProps) {
  const [newStepText, setNewStepText] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

  // Date-related computed values
  const dateFormatted = format(selectedDate, 'EEEE, MMMM d')
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')
  const isTodaySelected = isToday(selectedDate)

  // Filter steps for the selected date
  const filteredSteps = task?.steps.filter(step =>
    step.scheduledDate === selectedDateStr
  ) || []

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (newStepText.trim()) {
      onAddStep(newStepText.trim())
      setNewStepText('')
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    dragOverIndex.current = index
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex.current !== null && task) {
      // Reorder within the filtered steps only
      const sortedFiltered = [...filteredSteps].sort((a, b) => a.order - b.order)
      const [draggedItem] = sortedFiltered.splice(draggedIndex, 1)
      sortedFiltered.splice(dragOverIndex.current, 0, draggedItem)

      // Get all other steps not in the filtered set
      const otherSteps = task.steps.filter(s => s.scheduledDate !== selectedDateStr)

      // Combine: other steps first (maintain their order), then reordered filtered steps
      const allStepIds = [...otherSteps.sort((a, b) => a.order - b.order).map(s => s.id), ...sortedFiltered.map(s => s.id)]
      onReorderSteps(allStepIds)
    }
    setDraggedIndex(null)
    dragOverIndex.current = null
  }

  const handlePrevDay = () => onDateChange(subDays(selectedDate, 1))
  const handleNextDay = () => onDateChange(addDays(selectedDate, 1))
  const handleToday = () => onDateChange(new Date())

  if (!task) {
    return (
      <div className="h-full flex items-center justify-center text-muted">
        <div className="text-center">
          <p className="mb-2">Select a task to view steps</p>
          <p className="text-sm">or create a new task from the left panel</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Date Navigation */}
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={handlePrevDay}
          className="p-1.5 rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-xl font-semibold text-foreground">
            {dateFormatted}
          </h2>
          {isTodaySelected && (
            <span className="text-xs text-blue-600 font-medium">Today</span>
          )}
        </div>
        <button
          onClick={handleNextDay}
          className="p-1.5 rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
        >
          <ChevronRight size={20} />
        </button>
        {!isTodaySelected && (
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
          >
            Today
          </button>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {filteredSteps.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <p className="text-sm">No steps scheduled for this day</p>
            <p className="text-xs mt-1">Add a step below to get started</p>
          </div>
        ) : (
          filteredSteps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => (
              <StepItem
                key={step.id}
                step={step}
                onToggle={() => onToggleStep(step.id)}
                onUpdate={(updates) => onUpdateStep(step.id, updates)}
                onDelete={() => onDeleteStep(step.id)}
                onDragStart={() => handleDragStart(index)}
                onDragEnter={() => handleDragEnter(index)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === index}
              />
            ))
        )}
      </div>

      {/* Add Step Form */}
      <form onSubmit={handleAddStep} className="flex gap-2">
        <Input
          value={newStepText}
          onChange={(e) => setNewStepText(e.target.value)}
          placeholder="Add a step..."
          className="flex-1"
        />
        <Button type="submit" disabled={!newStepText.trim()}>
          <Plus size={18} />
        </Button>
      </form>
    </div>
  )
}
