'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut, LogIn, Loader2, Cloud, CloudOff, Settings } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'
import { useTaskStore } from '@/stores/taskStore'

interface TopHeaderProps {
  isSyncing?: boolean
}

export function TopHeader({ isSyncing = false }: TopHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showDebug, setShowDebug] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const supabase = createClient()
  const t = useTranslations()
  const { mode, tasks, error } = useTaskStore()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  const handleShowDebug = async () => {
    const { data, error: fetchError } = user ? await supabase
      .from('tasks')
      .select('data')
      .eq('user_id', user.id)
      .single() : { data: null, error: null }

    setDebugInfo({
      mode,
      userId: user?.id?.slice(0, 8) || 'none',
      email: user?.email || 'none',
      cloudTasks: data?.data?.length ?? (fetchError?.code === 'PGRST116' ? 0 : 'error: ' + fetchError?.message),
      localTasks: tasks.length,
      isSyncing,
      error: error || 'none',
    })
    setShowDebug(true)
  }

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/10 dark:border-white/5 px-3 py-1.5 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-foreground">{t.app.name}</h1>

        <div className="flex items-center gap-2">
          {/* Sync status - tap to show debug */}
          <button
            onClick={handleShowDebug}
            className="flex items-center gap-1 text-xs text-muted px-1.5 py-0.5 rounded"
            title="Tap for sync debug info"
          >
            {isSyncing ? (
              <Loader2 size={12} className="animate-spin text-blue-500" />
            ) : mode === 'cloud' ? (
              <Cloud size={12} className="text-green-500" />
            ) : mode === 'guest' ? (
              <CloudOff size={12} className="text-orange-500" />
            ) : (
              <Loader2 size={12} className="animate-spin text-muted" />
            )}
            <span className="text-[10px]">{mode === 'cloud' ? '' : mode === 'guest' ? 'guest' : '...'}</span>
          </button>

          {/* Settings Button */}
          <Link
            href="/settings"
            className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-border/50 transition-colors"
            title={t.nav.settings}
          >
            <Settings size={18} />
          </Link>

          {loading ? (
            <div className="w-6 h-6 rounded-full bg-border/50 animate-pulse" />
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-border/50 transition-colors"
              title={t.common.signOut}
            >
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-6 h-6 rounded-full border border-border"
              />
              <LogOut size={14} className="text-muted" />
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors"
            >
              <LogIn size={14} />
              <span>{t.common.signIn}</span>
            </button>
          )}
        </div>
      </div>

      {/* Debug Modal */}
      {showDebug && (
        <div
          className="fixed inset-0 z-50 bg-black/80 p-4 flex items-center justify-center"
          onClick={() => setShowDebug(false)}
        >
          <div
            className="bg-gray-900 p-4 rounded-lg max-w-sm w-full text-white text-sm font-mono"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold mb-3">Sync Debug</h3>
            {debugInfo ? (
              <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
            ) : (
              <p>Loading...</p>
            )}
            <div className="flex gap-2 mt-4">
              <button
                className="flex-1 px-3 py-2 bg-blue-600 rounded text-sm"
                onClick={() => {
                  window.location.reload()
                }}
              >
                Refresh
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
      )}
    </header>
  )
}
