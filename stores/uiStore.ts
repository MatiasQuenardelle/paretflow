import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  timerCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleTimer: () => void
  setTimerCollapsed: (collapsed: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      timerCollapsed: false,

      toggleSidebar: () => {
        set(state => ({ sidebarCollapsed: !state.sidebarCollapsed }))
      },

      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed })
      },

      toggleTimer: () => {
        set(state => ({ timerCollapsed: !state.timerCollapsed }))
      },

      setTimerCollapsed: (collapsed) => {
        set({ timerCollapsed: collapsed })
      },
    }),
    {
      name: 'paretflow-ui',
    }
  )
)
