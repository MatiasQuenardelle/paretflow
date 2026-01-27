'use client'

import { useState, useRef } from 'react'
import { Plus } from 'lucide-react'
import { Task, Step } from '@/stores/taskStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { StepItem } from './StepItem'

interface StepsColumnProps {
  task: Task | null
  onAddStep: (text: string) => void
  onUpdateStep: (stepId: string, updates: Partial<Step>) => void
  onDeleteStep: (stepId: string) => void
  onToggleStep: (stepId: string) => void
  onReorderSteps: (stepIds: string[]) => void
  onUpdateTitle: (title: string) => void
}

export function StepsColumn({
  task,
  onAddStep,
  onUpdateStep,
  onDeleteStep,
  onToggleStep,
  onReorderSteps,
  onUpdateTitle,
}: StepsColumnProps) {
  const [newStepText, setNewStepText] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(task?.title || '')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const dragOverIndex = useRef<number | null>(null)

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
      const steps = [...task.steps]
      const [draggedItem] = steps.splice(draggedIndex, 1)
      steps.splice(dragOverIndex.current, 0, draggedItem)
      onReorderSteps(steps.map(s => s.id))
    }
    setDraggedIndex(null)
    dragOverIndex.current = null
  }

  const handleTitleSave = () => {
    if (title.trim() && title !== task?.title) {
      onUpdateTitle(title.trim())
    } else {
      setTitle(task?.title || '')
    }
    setIsEditingTitle(false)
  }

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
      {/* Task Title */}
      <div className="mb-4">
        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleSave()
              if (e.key === 'Escape') {
                setTitle(task.title)
                setIsEditingTitle(false)
              }
            }}
            className="text-xl font-semibold bg-transparent border-b-2 border-blue-500 outline-none w-full"
          />
        ) : (
          <h2
            onClick={() => {
              setTitle(task.title)
              setIsEditingTitle(true)
            }}
            className="text-xl font-semibold cursor-text hover:text-blue-600 transition-colors"
          >
            {task.title}
          </h2>
        )}
      </div>

      {/* Steps List */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {task.steps
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
          ))}
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
