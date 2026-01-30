'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut, LogIn, Loader2, Cloud, Settings } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface TopHeaderProps {
  isSyncing?: boolean
}

export function TopHeader({ isSyncing = false }: TopHeaderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const t = useTranslations()

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
        <h1 className="text-base font-bold text-foreground">{t.app.name}</h1>

        <div className="flex items-center gap-2">
          {user && (
            <div className="flex items-center gap-1 text-xs text-muted" title={isSyncing ? t.common.syncing : t.common.synced}>
              {isSyncing ? (
                <Loader2 size={12} className="animate-spin text-blue-500" />
              ) : (
                <Cloud size={12} className="text-green-500" />
              )}
            </div>
          )}

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
    </header>
  )
}
