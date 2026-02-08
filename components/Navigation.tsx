'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeft, Settings, Cloud, CloudOff, Loader2 } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { AuthButton } from './AuthButton'
import { useUIStore } from '@/stores/uiStore'
import { useTaskStore } from '@/stores/taskStore'
import { useTranslations } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'

type NavKey = 'tasks' | 'habits' | 'plans' | 'calendar' | 'progress' | 'timer'

const navItemsConfig: { href: string; key: NavKey; icon: (active: boolean) => React.ReactNode }[] = [
  {
    href: '/',
    key: 'tasks',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0} />
        <path d="M14 5h7M14 9h5M14 16h7M14 20h5" stroke="currentColor" strokeLinecap="round" />
      </svg>
    )
  },
  {
    href: '/habits',
    key: 'habits',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <path d="M12 2L14.5 9H22L16 13.5L18.5 21L12 16.5L5.5 21L8 13.5L2 9H9.5L12 2Z" stroke="currentColor" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.2 : 0} strokeLinejoin="round" />
      </svg>
    )
  },
  {
    href: '/plans',
    key: 'plans',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <path d="M3 6h18M3 12h18M3 18h12" stroke="currentColor" strokeLinecap="round" />
        <circle cx="7" cy="6" r="1.5" fill={active ? "currentColor" : "none"} stroke="currentColor" />
        <circle cx="7" cy="12" r="1.5" fill={active ? "currentColor" : "none"} stroke="currentColor" />
        <circle cx="7" cy="18" r="1.5" fill={active ? "currentColor" : "none"} stroke="currentColor" />
        {active && <path d="M19 15l2 2-2 2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeOpacity={0.5} />}
      </svg>
    )
  },
  {
    href: '/calendar',
    key: 'calendar',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
        <path d="M3 9h18" stroke="currentColor" />
        <path d="M8 2v4M16 2v4" stroke="currentColor" strokeLinecap="round" />
        <circle cx="12" cy="15" r="2" fill="currentColor" opacity={active ? 1 : 0.6} />
      </svg>
    )
  },
  {
    href: '/progress',
    key: 'progress',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <path d="M3 20V12" stroke="currentColor" strokeLinecap="round" />
        <path d="M9 20V8" stroke="currentColor" strokeLinecap="round" />
        <path d="M15 20V14" stroke="currentColor" strokeLinecap="round" />
        <path d="M21 20V4" stroke="currentColor" strokeLinecap="round" />
        {active && (
          <path d="M3 12L9 8L15 14L21 4" stroke="currentColor" strokeOpacity={0.4} strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    )
  },
  {
    href: '/timer',
    key: 'timer',
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" strokeWidth={active ? 2 : 1.5}>
        <circle cx="12" cy="13" r="8" stroke="currentColor" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} />
        <path d="M12 9v4l2.5 2.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 2h4" stroke="currentColor" strokeLinecap="round" />
        <path d="M12 2v2" stroke="currentColor" strokeLinecap="round" />
        {active && (
          <>
            <circle cx="12" cy="13" r="10" stroke="currentColor" strokeOpacity={0.3} strokeWidth={1} />
          </>
        )}
      </svg>
    )
  },
]

function SyncStatusButton({ collapsed }: { collapsed: boolean }) {
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isForceSyncing, setIsForceSyncing] = useState(false)
  const { mode, tasks, error, isSaving, refreshFromCloud } = useTaskStore()
  const t = useTranslations()

  const handleShowDebug = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error: fetchError } = user ? await supabase
      .from('tasks')
      .select('data, updated_at')
      .eq('user_id', user.id)
      .single() : { data: null, error: null }

    const cloudTasksData = data?.data as any[] | undefined

    setDebugInfo({
      mode,
      userId: user?.id?.slice(0, 8) || 'none',
      email: user?.email || 'none',
      cloudTasks: cloudTasksData?.length ?? (fetchError?.code === 'PGRST116' ? 0 : 'error: ' + fetchError?.message),
      cloudTaskNames: cloudTasksData?.map((t: any) => `${t.title} (${t.steps?.length || 0} steps)`).slice(0, 5) || [],
      localTasks: tasks.length,
      localTaskNames: tasks.map(t => `${t.title} (${t.steps?.length || 0} steps)`).slice(0, 5),
      cloudUpdatedAt: data?.updated_at ? new Date(data.updated_at).toLocaleString() : 'none',
      isSaving,
      error: error || 'none',
    })
    setShowDebug(true)
  }

  const handleForceSync = async () => {
    if (mode !== 'cloud' || isForceSyncing) return
    setIsForceSyncing(true)
    try {
      await refreshFromCloud()
      await handleShowDebug()
    } catch (e) {
      console.error('Force sync failed:', e)
    } finally {
      setIsForceSyncing(false)
    }
  }

  return (
    <>
      <button
        onClick={handleShowDebug}
        title={collapsed ? 'Sync Status' : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-muted hover:text-foreground hover:bg-white/5 active:scale-[0.98] ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        <div className="transition-all duration-200 group-hover:text-blue-400">
          {isSaving ? (
            <Loader2 size={20} className="animate-spin text-blue-500" />
          ) : mode === 'cloud' ? (
            <Cloud size={20} className="text-green-500" />
          ) : mode === 'guest' ? (
            <CloudOff size={20} className="text-orange-500" />
          ) : (
            <Loader2 size={20} className="animate-spin" />
          )}
        </div>
        {!collapsed && (
          <span className="text-sm font-medium">
            {isSaving ? 'Syncing...' : mode === 'cloud' ? 'Synced' : mode === 'guest' ? 'Guest' : 'Loading...'}
          </span>
        )}
      </button>

      {/* Debug Modal */}
      {showDebug && (
        <div
          className="fixed inset-0 z-[100] bg-black/80 p-4 flex items-center justify-center"
          onClick={() => setShowDebug(false)}
        >
          <div
            className="bg-gray-900 p-4 rounded-lg max-w-md w-full text-white text-sm font-mono max-h-[80vh] overflow-auto"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold mb-3">Sync Debug</h3>
            {debugInfo ? (
              <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(debugInfo, null, 2)}</pre>
            ) : (
              <p>Loading...</p>
            )}
            <div className="flex flex-col gap-2 mt-4">
              <button
                className="w-full px-3 py-2 bg-green-600 rounded text-sm disabled:opacity-50"
                onClick={handleForceSync}
                disabled={isForceSyncing || mode !== 'cloud'}
              >
                {isForceSyncing ? 'Syncing...' : 'Force Sync from Cloud'}
              </button>
              <div className="flex gap-2">
                <button
                  className="flex-1 px-3 py-2 bg-blue-600 rounded text-sm"
                  onClick={() => window.location.reload()}
                >
                  Hard Refresh
                </button>
                <button
                  className="flex-1 px-3 py-2 bg-gray-700 rounded text-sm"
                  onClick={() => setShowDebug(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export function Navigation() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const t = useTranslations()

  return (
    <>
      {/* Mobile Bottom Navigation - Floating Pill Design */}
      <nav className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <div className="relative">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-2xl blur-xl" />

          {/* Main container */}
          <div className="relative bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/50">
            <div className="flex items-center justify-around px-2 py-2">
              {navItemsConfig.map(({ href, key, icon }) => {
                const isActive = pathname === href
                const label = t.nav[key]
                return (
                  <Link
                    key={href}
                    href={href}
                    className="relative group"
                  >
                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-500 to-blue-600 rounded-xl blur-md opacity-50 scale-110" />
                    )}

                    {/* Button content */}
                    <div className={`relative flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                        : 'text-muted hover:text-foreground hover:bg-white/5 active:scale-95'
                    }`}>
                      <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                        {icon(isActive)}
                      </div>
                      <span className={`text-[10px] font-medium tracking-wide transition-all duration-300 ${
                        isActive ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
                      }`}>
                        {label}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className={`hidden md:block fixed left-0 top-0 h-screen bg-surface/50 backdrop-blur-xl border-r border-white/10 dark:border-white/5 z-50 transition-all duration-300 ${
        sidebarCollapsed ? 'w-20' : 'w-72'
      }`}>
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className={`flex items-center mb-8 ${sidebarCollapsed ? 'justify-center' : 'justify-between'} py-4`}>
            {!sidebarCollapsed && (
              <div className="px-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                  {t.app.name}
                </h1>
                <p className="text-xs text-muted mt-0.5 tracking-wide">{t.app.tagline}</p>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl text-muted hover:text-foreground hover:bg-white/5 transition-all duration-200 active:scale-95"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
            </button>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col gap-1">
            {navItemsConfig.map(({ href, key, icon }) => {
              const isActive = pathname === href
              const label = t.nav[key]
              return (
                <Link
                  key={href}
                  href={href}
                  title={sidebarCollapsed ? label : undefined}
                  className="relative group"
                >
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
                  )}

                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    sidebarCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground'
                      : 'text-muted hover:text-foreground hover:bg-white/5 active:scale-[0.98]'
                  }`}>
                    <div className={`transition-all duration-200 ${isActive ? 'text-blue-500' : 'group-hover:text-blue-400'}`}>
                      {icon(isActive)}
                    </div>
                    {!sidebarCollapsed && (
                      <span className={`text-sm font-medium transition-all duration-200 ${
                        isActive ? 'text-foreground' : ''
                      }`}>
                        {label}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Footer */}
          <div className={`mt-auto pt-4 border-t border-white/5 flex flex-col gap-2 ${sidebarCollapsed ? 'items-center' : ''}`}>
            <SyncStatusButton collapsed={sidebarCollapsed} />
            <AuthButton />
            {/* Settings Button */}
            <Link
              href="/settings"
              title={sidebarCollapsed ? t.nav.settings : undefined}
              className="relative group"
            >
              {pathname === '/settings' && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-r-full" />
              )}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                sidebarCollapsed ? 'justify-center' : ''
              } ${
                pathname === '/settings'
                  ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground'
                  : 'text-muted hover:text-foreground hover:bg-white/5 active:scale-[0.98]'
              }`}>
                <div className={`transition-all duration-200 ${pathname === '/settings' ? 'text-blue-500' : 'group-hover:text-blue-400'}`}>
                  <Settings size={20} />
                </div>
                {!sidebarCollapsed && (
                  <span className={`text-sm font-medium transition-all duration-200 ${
                    pathname === '/settings' ? 'text-foreground' : ''
                  }`}>
                    {t.nav.settings}
                  </span>
                )}
              </div>
            </Link>
            <ThemeToggle collapsed={sidebarCollapsed} />
          </div>
        </div>
      </nav>
    </>
  )
}
