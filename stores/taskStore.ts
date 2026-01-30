import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import { taskService } from '@/lib/supabase/taskService'

export interface Step {
  id: string
  text: string
  description?: string
  completed: boolean
  scheduledTime?: string
  scheduledDate?: string
  order: number
}

export interface Task {
  id: string
  title: string
  createdAt: string
  scheduledDate?: string
  scheduledTime?: string
  steps: Step[]
  completed: boolean
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
  labels?: string[]
  order?: number
}

// Predefined labels that users can choose from
export const TASK_LABELS = [
  { id: 'work', name: 'Work', color: 'blue' },
  { id: 'personal', name: 'Personal', color: 'green' },
  { id: 'health', name: 'Health', color: 'rose' },
  { id: 'learning', name: 'Learning', color: 'purple' },
  { id: 'urgent', name: 'Urgent', color: 'red' },
  { id: 'errands', name: 'Errands', color: 'orange' },
] as const

export type TaskLabelId = typeof TASK_LABELS[number]['id']

type Mode = 'loading' | 'cloud' | 'guest'

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  showCompleted: boolean

  // Cloud-first state
  mode: Mode
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Initialization
  initializeCloud: () => Promise<void>
  initializeGuest: () => void

  // Internal helper for saving to cloud
  _saveToCloud: (tasks: Task[]) => Promise<void>

  // Actions (async for cloud mode)
  addTask: (title: string, scheduledDate?: string) => Promise<void>
  updateTaskSchedule: (id: string, scheduledDate?: string, scheduledTime?: string) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  updateTaskTitle: (id: string, title: string) => Promise<void>
  selectTask: (id: string | null) => void
  toggleTaskCompleted: (id: string) => Promise<void>
  setShowCompleted: (show: boolean) => void
  updateTaskEstimate: (id: string, estimate: number) => Promise<void>
  incrementTaskPomodoro: (id: string) => Promise<void>
  updateTaskNote: (id: string, note: string) => Promise<void>
  clearCompletedTasks: () => Promise<void>

  addStep: (taskId: string, text: string, scheduledDate?: string) => Promise<void>
  updateStep: (taskId: string, stepId: string, updates: Partial<Step>) => Promise<void>
  deleteStep: (taskId: string, stepId: string) => Promise<void>
  toggleStep: (taskId: string, stepId: string) => Promise<void>
  reorderSteps: (taskId: string, stepIds: string[]) => Promise<void>

  // Task reordering and labels
  reorderTasks: (taskIds: string[]) => Promise<void>
  updateTaskLabels: (taskId: string, labels: string[]) => Promise<void>

  // For clearing error
  clearError: () => void
}

// Custom storage that only persists in guest mode
const guestOnlyStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(name)
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    // Only persist if in guest mode
    const state = JSON.parse(value)
    if (state?.state?.mode === 'guest') {
      localStorage.setItem(name, value)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      showCompleted: false,

      // Cloud-first state
      mode: 'loading' as Mode,
      isLoading: false,
      isSaving: false,
      error: null,

      // Initialize for logged-in user (cloud mode)
      initializeCloud: async () => {
        set({ mode: 'loading', isLoading: true, error: null })

        try {
          // Get current local tasks before switching to cloud
          const localTasks = get().tasks

          // Fetch cloud tasks
          const cloudTasks = await taskService.fetchTasks()

          if (cloudTasks.length > 0) {
            // Cloud has tasks - use them
            set({ tasks: cloudTasks, mode: 'cloud', isLoading: false })
          } else if (localTasks.length > 0) {
            // No cloud tasks but local tasks exist (guest-to-login transition)
            // Upload local tasks to cloud
            await taskService.saveTasks(localTasks)
            set({ mode: 'cloud', isLoading: false })
            // Clear localStorage for guest data since we're now in cloud mode
            localStorage.removeItem('paretflow-tasks-guest')
          } else {
            // No tasks anywhere
            set({ tasks: [], mode: 'cloud', isLoading: false })
          }
        } catch (error) {
          console.error('[TaskStore] Cloud initialization failed:', error)
          set({
            mode: 'cloud',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load tasks'
          })
        }
      },

      // Initialize for guest user (localStorage mode)
      initializeGuest: () => {
        set({ mode: 'guest', isLoading: false, error: null })
        // Zustand persist will hydrate from localStorage automatically
      },

      // Internal helper to save to cloud with error handling
      _saveToCloud: async (tasks: Task[]) => {
        const { mode } = get()
        if (mode !== 'cloud') return

        set({ isSaving: true })
        try {
          await taskService.saveTasks(tasks)
          set({ isSaving: false, error: null })
        } catch (error) {
          console.error('[TaskStore] Save failed:', error)
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Failed to save'
          })
          throw error // Re-throw for rollback handling
        }
      },

      addTask: async (title, scheduledDate) => {
        const { mode, tasks, _saveToCloud } = get()
        const dateToUse = scheduledDate || new Date().toISOString().split('T')[0]
        const newTask: Task = {
          id: generateId(),
          title,
          createdAt: new Date().toISOString(),
          scheduledDate: dateToUse,
          steps: [
            { id: generateId(), text: '', completed: false, order: 0, scheduledDate: dateToUse },
          ],
          completed: false,
          estimatedPomodoros: 1,
          completedPomodoros: 0,
        }

        const newTasks = [newTask, ...tasks]

        // Optimistic update
        set({ tasks: newTasks, selectedTaskId: newTask.id })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            // Rollback on failure
            set({ tasks, selectedTaskId: null })
          }
        }
      },

      updateTaskSchedule: async (id, scheduledDate, scheduledTime) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, scheduledDate, scheduledTime } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      deleteTask: async (id) => {
        const { mode, tasks, selectedTaskId, _saveToCloud } = get()
        const newTasks = tasks.filter(t => t.id !== id)
        const newSelectedId = selectedTaskId === id ? null : selectedTaskId

        set({ tasks: newTasks, selectedTaskId: newSelectedId })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks, selectedTaskId })
          }
        }
      },

      updateTaskTitle: async (id, title) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, title } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      selectTask: (id) => set({ selectedTaskId: id }),

      toggleTaskCompleted: async (id) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, completed: !t.completed } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      setShowCompleted: (show) => set({ showCompleted: show }),

      updateTaskEstimate: async (id, estimate) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, estimatedPomodoros: Math.max(1, estimate) } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      incrementTaskPomodoro: async (id) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      updateTaskNote: async (id, note) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === id ? { ...t, note } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      clearCompletedTasks: async () => {
        const { mode, tasks, selectedTaskId, _saveToCloud } = get()
        const newTasks = tasks.filter(t => !t.completed)
        const newSelectedId = tasks.find(t => t.id === selectedTaskId)?.completed
          ? null
          : selectedTaskId

        set({ tasks: newTasks, selectedTaskId: newSelectedId })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks, selectedTaskId })
          }
        }
      },

      addStep: async (taskId, text, scheduledDate) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t => {
          if (t.id !== taskId) return t
          const newStep: Step = {
            id: generateId(),
            text,
            completed: false,
            order: t.steps.length,
            scheduledDate,
          }
          return { ...t, steps: [...t.steps, newStep] }
        })

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      updateStep: async (taskId, stepId, updates) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t => {
          if (t.id !== taskId) return t
          return {
            ...t,
            steps: t.steps.map(s =>
              s.id === stepId ? { ...s, ...updates } : s
            ),
          }
        })

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      deleteStep: async (taskId, stepId) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t => {
          if (t.id !== taskId) return t
          const steps = t.steps
            .filter(s => s.id !== stepId)
            .map((s, i) => ({ ...s, order: i }))
          return { ...t, steps }
        })

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      toggleStep: async (taskId, stepId) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t => {
          if (t.id !== taskId) return t
          return {
            ...t,
            steps: t.steps.map(s =>
              s.id === stepId ? { ...s, completed: !s.completed } : s
            ),
          }
        })

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      reorderSteps: async (taskId, stepIds) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t => {
          if (t.id !== taskId) return t
          const stepsMap = new Map(t.steps.map(s => [s.id, s]))
          const reorderedSteps = stepIds
            .map((id, index) => {
              const step = stepsMap.get(id)
              return step ? { ...step, order: index } : null
            })
            .filter((s): s is Step => s !== null)
          return { ...t, steps: reorderedSteps }
        })

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      reorderTasks: async (taskIds) => {
        const { mode, tasks, _saveToCloud } = get()
        const tasksMap = new Map(tasks.map(t => [t.id, t]))
        const reorderedTasks = taskIds
          .map((id, index) => {
            const task = tasksMap.get(id)
            return task ? { ...task, order: index } : null
          })
          .filter((t): t is Task => t !== null)

        // Add any tasks not in taskIds at the end (shouldn't happen but just in case)
        const reorderedIds = new Set(taskIds)
        const remainingTasks = tasks.filter(t => !reorderedIds.has(t.id))
        const newTasks = [...reorderedTasks, ...remainingTasks]

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      updateTaskLabels: async (taskId, labels) => {
        const { mode, tasks, _saveToCloud } = get()
        const newTasks = tasks.map(t =>
          t.id === taskId ? { ...t, labels } : t
        )

        set({ tasks: newTasks })

        if (mode === 'cloud') {
          try {
            await _saveToCloud(newTasks)
          } catch {
            set({ tasks })
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'paretflow-tasks-guest',
      storage: createJSONStorage(() => guestOnlyStorage),
      partialize: (state) => ({
        tasks: state.tasks,
        selectedTaskId: state.selectedTaskId,
        showCompleted: state.showCompleted,
        mode: state.mode,
      }),
    }
  )
)
