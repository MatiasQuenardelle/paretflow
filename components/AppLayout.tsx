'use client'

import { Navigation } from './Navigation'
import { TopHeader } from './TopHeader'
import { useTaskSync } from '@/stores/taskStore'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  // Initialize sync with Supabase
  const { isSyncing } = useTaskSync()

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Navigation />
      <div className="flex-1 flex flex-col">
        <TopHeader isSyncing={isSyncing} />
        <main className="flex-1 pb-20 md:pb-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
