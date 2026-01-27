import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { generateId } from '@/lib/utils'

export interface Step {
  id: string
  text: string
  completed: boolean
  scheduledTime?: string
  scheduledDate?: string
  order: number
}

export interface Task {
  id: string
  title: string
  createdAt: string
  steps: Step[]
  completed: boolean
  estimatedPomodoros: number
  completedPomodoros: number
  note?: string
}

interface TaskState {
  tasks: Task[]
  selectedTaskId: string | null
  showCompleted: boolean

  // Actions
  addTask: (title: string) => void
  deleteTask: (id: string) => void
  updateTaskTitle: (id: string, title: string) => void
  selectTask: (id: string | null) => void
  toggleTaskCompleted: (id: string) => void
  setShowCompleted: (show: boolean) => void
  updateTaskEstimate: (id: string, estimate: number) => void
  incrementTaskPomodoro: (id: string) => void
  updateTaskNote: (id: string, note: string) => void
  clearCompletedTasks: () => void

  addStep: (taskId: string, text: string) => void
  updateStep: (taskId: string, stepId: string, updates: Partial<Step>) => void
  deleteStep: (taskId: string, stepId: string) => void
  toggleStep: (taskId: string, stepId: string) => void
  reorderSteps: (taskId: string, stepIds: string[]) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      selectedTaskId: null,
      showCompleted: false,

      addTask: (title) => {
        const newTask: Task = {
          id: generateId(),
          title,
          createdAt: new Date().toISOString(),
          steps: [],
          completed: false,
          estimatedPomodoros: 1,
          completedPomodoros: 0,
        }
        set(state => ({
          tasks: [newTask, ...state.tasks],
          selectedTaskId: newTask.id,
        }))
      },

      deleteTask: (id) => {
        set(state => ({
          tasks: state.tasks.filter(t => t.id !== id),
          selectedTaskId: state.selectedTaskId === id ? null : state.selectedTaskId,
        }))
      },

      updateTaskTitle: (id, title) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, title } : t
          ),
        }))
      },

      selectTask: (id) => set({ selectedTaskId: id }),

      toggleTaskCompleted: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        }))
      },

      setShowCompleted: (show) => set({ showCompleted: show }),

      updateTaskEstimate: (id, estimate) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, estimatedPomodoros: Math.max(1, estimate) } : t
          ),
        }))
      },

      incrementTaskPomodoro: (id) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, completedPomodoros: t.completedPomodoros + 1 } : t
          ),
        }))
      },

      updateTaskNote: (id, note) => {
        set(state => ({
          tasks: state.tasks.map(t =>
            t.id === id ? { ...t, note } : t
          ),
        }))
      },

      clearCompletedTasks: () => {
        set(state => ({
          tasks: state.tasks.filter(t => !t.completed),
          selectedTaskId: state.tasks.find(t => t.id === state.selectedTaskId)?.completed
            ? null
            : state.selectedTaskId,
        }))
      },

      addStep: (taskId, text) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            const newStep: Step = {
              id: generateId(),
              text,
              completed: false,
              order: t.steps.length,
            }
            return { ...t, steps: [...t.steps, newStep] }
          }),
        }))
      },

      updateStep: (taskId, stepId, updates) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            return {
              ...t,
              steps: t.steps.map(s =>
                s.id === stepId ? { ...s, ...updates } : s
              ),
            }
          }),
        }))
      },

      deleteStep: (taskId, stepId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            const steps = t.steps
              .filter(s => s.id !== stepId)
              .map((s, i) => ({ ...s, order: i }))
            return { ...t, steps }
          }),
        }))
      },

      toggleStep: (taskId, stepId) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            return {
              ...t,
              steps: t.steps.map(s =>
                s.id === stepId ? { ...s, completed: !s.completed } : s
              ),
            }
          }),
        }))
      },

      reorderSteps: (taskId, stepIds) => {
        set(state => ({
          tasks: state.tasks.map(t => {
            if (t.id !== taskId) return t
            const stepsMap = new Map(t.steps.map(s => [s.id, s]))
            const reorderedSteps = stepIds
              .map((id, index) => {
                const step = stepsMap.get(id)
                return step ? { ...step, order: index } : null
              })
              .filter((s): s is Step => s !== null)
            return { ...t, steps: reorderedSteps }
          }),
        }))
      },
    }),
    {
      name: 'paretflow-tasks',
    }
  )
)
