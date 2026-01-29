'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { StepsColumn } from '@/components/tasks/StepsColumn'
import { CompactTimerBar } from '@/components/timer/CompactTimerBar'
import { CalendarPopup } from '@/components/calendar/CalendarPopup'
import { createClient } from '@/lib/supabase/client'

// Debug component to show sync status - tap 5 times on "Tasks" header to show
function SyncDebug({ taskCount }: { taskCount: number }) {
  const [show, setShow] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const { mode, isSaving, error } = useTaskStore()

  useEffect(() => {
    if (tapCount >= 5) {
      setShow(true)
      setTapCount(0)
      // Fetch debug info
      const fetchDebug = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const { data, error: fetchError } = user ? await supabase
          .from('tasks')
          .select('data')
          .eq('user_id', user.id)
          .single() : { data: null, error: null }

        setDebugInfo({
          mode,
          userId: user?.id?.slice(0, 8) || 'none',
          email: user?.email || 'none',
          cloudTasks: data?.data?.length ?? (fetchError?.code === 'PGRST116' ? 0 : 'error: ' + fetchError?.message),
          localTasks: taskCount,
          isSaving,
          error: error || 'none',
        })
      }
      fetchDebug()
    }
  }, [tapCount, taskCount, mode, isSaving, error])

  if (!show) {
    return (
      <div
        className="absolute top-0 left-0 w-20 h-10 z-50"
        onClick={() => setTapCount(c => c + 1)}
      />
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 p-4 text-white text-sm font-mono" onClick={() => setShow(false)}>
      <div className="bg-gray-900 p-4 rounded-lg" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-2">Sync Debug (tap outside to close)</h3>
        <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 rounded"
          onClick={() => window.location.reload()}
        >
          Force Refresh
        </button>
      </div>
    </div>
  )
}

// Error banner component
function ErrorBanner({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  return (
    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg mb-4 flex items-center justify-between">
      <span className="text-sm">{error}</span>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-300 ml-4"
      >
        Dismiss
      </button>
    </div>
  )
}

export default function HomePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showCalendar, setShowCalendar] = useState(false)

  const {
    mode,
    isLoading,
    error,
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
    clearError,
  } = useTaskStore()

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || null
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd')

  // Show all incomplete tasks (persist across days) + completed tasks only for selected date
  const tasksForDate = tasks.filter(t =>
    !t.completed || t.scheduledDate === selectedDateStr
  )

  // Show loading state
  if (mode === 'loading' || isLoading) {
    return (
      <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen p-4 md:p-6 flex flex-col relative">
      {/* Debug - tap 5 times in top-left corner to show */}
      <SyncDebug taskCount={tasks.length} />

      {/* Error banner */}
      {error && <ErrorBanner error={error} onDismiss={clearError} />}

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
