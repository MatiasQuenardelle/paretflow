'use client'

import { useState, useRef } from 'react'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, subDays, isToday } from 'date-fns'
import { Task, Step } from '@/stores/taskStore'
import { StepItem } from './StepItem'
import { useTranslations, useI18n } from '@/lib/i18n'

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
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)
  const t = useTranslations()
  const { locale } = useI18n()

  // Date-related computed values
  const dateFormatted = selectedDate.toLocaleDateString(locale, { weekday: 'long', month: 'long', day: 'numeric' })
  const isTodaySelected = isToday(selectedDate)

  // Show all steps for the selected task
  const filteredSteps = task?.steps || []

  const handleAddStep = () => {
    onAddStep('')
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnter = (index: number) => {
    dragOverIndex.current = index
  }

  const handleDragEnd = () => {
    if (draggedIndex !== null && dragOverIndex.current !== null && task) {
      // Reorder steps
      const sortedSteps = [...filteredSteps].sort((a, b) => a.order - b.order)
      const [draggedItem] = sortedSteps.splice(draggedIndex, 1)
      sortedSteps.splice(dragOverIndex.current, 0, draggedItem)

      const allStepIds = sortedSteps.map(s => s.id)
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
        <div className="text-center px-4">
          <p className="mb-2 text-sm md:text-base">{t.tasks.selectTaskToViewSteps}</p>
          <p className="text-xs md:text-sm">{t.tasks.orCreateNewTask}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Date Navigation */}
      <div className="mb-2 md:mb-4 flex items-center gap-2 md:gap-3">
        <button
          onClick={handlePrevDay}
          className="p-1 md:p-1.5 rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} className="md:w-5 md:h-5" />
        </button>
        <div className="flex-1 text-center">
          <h2 className="text-base md:text-xl font-semibold text-foreground">
            {dateFormatted}
          </h2>
          {isTodaySelected && (
            <span className="text-[10px] md:text-xs text-blue-600 font-medium">{t.tasks.today}</span>
          )}
        </div>
        <button
          onClick={handleNextDay}
          className="p-1 md:p-1.5 rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
        >
          <ChevronRight size={16} className="md:w-5 md:h-5" />
        </button>
        <button
          onClick={handleAddStep}
          className="p-1 md:p-1.5 rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
          title="Add step"
        >
          <Plus size={16} className="md:w-5 md:h-5" />
        </button>
        {!isTodaySelected && (
          <button
            onClick={handleToday}
            className="px-2 md:px-3 py-1 md:py-1.5 text-xs md:text-sm rounded-lg border border-border hover:bg-border/50 text-muted hover:text-foreground transition-colors"
          >
            {t.tasks.today}
          </button>
        )}
      </div>

      {/* Task title indicator */}
      <div className="mb-2 px-1">
        <p className="text-xs text-muted truncate">
          {t.tasks.stepsFor} <span className="text-foreground font-medium">{task.title}</span>
        </p>
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 md:space-y-2 mb-2 md:mb-4">
        {filteredSteps.length === 0 ? (
          <div className="text-center py-6 md:py-8 text-muted">
            <p className="text-sm">{t.tasks.noStepsYet}</p>
            <p className="text-xs mt-1">{t.tasks.clickToAddStep}</p>
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
                onCreateNext={handleAddStep}
              />
            ))
        )}
      </div>

    </div>
  )
}
