'use client'

import { useTaskStore } from '@/stores/taskStore'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { StepsColumn } from '@/components/tasks/StepsColumn'
import { CompactTimerBar } from '@/components/timer/CompactTimerBar'

export default function HomePage() {
  const {
    tasks,
    selectedTaskId,
    showCompleted,
    selectTask,
    addTask,
    deleteTask,
    updateTaskTitle,
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

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex flex-col">
      {/* Compact Timer Bar */}
      <CompactTimerBar />

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
        {/* Tasks Column */}
        <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
          <TaskColumn
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            showCompleted={showCompleted}
            onSelectTask={selectTask}
            onAddTask={addTask}
            onDeleteTask={deleteTask}
            onToggleCompleted={toggleTaskCompleted}
            onSetShowCompleted={setShowCompleted}
            onUpdateEstimate={updateTaskEstimate}
            onClearCompleted={clearCompletedTasks}
          />
        </div>

        {/* Steps Column */}
        <div className="bg-surface border border-border rounded-xl p-4 overflow-hidden">
          <StepsColumn
            task={selectedTask}
            onAddStep={(text) => selectedTaskId && addStep(selectedTaskId, text)}
            onUpdateStep={(stepId, updates) => selectedTaskId && updateStep(selectedTaskId, stepId, updates)}
            onDeleteStep={(stepId) => selectedTaskId && deleteStep(selectedTaskId, stepId)}
            onToggleStep={(stepId) => selectedTaskId && toggleStep(selectedTaskId, stepId)}
            onReorderSteps={(stepIds) => selectedTaskId && reorderSteps(selectedTaskId, stepIds)}
            onUpdateTitle={(title) => selectedTaskId && updateTaskTitle(selectedTaskId, title)}
          />
        </div>
      </div>
    </div>
  )
}
