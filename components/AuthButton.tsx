'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut, LogIn } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'

export function AuthButton() {
  const { sidebarCollapsed } = useUIStore()
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

  if (loading) return null

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        className={`flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
        title="Sign in to sync data"
      >
        <LogIn className="w-5 h-5" />
        {!sidebarCollapsed && <span>Sign in</span>}
      </button>
    )
  }

  return (
    <button
      onClick={handleSignOut}
      className={`flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
      title="Sign out"
    >
      <img
        src={user.user_metadata.avatar_url}
        alt=""
        className="w-6 h-6 rounded-full"
      />
      {!sidebarCollapsed && <LogOut className="w-4 h-4" />}
    </button>
  )
}
