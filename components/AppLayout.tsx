'use client'

import { useEffect } from 'react'
import { Navigation } from './Navigation'
import { TopHeader } from './TopHeader'
import { useTaskStore } from '@/stores/taskStore'
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/sync'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isSaving, initializeCloud, initializeGuest } = useTaskStore()

  // Initialize task store based on auth state
  useEffect(() => {
    const init = async () => {
      const user = await getCurrentUser()
      if (user) {
        await initializeCloud()
      } else {
        initializeGuest()
      }
    }
    init()

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange(async (user) => {
      if (user) {
        await initializeCloud()
      } else {
        initializeGuest()
      }
    })

    return () => subscription.unsubscribe()
  }, [initializeCloud, initializeGuest])

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Navigation />
      <div className="flex-1 flex flex-col">
        <TopHeader isSyncing={isSaving} />
        <main className="flex-1 pb-20 md:pb-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
