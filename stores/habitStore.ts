import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'

export interface HabitDefinition {
  id: string
  name: string
  description: string
  benefit: string
  suggestedTime: string // HH:MM format
  icon: string // lucide icon name
  color: string // tailwind color
  points: number
}

export interface HabitCompletion {
  habitId: string
  date: string // YYYY-MM-DD
  completedAt: string // ISO timestamp
  scheduledTime?: string // HH:MM if scheduled
}

export interface ScheduledHabit {
  habitId: string
  date: string // YYYY-MM-DD
  time: string // HH:MM
}

// Predefined Pareto Power Habits
export const POWER_HABITS: HabitDefinition[] = [
  {
    id: 'meditation',
    name: 'Meditate',
    description: '10 minutes of mindfulness meditation',
    benefit: 'Meditation reduces stress, improves focus, and enhances emotional regulation. Just 10 minutes daily can lower cortisol levels, improve memory, and increase gray matter in brain regions associated with self-awareness and compassion. Studies show regular meditators have better attention spans and are more resilient to distractions.',
    suggestedTime: '09:00',
    icon: 'Brain',
    color: 'purple',
    points: 10,
  },
  {
    id: 'magnesium',
    name: 'Take Magnesium',
    description: 'Take magnesium supplement',
    benefit: 'Magnesium is essential for over 300 enzymatic reactions in your body. Taking it in the evening (around 7 PM) helps promote better sleep quality by regulating melatonin and GABA. It also supports muscle relaxation, reduces stress, and helps maintain healthy blood pressure. Most people are deficient in this crucial mineral.',
    suggestedTime: '19:00',
    icon: 'Pill',
    color: 'cyan',
    points: 5,
  },
]

interface HabitState {
  completions: HabitCompletion[]
  scheduledHabits: ScheduledHabit[]

  // Actions
  completeHabit: (habitId: string) => void
  uncompleteHabit: (habitId: string, date: string) => void
  scheduleHabit: (habitId: string, date: string, time: string) => void
  unscheduleHabit: (habitId: string, date: string) => void

  // Selectors
  isCompletedToday: (habitId: string) => boolean
  getCompletionsForDate: (date: string) => HabitCompletion[]
  getScheduledForDate: (date: string) => ScheduledHabit[]
  getTodayScore: () => number
  getTotalCompletions: (habitId: string) => number
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      completions: [],
      scheduledHabits: [],

      completeHabit: (habitId) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const now = new Date().toISOString()
        const scheduled = get().scheduledHabits.find(
          s => s.habitId === habitId && s.date === today
        )

        set(state => ({
          completions: [
            ...state.completions,
            {
              habitId,
              date: today,
              completedAt: now,
              scheduledTime: scheduled?.time,
            },
          ],
        }))
      },

      uncompleteHabit: (habitId, date) => {
        set(state => ({
          completions: state.completions.filter(
            c => !(c.habitId === habitId && c.date === date)
          ),
        }))
      },

      scheduleHabit: (habitId, date, time) => {
        set(state => {
          // Remove any existing schedule for this habit on this date
          const filtered = state.scheduledHabits.filter(
            s => !(s.habitId === habitId && s.date === date)
          )
          return {
            scheduledHabits: [...filtered, { habitId, date, time }],
          }
        })
      },

      unscheduleHabit: (habitId, date) => {
        set(state => ({
          scheduledHabits: state.scheduledHabits.filter(
            s => !(s.habitId === habitId && s.date === date)
          ),
        }))
      },

      isCompletedToday: (habitId) => {
        const today = format(new Date(), 'yyyy-MM-dd')
        return get().completions.some(
          c => c.habitId === habitId && c.date === today
        )
      },

      getCompletionsForDate: (date) => {
        return get().completions.filter(c => c.date === date)
      },

      getScheduledForDate: (date) => {
        return get().scheduledHabits.filter(s => s.date === date)
      },

      getTodayScore: () => {
        const today = format(new Date(), 'yyyy-MM-dd')
        const todayCompletions = get().completions.filter(c => c.date === today)
        return todayCompletions.reduce((score, completion) => {
          const habit = POWER_HABITS.find(h => h.id === completion.habitId)
          return score + (habit?.points || 0)
        }, 0)
      },

      getTotalCompletions: (habitId) => {
        return get().completions.filter(c => c.habitId === habitId).length
      },
    }),
    {
      name: 'paretflow-habits',
    }
  )
)
