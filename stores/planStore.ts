import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { generateId } from '@/lib/utils'
import { planService } from '@/lib/supabase/planService'
import { useTaskStore } from './taskStore'

// ─── Data Model ───────────────────────────────────────────────

export interface PlanItem {
  id: string
  text: string
  completed: boolean
  order: number
  generatedTaskId?: string
}

export interface Milestone {
  id: string
  title: string
  description?: string
  completed: boolean
  items: PlanItem[]
  targetDate?: string
  order: number
}

export interface Phase {
  id: string
  name: string
  description?: string
  color: string
  startMonth?: number
  endMonth?: number
  milestones: Milestone[]
  order: number
}

export interface ContentPillar {
  id: string
  name: string
  percentage: number
  color: string
  description?: string
}

export interface PlatformChannel {
  id: string
  name: string
  hoursPerWeek: number
  color: string
  notes?: string
}

export interface WeeklyBlock {
  id: string
  title: string
  startTime?: string
  endTime?: string
  color?: string
  order: number
}

export interface WeeklyDayTemplate {
  dayOfWeek: number
  blocks: WeeklyBlock[]
}

export interface BrandNode {
  id: string
  name: string
  description?: string
  color?: string
  children: BrandNode[]
}

export interface Plan {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
  startDate?: string
  brandTree: BrandNode | null
  platforms: PlatformChannel[]
  contentPillars: ContentPillar[]
  weeklyTemplate: WeeklyDayTemplate[]
  phases: Phase[]
  quickStart: PlanItem[]
}

export type PlanSection = 'overview' | 'phases' | 'weekly' | 'platforms' | 'pillars' | 'quickstart'

// ─── Default Plan Data ────────────────────────────────────────

export const DEFAULT_PLAN: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'> = {
  title: 'ParetoCoder',
  description: 'Coding education ecosystem — tutorials, tools & community',
  startDate: new Date().toISOString().split('T')[0],
  brandTree: {
    id: 'root',
    name: 'ParetoCoder',
    description: 'Coding education ecosystem',
    color: 'blue',
    children: [
      {
        id: 'paretoflow',
        name: 'ParetoFlow',
        description: 'Productivity app for developers',
        color: 'purple',
        children: [],
      },
      {
        id: 'paretobot',
        name: 'ParetoBot',
        description: 'AI coding assistant',
        color: 'green',
        children: [],
      },
      {
        id: 'website',
        name: 'matiasquenardelle.com',
        description: 'Personal brand & blog',
        color: 'orange',
        children: [],
      },
      {
        id: 'fitness',
        name: 'Fitness App',
        description: 'Health & fitness tracker',
        color: 'rose',
        children: [],
      },
    ],
  },
  platforms: [
    { id: 'youtube', name: 'YouTube', hoursPerWeek: 15, color: 'red', notes: 'Long-form tutorials + shorts' },
    { id: 'tiktok', name: 'TikTok / Shorts', hoursPerWeek: 5, color: 'pink', notes: 'Repurposed short clips' },
    { id: 'twitter', name: 'Twitter / X', hoursPerWeek: 3, color: 'sky', notes: 'Threads + engagement' },
    { id: 'telegram', name: 'Telegram', hoursPerWeek: 2, color: 'blue', notes: 'Community channel' },
    { id: 'dev', name: 'Development', hoursPerWeek: 5, color: 'green', notes: 'Product building' },
  ],
  contentPillars: [
    { id: 'tutorials', name: 'Tutorials', percentage: 40, color: 'blue', description: 'Step-by-step coding guides' },
    { id: 'building', name: 'Building in Public', percentage: 30, color: 'green', description: 'Sharing the journey transparently' },
    { id: 'tools', name: 'Tools & Reviews', percentage: 20, color: 'purple', description: 'Dev tools, setups, and productivity' },
    { id: 'opinion', name: 'Opinion & Trends', percentage: 10, color: 'orange', description: 'Hot takes on tech and industry' },
  ],
  weeklyTemplate: [
    {
      dayOfWeek: 1, // Monday
      blocks: [
        { id: 'mon-1', title: 'Plan & outline week', startTime: '09:00', endTime: '10:00', color: 'blue', order: 0 },
        { id: 'mon-2', title: 'Write script / article', startTime: '10:00', endTime: '13:00', color: 'purple', order: 1 },
      ],
    },
    {
      dayOfWeek: 2, // Tuesday
      blocks: [
        { id: 'tue-1', title: 'Record video #1', startTime: '09:00', endTime: '12:00', color: 'red', order: 0 },
        { id: 'tue-2', title: 'Twitter engagement', startTime: '14:00', endTime: '15:00', color: 'sky', order: 1 },
      ],
    },
    {
      dayOfWeek: 3, // Wednesday
      blocks: [
        { id: 'wed-1', title: 'Edit video #1', startTime: '09:00', endTime: '12:00', color: 'orange', order: 0 },
        { id: 'wed-2', title: 'Create shorts / clips', startTime: '13:00', endTime: '15:00', color: 'pink', order: 1 },
      ],
    },
    {
      dayOfWeek: 4, // Thursday
      blocks: [
        { id: 'thu-1', title: 'Record video #2', startTime: '09:00', endTime: '12:00', color: 'red', order: 0 },
        { id: 'thu-2', title: 'Telegram community', startTime: '14:00', endTime: '15:00', color: 'blue', order: 1 },
      ],
    },
    {
      dayOfWeek: 5, // Friday
      blocks: [
        { id: 'fri-1', title: 'Edit video #2', startTime: '09:00', endTime: '12:00', color: 'orange', order: 0 },
        { id: 'fri-2', title: 'Create shorts / clips', startTime: '13:00', endTime: '15:00', color: 'pink', order: 1 },
      ],
    },
    {
      dayOfWeek: 6, // Saturday
      blocks: [
        { id: 'sat-1', title: 'Publish & schedule', startTime: '10:00', endTime: '12:00', color: 'green', order: 0 },
        { id: 'sat-2', title: 'Product development', startTime: '13:00', endTime: '17:00', color: 'purple', order: 1 },
      ],
    },
    {
      dayOfWeek: 0, // Sunday
      blocks: [
        { id: 'sun-1', title: 'Rest & review', startTime: '11:00', endTime: '12:00', color: 'gray', order: 0 },
      ],
    },
  ],
  phases: [
    {
      id: 'foundation',
      name: 'Foundation',
      description: 'Set up channels, brand identity, and first pieces of content',
      color: 'blue',
      startMonth: 1,
      endMonth: 2,
      order: 0,
      milestones: [
        {
          id: 'ms-f1', title: 'Channel setup complete', completed: false, order: 0,
          items: [
            { id: 'f1-1', text: 'Create YouTube channel with branding', completed: false, order: 0 },
            { id: 'f1-2', text: 'Set up TikTok profile', completed: false, order: 1 },
            { id: 'f1-3', text: 'Create Twitter/X account', completed: false, order: 2 },
            { id: 'f1-4', text: 'Set up Telegram channel', completed: false, order: 3 },
          ],
        },
        {
          id: 'ms-f2', title: 'First 10 videos published', completed: false, order: 1,
          items: [
            { id: 'f2-1', text: 'Script and record first tutorial', completed: false, order: 0 },
            { id: 'f2-2', text: 'Build consistent thumbnail style', completed: false, order: 1 },
            { id: 'f2-3', text: 'Publish on a regular schedule', completed: false, order: 2 },
          ],
        },
        {
          id: 'ms-f3', title: 'Brand identity finalized', completed: false, order: 2,
          items: [
            { id: 'f3-1', text: 'Logo and color palette ready', completed: false, order: 0 },
            { id: 'f3-2', text: 'Intro/outro template created', completed: false, order: 1 },
          ],
        },
      ],
    },
    {
      id: 'first-product',
      name: 'First Product',
      description: 'Launch first digital product and grow audience to 1K',
      color: 'green',
      startMonth: 3,
      endMonth: 4,
      order: 1,
      milestones: [
        {
          id: 'ms-p1', title: 'Reach 1,000 subscribers', completed: false, order: 0,
          items: [
            { id: 'p1-1', text: 'Optimize titles and thumbnails for CTR', completed: false, order: 0 },
            { id: 'p1-2', text: 'Collaborate with other creators', completed: false, order: 1 },
          ],
        },
        {
          id: 'ms-p2', title: 'Launch first paid product', completed: false, order: 1,
          items: [
            { id: 'p2-1', text: 'Build landing page', completed: false, order: 0 },
            { id: 'p2-2', text: 'Create product content', completed: false, order: 1 },
            { id: 'p2-3', text: 'Set up payment and delivery', completed: false, order: 2 },
          ],
        },
      ],
    },
    {
      id: 'scale',
      name: 'Scale',
      description: 'Scale content production and reach 10K audience',
      color: 'purple',
      startMonth: 5,
      endMonth: 8,
      order: 2,
      milestones: [
        {
          id: 'ms-s1', title: 'Consistent 2 videos/week', completed: false, order: 0,
          items: [
            { id: 's1-1', text: 'Batch recording workflow', completed: false, order: 0 },
            { id: 's1-2', text: 'Editing templates ready', completed: false, order: 1 },
          ],
        },
        {
          id: 'ms-s2', title: 'Reach 10K across platforms', completed: false, order: 1,
          items: [
            { id: 's2-1', text: 'Cross-promote on all platforms', completed: false, order: 0 },
            { id: 's2-2', text: 'Analyze top-performing content', completed: false, order: 1 },
          ],
        },
        {
          id: 'ms-s3', title: 'Launch ParetoFlow publicly', completed: false, order: 2,
          items: [
            { id: 's3-1', text: 'Beta testing with community', completed: false, order: 0 },
            { id: 's3-2', text: 'Product Hunt launch', completed: false, order: 1 },
          ],
        },
      ],
    },
    {
      id: 'community',
      name: 'Community',
      description: 'Build engaged community and launch membership',
      color: 'orange',
      startMonth: 9,
      endMonth: 12,
      order: 3,
      milestones: [
        {
          id: 'ms-c1', title: 'Launch membership / paid community', completed: false, order: 0,
          items: [
            { id: 'c1-1', text: 'Define membership tiers and perks', completed: false, order: 0 },
            { id: 'c1-2', text: 'Set up Discord or community platform', completed: false, order: 1 },
          ],
        },
        {
          id: 'ms-c2', title: 'First 100 paying members', completed: false, order: 1,
          items: [
            { id: 'c2-1', text: 'Create exclusive content', completed: false, order: 0 },
            { id: 'c2-2', text: 'Host live coding sessions', completed: false, order: 1 },
          ],
        },
      ],
    },
  ],
  quickStart: [
    { id: 'qs-1', text: 'Set up YouTube channel with profile and banner', completed: false, order: 0 },
    { id: 'qs-2', text: 'Script your first tutorial video', completed: false, order: 1 },
    { id: 'qs-3', text: 'Record and edit first video', completed: false, order: 2 },
    { id: 'qs-4', text: 'Create accounts on TikTok, Twitter/X, Telegram', completed: false, order: 3 },
    { id: 'qs-5', text: 'Publish first video and share on all platforms', completed: false, order: 4 },
    { id: 'qs-6', text: 'Engage with 10 creators in your niche', completed: false, order: 5 },
    { id: 'qs-7', text: 'Plan next week\'s content calendar', completed: false, order: 6 },
  ],
}

// ─── Store Types ──────────────────────────────────────────────

type Mode = 'loading' | 'cloud' | 'guest'

interface PlanState {
  plan: Plan | null
  activeSection: PlanSection
  selectedPhaseId: string | null

  mode: Mode
  isLoading: boolean
  isSaving: boolean
  error: string | null

  // Initialization
  initializeCloud: () => Promise<void>
  initializeGuest: () => void
  refreshFromCloud: () => Promise<void>
  _saveToCloud: (plan: Plan) => Promise<void>

  // Plan CRUD
  createPlan: (title: string, description?: string) => Promise<void>
  updatePlan: (updates: Partial<Pick<Plan, 'title' | 'description' | 'startDate'>>) => Promise<void>
  deletePlan: () => Promise<void>

  // Sections
  setActiveSection: (section: PlanSection) => void
  setSelectedPhaseId: (id: string | null) => void

  // Phases
  addPhase: (name: string) => Promise<void>
  updatePhase: (phaseId: string, updates: Partial<Pick<Phase, 'name' | 'description' | 'color' | 'startMonth' | 'endMonth'>>) => Promise<void>
  deletePhase: (phaseId: string) => Promise<void>

  // Milestones
  addMilestone: (phaseId: string, title: string) => Promise<void>
  toggleMilestone: (phaseId: string, milestoneId: string) => Promise<void>
  deleteMilestone: (phaseId: string, milestoneId: string) => Promise<void>

  // Plan items (milestone items + quick start)
  addPlanItem: (phaseId: string, milestoneId: string, text: string) => Promise<void>
  togglePlanItem: (phaseId: string, milestoneId: string, itemId: string) => Promise<void>
  deletePlanItem: (phaseId: string, milestoneId: string, itemId: string) => Promise<void>

  // Quick start items
  addQuickStartItem: (text: string) => Promise<void>
  toggleQuickStartItem: (itemId: string) => Promise<void>
  deleteQuickStartItem: (itemId: string) => Promise<void>

  // Weekly template
  addWeeklyBlock: (dayOfWeek: number, title: string) => Promise<void>
  updateWeeklyBlock: (dayOfWeek: number, blockId: string, updates: Partial<Pick<WeeklyBlock, 'title' | 'startTime' | 'endTime' | 'color'>>) => Promise<void>
  deleteWeeklyBlock: (dayOfWeek: number, blockId: string) => Promise<void>

  // Platforms
  addPlatform: (name: string, hoursPerWeek: number) => Promise<void>
  updatePlatform: (platformId: string, updates: Partial<Pick<PlatformChannel, 'name' | 'hoursPerWeek' | 'color' | 'notes'>>) => Promise<void>
  deletePlatform: (platformId: string) => Promise<void>

  // Content pillars
  addPillar: (name: string, percentage: number) => Promise<void>
  updatePillar: (pillarId: string, updates: Partial<Pick<ContentPillar, 'name' | 'percentage' | 'color' | 'description'>>) => Promise<void>
  deletePillar: (pillarId: string) => Promise<void>

  // Brand tree
  updateBrandTree: (tree: BrandNode) => Promise<void>

  // Task integration
  pushItemToTasks: (text: string, itemId: string, phaseId?: string, milestoneId?: string) => Promise<void>
  generateWeekTasks: () => Promise<number>

  clearError: () => void
}

// ─── Guest-only storage ───────────────────────────────────────

const guestOnlyStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    const stored = localStorage.getItem(name)
    if (!stored) return null
    try {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.mode !== 'guest') {
        localStorage.removeItem(name)
        return null
      }
      return stored
    } catch {
      return null
    }
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    const state = JSON.parse(value)
    if (state?.state?.mode === 'guest') {
      localStorage.setItem(name, value)
    } else {
      localStorage.removeItem(name)
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(name)
  },
}

// ─── Helper to stamp updatedAt ────────────────────────────────

function stampPlan(plan: Plan): Plan {
  return { ...plan, updatedAt: new Date().toISOString() }
}

// ─── Store ────────────────────────────────────────────────────

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
      plan: null,
      activeSection: 'overview' as PlanSection,
      selectedPhaseId: null,

      mode: 'loading' as Mode,
      isLoading: false,
      isSaving: false,
      error: null,

      // ─── Initialization ─────────────────────────────────

      initializeCloud: async () => {
        set({ mode: 'loading', isLoading: true, error: null })
        try {
          let localGuestPlan: Plan | null = null
          try {
            const storedData = localStorage.getItem('paretflow-plans-guest')
            if (storedData) {
              const parsed = JSON.parse(storedData)
              if (parsed?.state?.mode === 'guest' && parsed?.state?.plan) {
                localGuestPlan = parsed.state.plan
              }
            }
          } catch { /* ignore */ }

          localStorage.removeItem('paretflow-plans-guest')

          const cloudPlan = await planService.fetchPlan()

          if (cloudPlan) {
            set({ plan: cloudPlan, mode: 'cloud', isLoading: false })
          } else if (localGuestPlan) {
            await planService.savePlan(localGuestPlan)
            set({ plan: localGuestPlan, mode: 'cloud', isLoading: false })
          } else {
            set({ plan: null, mode: 'cloud', isLoading: false })
          }
        } catch (error) {
          console.error('[PlanStore] Cloud initialization failed:', error)
          set({
            mode: 'cloud',
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load plan',
          })
        }
      },

      initializeGuest: () => {
        set({ mode: 'guest', isLoading: false, error: null })
      },

      refreshFromCloud: async () => {
        const { mode, isSaving } = get()
        if (mode !== 'cloud' || isSaving) return
        try {
          const cloudPlan = await planService.fetchPlan()
          set({ plan: cloudPlan, error: null })
        } catch (error) {
          console.error('[PlanStore] Refresh failed:', error)
        }
      },

      _saveToCloud: async (plan: Plan) => {
        const { mode } = get()
        if (mode !== 'cloud') return
        set({ isSaving: true })
        try {
          await planService.savePlan(plan)
          set({ isSaving: false, error: null })
        } catch (error) {
          console.error('[PlanStore] Save failed:', error)
          set({
            isSaving: false,
            error: error instanceof Error ? error.message : 'Failed to save',
          })
          throw error
        }
      },

      // ─── Plan CRUD ──────────────────────────────────────

      createPlan: async (title, description) => {
        const { mode, _saveToCloud } = get()
        const now = new Date().toISOString()
        const newPlan: Plan = {
          id: generateId(),
          title: title || 'My Plan',
          description: description || '',
          createdAt: now,
          updatedAt: now,
          startDate: new Date().toISOString().split('T')[0],
          brandTree: null,
          platforms: [],
          contentPillars: [],
          weeklyTemplate: [],
          phases: [],
          quickStart: [],
        }
        set({ plan: newPlan })
        if (mode === 'cloud') {
          try { await _saveToCloud(newPlan) } catch { set({ plan: null }) }
        }
      },

      updatePlan: async (updates) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({ ...plan, ...updates })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deletePlan: async () => {
        const { mode, plan } = get()
        const prev = plan
        set({ plan: null, selectedPhaseId: null })
        if (mode === 'cloud') {
          try {
            await planService.deletePlan()
          } catch {
            set({ plan: prev })
          }
        }
      },

      // ─── Section navigation ─────────────────────────────

      setActiveSection: (section) => set({ activeSection: section }),
      setSelectedPhaseId: (id) => set({ selectedPhaseId: id }),

      // ─── Phases ─────────────────────────────────────────

      addPhase: async (name) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newPhase: Phase = {
          id: generateId(),
          name,
          color: 'blue',
          milestones: [],
          order: plan.phases.length,
        }
        const updated = stampPlan({ ...plan, phases: [...plan.phases, newPhase] })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      updatePhase: async (phaseId, updates) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => p.id === phaseId ? { ...p, ...updates } : p),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deletePhase: async (phaseId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.filter(p => p.id !== phaseId).map((p, i) => ({ ...p, order: i })),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Milestones ─────────────────────────────────────

      addMilestone: async (phaseId, title) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newMs: Milestone = {
          id: generateId(),
          title,
          completed: false,
          items: [],
          order: 0,
        }
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            const ms = [...p.milestones, { ...newMs, order: p.milestones.length }]
            return { ...p, milestones: ms }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      toggleMilestone: async (phaseId, milestoneId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            return {
              ...p,
              milestones: p.milestones.map(m =>
                m.id === milestoneId ? { ...m, completed: !m.completed } : m
              ),
            }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deleteMilestone: async (phaseId, milestoneId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            return {
              ...p,
              milestones: p.milestones.filter(m => m.id !== milestoneId).map((m, i) => ({ ...m, order: i })),
            }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Plan items (milestone sub-items) ───────────────

      addPlanItem: async (phaseId, milestoneId, text) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            return {
              ...p,
              milestones: p.milestones.map(m => {
                if (m.id !== milestoneId) return m
                const newItem: PlanItem = { id: generateId(), text, completed: false, order: m.items.length }
                return { ...m, items: [...m.items, newItem] }
              }),
            }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      togglePlanItem: async (phaseId, milestoneId, itemId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            return {
              ...p,
              milestones: p.milestones.map(m => {
                if (m.id !== milestoneId) return m
                return {
                  ...m,
                  items: m.items.map(it => it.id === itemId ? { ...it, completed: !it.completed } : it),
                }
              }),
            }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deletePlanItem: async (phaseId, milestoneId, itemId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          phases: plan.phases.map(p => {
            if (p.id !== phaseId) return p
            return {
              ...p,
              milestones: p.milestones.map(m => {
                if (m.id !== milestoneId) return m
                return {
                  ...m,
                  items: m.items.filter(it => it.id !== itemId).map((it, i) => ({ ...it, order: i })),
                }
              }),
            }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Quick start items ──────────────────────────────

      addQuickStartItem: async (text) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newItem: PlanItem = { id: generateId(), text, completed: false, order: plan.quickStart.length }
        const updated = stampPlan({ ...plan, quickStart: [...plan.quickStart, newItem] })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      toggleQuickStartItem: async (itemId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          quickStart: plan.quickStart.map(it => it.id === itemId ? { ...it, completed: !it.completed } : it),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deleteQuickStartItem: async (itemId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          quickStart: plan.quickStart.filter(it => it.id !== itemId).map((it, i) => ({ ...it, order: i })),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Weekly template ────────────────────────────────

      addWeeklyBlock: async (dayOfWeek, title) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newBlock: WeeklyBlock = { id: generateId(), title, order: 0, color: 'blue' }
        const dayExists = plan.weeklyTemplate.find(d => d.dayOfWeek === dayOfWeek)
        let newTemplate: WeeklyDayTemplate[]
        if (dayExists) {
          newTemplate = plan.weeklyTemplate.map(d => {
            if (d.dayOfWeek !== dayOfWeek) return d
            const blocks = [...d.blocks, { ...newBlock, order: d.blocks.length }]
            return { ...d, blocks }
          })
        } else {
          newTemplate = [...plan.weeklyTemplate, { dayOfWeek, blocks: [newBlock] }]
        }
        const updated = stampPlan({ ...plan, weeklyTemplate: newTemplate })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      updateWeeklyBlock: async (dayOfWeek, blockId, updates) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          weeklyTemplate: plan.weeklyTemplate.map(d => {
            if (d.dayOfWeek !== dayOfWeek) return d
            return { ...d, blocks: d.blocks.map(b => b.id === blockId ? { ...b, ...updates } : b) }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deleteWeeklyBlock: async (dayOfWeek, blockId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          weeklyTemplate: plan.weeklyTemplate.map(d => {
            if (d.dayOfWeek !== dayOfWeek) return d
            return { ...d, blocks: d.blocks.filter(b => b.id !== blockId).map((b, i) => ({ ...b, order: i })) }
          }),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Platforms ──────────────────────────────────────

      addPlatform: async (name, hoursPerWeek) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newP: PlatformChannel = { id: generateId(), name, hoursPerWeek, color: 'blue' }
        const updated = stampPlan({ ...plan, platforms: [...plan.platforms, newP] })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      updatePlatform: async (platformId, updates) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          platforms: plan.platforms.map(p => p.id === platformId ? { ...p, ...updates } : p),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deletePlatform: async (platformId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          platforms: plan.platforms.filter(p => p.id !== platformId),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Content pillars ────────────────────────────────

      addPillar: async (name, percentage) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const newP: ContentPillar = { id: generateId(), name, percentage, color: 'blue' }
        const updated = stampPlan({ ...plan, contentPillars: [...plan.contentPillars, newP] })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      updatePillar: async (pillarId, updates) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          contentPillars: plan.contentPillars.map(p => p.id === pillarId ? { ...p, ...updates } : p),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      deletePillar: async (pillarId) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({
          ...plan,
          contentPillars: plan.contentPillars.filter(p => p.id !== pillarId),
        })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Brand tree ─────────────────────────────────────

      updateBrandTree: async (tree) => {
        const { mode, plan, _saveToCloud } = get()
        if (!plan) return
        const updated = stampPlan({ ...plan, brandTree: tree })
        set({ plan: updated })
        if (mode === 'cloud') {
          try { await _saveToCloud(updated) } catch { set({ plan }) }
        }
      },

      // ─── Task integration ───────────────────────────────

      pushItemToTasks: async (text, itemId, phaseId, milestoneId) => {
        const { plan } = get()
        if (!plan) return
        const today = new Date().toISOString().split('T')[0]
        await useTaskStore.getState().addTask(text, today)

        // Mark the item's generatedTaskId (best effort)
        const taskStore = useTaskStore.getState()
        const newTask = taskStore.tasks[0] // just added at front
        if (!newTask) return

        if (phaseId && milestoneId) {
          // Milestone item
          const { mode, _saveToCloud } = get()
          const updated = stampPlan({
            ...plan,
            phases: plan.phases.map(p => {
              if (p.id !== phaseId) return p
              return {
                ...p,
                milestones: p.milestones.map(m => {
                  if (m.id !== milestoneId) return m
                  return {
                    ...m,
                    items: m.items.map(it => it.id === itemId ? { ...it, generatedTaskId: newTask.id } : it),
                  }
                }),
              }
            }),
          })
          set({ plan: updated })
          if (mode === 'cloud') {
            try { await _saveToCloud(updated) } catch { set({ plan }) }
          }
        } else {
          // Quick start item
          const { mode, _saveToCloud } = get()
          const updated = stampPlan({
            ...plan,
            quickStart: plan.quickStart.map(it => it.id === itemId ? { ...it, generatedTaskId: newTask.id } : it),
          })
          set({ plan: updated })
          if (mode === 'cloud') {
            try { await _saveToCloud(updated) } catch { set({ plan }) }
          }
        }
      },

      generateWeekTasks: async () => {
        const { plan } = get()
        if (!plan) return 0

        const today = new Date()
        const dayOfWeek = today.getDay() // 0=Sun
        // Calculate Monday of this week
        const monday = new Date(today)
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

        let count = 0
        for (const day of plan.weeklyTemplate) {
          // Calculate actual date for this day
          const offset = (day.dayOfWeek + 6) % 7 // Mon=0...Sun=6
          const date = new Date(monday)
          date.setDate(monday.getDate() + offset)
          const dateStr = date.toISOString().split('T')[0]

          for (const block of day.blocks) {
            // Don't create duplicates
            const existingTasks = useTaskStore.getState().tasks
            const alreadyExists = existingTasks.some(
              t => t.title === block.title && t.scheduledDate === dateStr
            )
            if (!alreadyExists) {
              await useTaskStore.getState().addTask(block.title, dateStr)
              count++
            }
          }
        }
        return count
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'paretflow-plans-guest',
      storage: createJSONStorage(() => guestOnlyStorage),
      partialize: (state) => ({
        plan: state.plan,
        activeSection: state.activeSection,
        selectedPhaseId: state.selectedPhaseId,
        mode: state.mode,
      }),
    }
  )
)
