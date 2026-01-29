'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut, LogIn, Loader2, Cloud, CloudOff } from 'lucide-react'

interface TopHeaderProps {
  isSyncing?: boolean
}

export function TopHeader({ isSyncing = false }: TopHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

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

  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-white/10 dark:border-white/5 px-3 py-1.5 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-base font-bold text-foreground">Paretflow</h1>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1 text-xs text-muted" title={isSyncing ? 'Syncing...' : 'Synced'}>
              {isSyncing ? (
                <Loader2 size={12} className="animate-spin text-blue-500" />
              ) : (
                <Cloud size={12} className="text-green-500" />
              )}
            </div>
          )}

          {loading ? (
            <div className="w-6 h-6 rounded-full bg-border/50 animate-pulse" />
          ) : user ? (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg hover:bg-border/50 transition-colors"
              title="Sign out"
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
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
