'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { useTaskStore, useTaskStoreHydrated } from '@/stores/taskStore'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { StepsColumn } from '@/components/tasks/StepsColumn'
import { CompactTimerBar } from '@/components/timer/CompactTimerBar'
import { CalendarPopup } from '@/components/calendar/CalendarPopup'

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)
  const hydrated = useTaskStoreHydrated()
  const {
    tasks,
    selectedTaskId,
    showCompleted,
    selectTask,
    addTask,
    deleteTask,
    addStep,
    updateStep,
    deleteStep,
    toggleStep,
    reorderSteps,
    toggleTaskCompleted,
    setShowCompleted,
    updateTaskEstimate,
    clearCompletedTasks,
  } = useTaskStore()

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  // Filter tasks for the selected date
  const tasksForDate = tasks.filter(t => t.scheduledDate === selectedDateStr)

  // Don't render until Zustand has hydrated from localStorage
  if (!hydrated) {
    return (
      <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex flex-col">
      {/* Compact Timer Bar */}
      <CompactTimerBar />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
        {/* Tasks Column */}
        <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden flex flex-col">
          <TaskColumn
            tasks={tasksForDate}
            selectedTaskId={selectedTaskId}
            showCompleted={showCompleted}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onSelectTask={selectTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onToggleCompleted={toggleTaskCompleted}
            onSetShowCompleted={setShowCompleted}
            onUpdateEstimate={updateTaskEstimate}
            onClearCompleted={clearCompletedTasks}
            onOpenCalendar={() => setShowCalendar(true)}
          />
        </div>

        {/* Steps Column */}
        <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
          <StepsColumn
            task={selectedTask}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onAddStep={(text) => selectedTaskId && addStep(selectedTaskId, text, format(selectedDate, 'yyyy-MM-dd'))}
            onUpdateStep={(stepId, updates) => selectedTaskId && updateStep(selectedTaskId, stepId, updates)}
            onDeleteStep={(stepId) => selectedTaskId && deleteStep(selectedTaskId, stepId)}
            onToggleStep={(stepId) => selectedTaskId && toggleStep(selectedTaskId, stepId)}
            onReorderSteps={(stepIds) => selectedTaskId && reorderSteps(selectedTaskId, stepIds)}
          />
        </div>
      </div>

      {/* Calendar Popup */}
      <CalendarPopup
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        tasks={tasks}
        selectedDate={selectedDate}
        onSelectTask={selectTask}
      />
    </div>
  )
}
