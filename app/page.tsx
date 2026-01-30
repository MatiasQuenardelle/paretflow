'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { useTaskStore } from '@/stores/taskStore'
import { TaskColumn } from '@/components/tasks/TaskColumn'
import { StepsColumn } from '@/components/tasks/StepsColumn'
import { CompactTimerBar } from '@/components/timer/CompactTimerBar'
import { CalendarPopup } from '@/components/calendar/CalendarPopup'
import { createClient } from '@/lib/supabase/client'
import { ListTodo, CheckSquare } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

// Debug component to show sync status - tap 5 times on "Tasks" header to show
function SyncDebug({ taskCount, tasks }: { taskCount: number, tasks: any[] }) {
  const [show, setShow] = useState(false)
  const [tapCount, setTapCount] = useState(0)
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [isForceSyncing, setIsForceSyncing] = useState(false)
  const { mode, isSaving, error, refreshFromCloud } = useTaskStore()

  const fetchDebug = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: fetchError } = user ? await supabase
      .from('tasks')
      .select('data, updated_at')
      .eq('user_id', user.id)
      .single() : { data: null, error: null }

    const cloudTasksData = data?.data as any[] | undefined

    // Count completed vs incomplete
    const completedTasks = tasks.filter((t: any) => t.completed)
    const incompleteTasks = tasks.filter((t: any) => !t.completed)
    const cloudCompletedTasks = cloudTasksData?.filter((t: any) => t.completed) || []
    const cloudIncompleteTasks = cloudTasksData?.filter((t: any) => !t.completed) || []

    setDebugInfo({
      mode,
      userId: user?.id?.slice(0, 8) || 'none',
      email: user?.email || 'none',
      cloudTasks: cloudTasksData?.length ?? (fetchError?.code === 'PGRST116' ? 0 : 'error: ' + fetchError?.message),
      cloudCompleted: cloudCompletedTasks.length,
      cloudIncomplete: cloudIncompleteTasks.length,
      cloudTaskNames: cloudTasksData?.map((t: any) => `${t.title} (${t.completed ? '✓' : '○'}) ${t.steps?.length || 0} steps`).slice(0, 8) || [],
      localTasks: taskCount,
      localCompleted: completedTasks.length,
      localIncomplete: incompleteTasks.length,
      localTaskNames: tasks.map((t: any) => `${t.title} (${t.completed ? '✓' : '○'}) ${t.steps?.length || 0} steps`).slice(0, 8),
      cloudUpdatedAt: data?.updated_at ? new Date(data.updated_at).toLocaleString() : 'none',
      isSaving,
      error: error || 'none',
    })
  }

  const handleForceSync = async () => {
    if (mode !== 'cloud' || isForceSyncing) return
    setIsForceSyncing(true)
    try {
      await refreshFromCloud()
      await fetchDebug() // Refresh debug info
    } catch (e) {
      console.error('Force sync failed:', e)
    } finally {
      setIsForceSyncing(false)
    }
  }

  useEffect(() => {
    if (tapCount >= 5) {
      setShow(true)
      setTapCount(0)
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
      <div className="bg-gray-900 p-4 rounded-lg max-w-md max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>
        <h3 className="font-bold mb-2">Sync Debug (tap outside to close)</h3>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
        <div className="flex flex-col gap-2 mt-4">
          <button
            className="w-full px-4 py-2 bg-green-600 rounded disabled:opacity-50"
            onClick={handleForceSync}
            disabled={isForceSyncing || mode !== 'cloud'}
          >
            {isForceSyncing ? 'Syncing...' : 'Force Sync from Cloud'}
          </button>
          <button
            className="w-full px-4 py-2 bg-blue-600 rounded"
            onClick={() => window.location.reload()}
          >
            Hard Refresh
          </button>
        </div>
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
  const [mobileTab, setMobileTab] = useState<'tasks' | 'steps'>('tasks')
  const t = useTranslations()

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
    reorderTasks,
    updateTaskLabels,
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

  // Debug: Log if there's a count mismatch
  if (typeof window !== 'undefined' && tasks.length !== tasksForDate.length) {
    console.log('[TaskFilter] Total tasks:', tasks.length, 'Visible tasks:', tasksForDate.length)
    console.log('[TaskFilter] Hidden tasks:', tasks.filter(t => t.completed && t.scheduledDate !== selectedDateStr).map(t => ({ title: t.title, completed: t.completed, scheduledDate: t.scheduledDate })))
  }

  // Show loading state
  if (mode === 'loading' || isLoading) {
    return (
      <div className="h-[calc(100dvh-5rem)] md:h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-muted">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-screen md:p-6 flex flex-col relative">
      {/* Debug - tap 5 times in top-left corner to show */}
      <SyncDebug taskCount={tasks.length} tasks={tasks} />

      {/* Error banner */}
      {error && (
        <div className="px-2 md:px-0">
          <ErrorBanner error={error} onDismiss={clearError} />
        </div>
      )}

      {/* Compact Timer Bar - minimal on mobile */}
      <div className="px-2 md:px-0">
        <CompactTimerBar />
      </div>

      {/* Mobile Tab Navigation */}
      <div className="md:hidden flex border-b border-white/10 dark:border-white/5 bg-surface/80 backdrop-blur-xl">
        <button
          onClick={() => setMobileTab('tasks')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-200 ${
            mobileTab === 'tasks'
              ? 'text-blue-500 border-b-2 border-blue-500 bg-gradient-to-t from-blue-500/10 to-transparent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ListTodo size={16} />
          {t.tasks.title}
        </button>
        <button
          onClick={() => setMobileTab('steps')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-all duration-200 ${
            mobileTab === 'steps'
              ? 'text-blue-500 border-b-2 border-blue-500 bg-gradient-to-t from-blue-500/10 to-transparent'
              : 'text-muted hover:text-foreground'
          }`}
        >
          <CheckSquare size={16} />
          {t.tasks.steps}
          {selectedTask && (
            <span className="text-xs bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded-full">
              {selectedTask.steps.filter(s => s.scheduledDate === format(selectedDate, 'yyyy-MM-dd')).length}
            </span>
          )}
        </button>
      </div>

      {/* Desktop: Two-column layout */}
      <div className="hidden md:grid md:grid-cols-[320px_1fr] gap-6 flex-1 min-h-0">
        {/* Tasks Column */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl p-4 overflow-hidden flex flex-col shadow-xl shadow-black/5 dark:shadow-black/20">
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
            onReorderTasks={reorderTasks}
            onUpdateLabels={updateTaskLabels}
          />
        </div>

        {/* Steps Column */}
        <div className="bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl p-4 overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/20">
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

      {/* Mobile: Full-screen tab content */}
      <div className="md:hidden flex-1 min-h-0 overflow-hidden">
        {/* Tasks Tab */}
        <div className={`h-full ${mobileTab === 'tasks' ? 'block' : 'hidden'}`}>
          <div className="h-full overflow-hidden flex flex-col px-2 py-2">
            <TaskColumn
              tasks={tasksForDate}
              selectedTaskId={selectedTaskId}
              showCompleted={showCompleted}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onSelectTask={(id) => {
                selectTask(id)
                if (id) setMobileTab('steps')
              }}
              onAddTask={addTask}
              onDeleteTask={deleteTask}
              onToggleCompleted={toggleTaskCompleted}
              onSetShowCompleted={setShowCompleted}
              onUpdateEstimate={updateTaskEstimate}
              onClearCompleted={clearCompletedTasks}
              onOpenCalendar={() => setShowCalendar(true)}
              onReorderTasks={reorderTasks}
              onUpdateLabels={updateTaskLabels}
            />
          </div>
        </div>

        {/* Steps Tab */}
        <div className={`h-full ${mobileTab === 'steps' ? 'block' : 'hidden'}`}>
          <div className="h-full overflow-hidden flex flex-col px-2 py-2">
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
