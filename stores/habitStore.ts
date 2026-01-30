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
  illustration: string // URL for illustration image
  type: 'positive' | 'negative' // distinguish habit types
  difficulty: 'easy' | 'medium' | 'hard' // for recommended logic
  isRecommended: boolean // mark as part of recommended set
}

// Type for translated habit content
export interface HabitTranslation {
  name: string
  description: string
  benefit: string
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
  // Positive habits
  {
    id: 'wake-early',
    name: 'Wake Up Early',
    description: 'Wake up at 6 AM or earlier',
    benefit: 'Waking up early gives you quiet, uninterrupted time before the world demands your attention. Early risers report higher productivity, better mental health, and more time for self-improvement activities. Studies show morning people tend to be more proactive, optimistic, and better at anticipating problems. The discipline of an early wake-up also improves sleep quality by regulating your circadian rhythm.',
    suggestedTime: '06:00',
    icon: 'Sunrise',
    color: 'amber',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800&q=80',
    type: 'positive',
    difficulty: 'medium',
    isRecommended: false,
  },
  {
    id: 'meditation',
    name: 'Meditate',
    description: '10 minutes of mindfulness meditation',
    benefit: 'Meditation reduces stress, improves focus, and enhances emotional regulation. Just 10 minutes daily can lower cortisol levels, improve memory, and increase gray matter in brain regions associated with self-awareness and compassion. Studies show regular meditators have better attention spans and are more resilient to distractions.',
    suggestedTime: '09:00',
    icon: 'Brain',
    color: 'purple',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
    type: 'positive',
    difficulty: 'easy',
    isRecommended: true,
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
    illustration: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    type: 'positive',
    difficulty: 'easy',
    isRecommended: true,
  },
  {
    id: 'omega3',
    name: 'Take Omega-3',
    description: 'Take omega-3 fish oil supplement',
    benefit: 'Omega-3 fatty acids (EPA and DHA) are essential for brain health, reducing inflammation, and supporting heart function. Studies show they improve cognitive performance, reduce symptoms of depression and anxiety, and protect against age-related mental decline. Taking omega-3 with a meal improves absorption significantly.',
    suggestedTime: '08:00',
    icon: 'Fish',
    color: 'blue',
    points: 5,
    illustration: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
    type: 'positive',
    difficulty: 'easy',
    isRecommended: true,
  },
  {
    id: 'gym',
    name: 'Lift Weights',
    description: 'Strength training session at the gym',
    benefit: 'Resistance training builds muscle mass, increases bone density, and boosts metabolism. It improves insulin sensitivity, reduces risk of injury, and releases growth hormone and testosterone. Studies show strength training reduces symptoms of anxiety and depression while improving cognitive function and sleep quality.',
    suggestedTime: '07:00',
    icon: 'Dumbbell',
    color: 'red',
    points: 15,
    illustration: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
    type: 'positive',
    difficulty: 'hard',
    isRecommended: false,
  },
  {
    id: 'steps',
    name: '10,000 Steps',
    description: 'Walk 10,000 steps throughout the day',
    benefit: 'Walking 10,000 steps daily improves cardiovascular health, aids weight management, and reduces risk of chronic diseases. It boosts mood through endorphin release, improves creativity and problem-solving, and counteracts the negative effects of prolonged sitting. Low-impact and sustainable for long-term health.',
    suggestedTime: '12:00',
    icon: 'Footprints',
    color: 'green',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
    type: 'positive',
    difficulty: 'medium',
    isRecommended: true,
  },
  {
    id: 'cardio',
    name: 'Cardio Session',
    description: '20-25 minutes of cardiovascular exercise',
    benefit: 'Cardiovascular exercise strengthens your heart, improves lung capacity, and increases endurance. It reduces blood pressure, improves cholesterol levels, and releases endorphins that boost mood. Regular cardio is linked to better brain health, reduced risk of dementia, and improved sleep quality.',
    suggestedTime: '17:00',
    icon: 'HeartPulse',
    color: 'rose',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&q=80',
    type: 'positive',
    difficulty: 'hard',
    isRecommended: false,
  },
  {
    id: 'calories',
    name: 'Hit Calorie Goal',
    description: 'Stay within your daily calorie target',
    benefit: 'Calorie balance is the foundation of body composition. For fat loss, a moderate deficit of 300-500 calories preserves muscle while burning fat. For muscle gain, a slight surplus of 200-300 calories with adequate protein (1.6-2.2g/kg) maximizes growth. Combined with strength training, proper nutrition transforms your physique. Track consistently—what gets measured gets managed.',
    suggestedTime: '21:00',
    icon: 'Flame',
    color: 'orange',
    points: 15,
    illustration: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
    type: 'positive',
    difficulty: 'hard',
    isRecommended: false,
  },
  // Negative habits (habits to avoid)
  {
    id: 'no-smoking',
    name: 'Avoid Smoking',
    description: 'Stay smoke-free today',
    benefit: 'Every day without smoking reduces your risk of heart disease, stroke, and cancer. Within 24 hours, your blood pressure and heart rate begin to normalize. After a few days, your lungs start to clear. Your body has remarkable healing abilities when you give it a break from tobacco.',
    suggestedTime: '00:00',
    icon: 'ShieldCheck',
    color: 'slate',
    points: 15,
    illustration: 'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=800&q=80',
    type: 'negative',
    difficulty: 'hard',
    isRecommended: false,
  },
  {
    id: 'no-alcohol',
    name: 'Avoid Alcohol',
    description: 'Stay alcohol-free today',
    benefit: 'Skipping alcohol improves sleep quality, mental clarity, and energy levels. Your liver can recover, your skin improves, and you avoid empty calories. Regular alcohol-free days help maintain a healthy relationship with drinking and support long-term health goals.',
    suggestedTime: '00:00',
    icon: 'ShieldCheck',
    color: 'slate',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1569937756447-1d44f657dc69?w=800&q=80',
    type: 'negative',
    difficulty: 'medium',
    isRecommended: false,
  },
  {
    id: 'no-junk-food',
    name: 'Avoid Junk Food',
    description: 'No processed or fast food today',
    benefit: 'Avoiding junk food stabilizes blood sugar, reduces inflammation, and supports gut health. You\'ll have more stable energy throughout the day and avoid the crash that comes from processed foods. Over time, your taste preferences adjust to appreciate whole foods more.',
    suggestedTime: '00:00',
    icon: 'ShieldCheck',
    color: 'slate',
    points: 10,
    illustration: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=800&q=80',
    type: 'negative',
    difficulty: 'medium',
    isRecommended: false,
  },
  {
    id: 'no-social-media',
    name: 'Limit Social Media',
    description: 'No mindless scrolling today',
    benefit: 'Reducing social media improves focus, reduces anxiety, and frees up hours for meaningful activities. Studies link excessive social media use to depression and poor self-esteem. Reclaim your attention and time for things that truly matter to you.',
    suggestedTime: '00:00',
    icon: 'ShieldCheck',
    color: 'slate',
    points: 5,
    illustration: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&q=80',
    type: 'negative',
    difficulty: 'easy',
    isRecommended: false,
  },
  {
    id: 'no-late-snacking',
    name: 'No Late Snacking',
    description: 'No eating after 8 PM',
    benefit: 'Avoiding late-night eating improves sleep quality, supports weight management, and gives your digestive system time to rest. Late eating disrupts your circadian rhythm and can lead to acid reflux. A consistent eating window supports metabolic health.',
    suggestedTime: '20:00',
    icon: 'ShieldCheck',
    color: 'slate',
    points: 5,
    illustration: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=800&q=80',
    type: 'negative',
    difficulty: 'easy',
    isRecommended: false,
  },
]

interface HabitState {
  completions: HabitCompletion[]
  scheduledHabits: ScheduledHabit[]
  habitOrder: Record<string, string[]> // date -> habitIds in order
  enabledHabits: string[] // global default enabled habits (all by default)
  dailyHabitOverrides: Record<string, string[]> // date -> enabled habit IDs for that day
  recommendedBannerDismissed: boolean // track if user dismissed the banner

  // Actions
  completeHabit: (habitId: string) => void
  uncompleteHabit: (habitId: string, date: string) => void
  scheduleHabit: (habitId: string, date: string, time: string) => void
  scheduleHabitForDays: (habitId: string, dates: string[], time: string) => void
  unscheduleHabit: (habitId: string, date: string) => void
  reorderHabits: (date: string, habitIds: string[]) => void
  setEnabledHabits: (habitIds: string[]) => void
  setDailyOverride: (date: string, habitIds: string[]) => void
  clearDailyOverride: (date: string) => void
  dismissRecommendedBanner: () => void

  // Selectors
  isCompletedToday: (habitId: string) => boolean
  getCompletionsForDate: (date: string) => HabitCompletion[]
  getScheduledForDate: (date: string) => ScheduledHabit[]
  getOrderedScheduledForDate: (date: string) => ScheduledHabit[]
  getTodayScore: () => number
  getTotalCompletions: (habitId: string) => number
  getEnabledForDate: (date: string) => string[]
  getNegativeStreak: (habitId: string) => number
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      completions: [],
      scheduledHabits: [],
      habitOrder: {},
      enabledHabits: POWER_HABITS.map(h => h.id), // all habits enabled by default
      dailyHabitOverrides: {},
      recommendedBannerDismissed: false,

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

      scheduleHabitForDays: (habitId, dates, time) => {
        set(state => {
          // Remove any existing schedules for this habit on these dates
          const filtered = state.scheduledHabits.filter(
            s => !(s.habitId === habitId && dates.includes(s.date))
          )
          // Add new schedules for all dates
          const newSchedules = dates.map(date => ({ habitId, date, time }))
          return {
            scheduledHabits: [...filtered, ...newSchedules],
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

      reorderHabits: (date, habitIds) => {
        set(state => ({
          habitOrder: {
            ...state.habitOrder,
            [date]: habitIds,
          },
        }))
      },

      setEnabledHabits: (habitIds) => {
        set({ enabledHabits: habitIds })
      },

      setDailyOverride: (date, habitIds) => {
        set(state => ({
          dailyHabitOverrides: {
            ...state.dailyHabitOverrides,
            [date]: habitIds,
          },
        }))
      },

      clearDailyOverride: (date) => {
        set(state => {
          const newOverrides = { ...state.dailyHabitOverrides }
          delete newOverrides[date]
          return { dailyHabitOverrides: newOverrides }
        })
      },

      dismissRecommendedBanner: () => {
        set({ recommendedBannerDismissed: true })
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

      getOrderedScheduledForDate: (date) => {
        const scheduled = get().scheduledHabits.filter(s => s.date === date)
        const customOrder = get().habitOrder[date]

        // If user has set a custom order, use it
        if (customOrder && customOrder.length > 0) {
          return [...scheduled].sort((a, b) => {
            const orderA = customOrder.indexOf(a.habitId)
            const orderB = customOrder.indexOf(b.habitId)
            // Items in custom order come first, sorted by their position
            // Items not in custom order come after, sorted by time
            if (orderA !== -1 && orderB !== -1) return orderA - orderB
            if (orderA !== -1) return -1
            if (orderB !== -1) return 1
            return a.time.localeCompare(b.time)
          })
        }

        // Default: sort by scheduled time (earliest first)
        return [...scheduled].sort((a, b) => a.time.localeCompare(b.time))
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

      getEnabledForDate: (date) => {
        const override = get().dailyHabitOverrides[date]
        if (override) return override
        return get().enabledHabits
      },

      getNegativeStreak: (habitId) => {
        const completions = get().completions
        const habit = POWER_HABITS.find(h => h.id === habitId)
        if (!habit || habit.type !== 'negative') return 0

        // For negative habits, streak counts consecutive days marked as "avoided"
        let streak = 0
        const today = format(new Date(), 'yyyy-MM-dd')
        let checkDate = new Date()

        while (true) {
          const dateStr = format(checkDate, 'yyyy-MM-dd')
          const hasCompletion = completions.some(
            c => c.habitId === habitId && c.date === dateStr
          )

          if (hasCompletion) {
            streak++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (dateStr === today) {
            // Today is not yet marked, continue checking
            checkDate.setDate(checkDate.getDate() - 1)
          } else {
            break
          }
        }
        return streak
      },
    }),
    {
      name: 'paretflow-habits',
    }
  )
)
