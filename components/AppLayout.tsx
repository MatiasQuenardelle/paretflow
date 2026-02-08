'use client'

import { useEffect } from 'react'
import { Navigation } from './Navigation'
import { TopHeader } from './TopHeader'
import { useTaskStore } from '@/stores/taskStore'
import { usePlanStore } from '@/stores/planStore'
import { useUIStore } from '@/stores/uiStore'
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/sync'
import { I18nProvider } from '@/lib/i18n'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isSaving, initializeCloud, initializeGuest, refreshFromCloud, mode } = useTaskStore()
  const {
    initializeCloud: initializePlanCloud,
    initializeGuest: initializePlanGuest,
    refreshFromCloud: refreshPlanFromCloud,
    mode: planMode,
  } = usePlanStore()
  const { sidebarCollapsed } = useUIStore()

  // Initialize task + plan stores based on auth state
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser()
      if (user) {
        await Promise.all([initializeCloud(), initializePlanCloud()])
      } else {
        initializeGuest()
        initializePlanGuest()
      }
    }
    init()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        await Promise.all([initializeCloud(), initializePlanCloud()])
      } else {
        initializeGuest()
        initializePlanGuest()
      }
    })

    return () => subscription.unsubscribe()
  }, [initializeCloud, initializeGuest, initializePlanCloud, initializePlanGuest])

  // Sync tasks + plans when returning to the app (visibility change or focus)
  useEffect(() => {
    const isCloud = mode === 'cloud' || planMode === 'cloud'
    if (!isCloud) return

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (mode === 'cloud') refreshFromCloud()
        if (planMode === 'cloud') refreshPlanFromCloud()
      }
    }

    const handleFocus = () => {
      if (mode === 'cloud') refreshFromCloud()
      if (planMode === 'cloud') refreshPlanFromCloud()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [mode, planMode, refreshFromCloud, refreshPlanFromCloud])

  return (
    <I18nProvider>
      <div className="min-h-screen">
        <Navigation />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-72'
        }`}>
          <TopHeader isSyncing={isSaving} />
          <main className="flex-1 pb-24 md:pb-0 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </I18nProvider>
  )
}
