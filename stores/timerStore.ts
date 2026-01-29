import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type TimerMode = '25/5' | '50/10' | 'custom'

export interface TimerSession {
  id: string
  duration: number
  completedAt: string
  taskId?: string
}

interface TimerSettings {
  focusDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  pomodorosUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

interface TimerState {
  mode: TimerMode
  customWork: number
  customBreak: number
  timeRemaining: number
  isRunning: boolean
  isBreak: boolean
  isLongBreak: boolean
  sessionsToday: TimerSession[]
  allSessions: TimerSession[]
  pomodoroCount: number // count towards long break
  activeTaskId: string | null
  settings: TimerSettings
  // Persistence: store when timer started and initial duration
  startedAt: number | null // timestamp when timer was started
  initialDuration: number // duration when timer was started (in seconds)

  // Actions
  setMode: (mode: TimerMode) => void
  setCustomTimes: (work: number, breakTime: number) => void
  setSettings: (settings: Partial<TimerSettings>) => void
  setActiveTask: (taskId: string | null) => void
  start: () => void
  pause: () => void
  reset: () => void
  tick: () => void
  completeSession: (taskId?: string) => boolean
  switchToBreak: () => void
  switchToLongBreak: () => void
  switchToWork: () => void
  skipBreak: () => void
  // Sync time based on elapsed time since start
  syncTime: () => number
}

function getWorkDuration(mode: TimerMode, customWork: number): number {
  switch (mode) {
    case '25/5': return 25 * 60
    case '50/10': return 50 * 60
    case 'custom': return customWork * 60
  }
}

function getBreakDuration(mode: TimerMode, customBreak: number): number {
  switch (mode) {
    case '25/5': return 5 * 60
    case '50/10': return 10 * 60
    case 'custom': return customBreak * 60
  }
}

const defaultSettings: TimerSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      mode: '25/5',
      customWork: 25,
      customBreak: 5,
      timeRemaining: 25 * 60,
      isRunning: false,
      isBreak: false,
      isLongBreak: false,
      sessionsToday: [],
      allSessions: [],
      pomodoroCount: 0,
      activeTaskId: null,
      settings: defaultSettings,
      startedAt: null,
      initialDuration: 25 * 60,

      setMode: (mode) => {
        const { customWork } = get()
        set({
          mode,
          timeRemaining: getWorkDuration(mode, customWork),
          isRunning: false,
          isBreak: false,
          isLongBreak: false,
        })
      },

      setCustomTimes: (work, breakTime) => {
        set({
          customWork: work,
          customBreak: breakTime,
          timeRemaining: work * 60,
          isRunning: false,
          isBreak: false,
          isLongBreak: false,
        })
      },

      setSettings: (newSettings) => {
        set(state => ({
          settings: { ...state.settings, ...newSettings }
        }))
      },

      setActiveTask: (taskId) => set({ activeTaskId: taskId }),

      start: () => {
        const { timeRemaining } = get()
        set({
          isRunning: true,
          startedAt: Date.now(),
          initialDuration: timeRemaining,
        })
      },

      pause: () => {
        // Sync the time before pausing
        const { startedAt, initialDuration } = get()
        if (startedAt) {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000)
          const newTimeRemaining = Math.max(0, initialDuration - elapsed)
          set({
            isRunning: false,
            timeRemaining: newTimeRemaining,
            startedAt: null,
          })
        } else {
          set({ isRunning: false })
        }
      },

      reset: () => {
        const { mode, customWork, isBreak, isLongBreak, customBreak, settings } = get()
        let timeRemaining: number
        if (isLongBreak) {
          timeRemaining = settings.longBreakDuration * 60
        } else if (isBreak) {
          timeRemaining = getBreakDuration(mode, customBreak)
        } else {
          timeRemaining = getWorkDuration(mode, customWork)
        }
        set({ timeRemaining, isRunning: false })
      },

      tick: () => {
        // Calculate time based on actual elapsed time, not intervals
        const { startedAt, initialDuration } = get()
        if (startedAt) {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000)
          const newTimeRemaining = Math.max(0, initialDuration - elapsed)
          set({ timeRemaining: newTimeRemaining })
        }
      },

      syncTime: () => {
        // Called on mount to sync time if timer was running
        const { isRunning, startedAt, initialDuration } = get()
        if (isRunning && startedAt) {
          const elapsed = Math.floor((Date.now() - startedAt) / 1000)
          const newTimeRemaining = Math.max(0, initialDuration - elapsed)
          set({ timeRemaining: newTimeRemaining })
          return newTimeRemaining
        }
        return get().timeRemaining
      },

      completeSession: (taskId) => {
        const { mode, customWork, sessionsToday, allSessions, pomodoroCount, settings } = get()
        const duration = getWorkDuration(mode, customWork) / 60
        const today = new Date().toDateString()

        // Filter to only today's sessions
        const todaySessions = sessionsToday.filter(
          s => new Date(s.completedAt).toDateString() === today
        )

        const newSession: TimerSession = {
          id: `${Date.now()}`,
          duration,
          completedAt: new Date().toISOString(),
          taskId,
        }

        const newPomodoroCount = pomodoroCount + 1

        set({
          sessionsToday: [...todaySessions, newSession],
          allSessions: [...allSessions, newSession],
          pomodoroCount: newPomodoroCount >= settings.pomodorosUntilLongBreak ? 0 : newPomodoroCount,
        })

        return newPomodoroCount >= settings.pomodorosUntilLongBreak
      },

      switchToBreak: () => {
        const { mode, customBreak, settings } = get()
        set({
          isBreak: true,
          isLongBreak: false,
          timeRemaining: getBreakDuration(mode, customBreak),
          isRunning: settings.autoStartBreaks,
        })
      },

      switchToLongBreak: () => {
        const { settings } = get()
        set({
          isBreak: true,
          isLongBreak: true,
          timeRemaining: settings.longBreakDuration * 60,
          isRunning: settings.autoStartBreaks,
        })
      },

      switchToWork: () => {
        const { mode, customWork, settings } = get()
        set({
          isBreak: false,
          isLongBreak: false,
          timeRemaining: getWorkDuration(mode, customWork),
          isRunning: settings.autoStartPomodoros,
        })
      },

      skipBreak: () => {
        const { mode, customWork, settings } = get()
        set({
          isBreak: false,
          isLongBreak: false,
          timeRemaining: getWorkDuration(mode, customWork),
          isRunning: settings.autoStartPomodoros,
        })
      },
    }),
    {
      name: 'paretflow-timer',
      partialize: (state) => ({
        mode: state.mode,
        customWork: state.customWork,
        customBreak: state.customBreak,
        sessionsToday: state.sessionsToday,
        allSessions: state.allSessions,
        pomodoroCount: state.pomodoroCount,
        settings: state.settings,
        // Persist timer state for background/close persistence
        isRunning: state.isRunning,
        isBreak: state.isBreak,
        isLongBreak: state.isLongBreak,
        startedAt: state.startedAt,
        initialDuration: state.initialDuration,
        timeRemaining: state.timeRemaining,
      }),
    }
  )
)
