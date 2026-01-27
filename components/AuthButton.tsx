'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { LogOut } from 'lucide-react'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return null

  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 text-sm text-muted hover:text-foreground transition-colors"
      title="Sign out"
    >
      <img
        src={user.user_metadata.avatar_url}
        alt=""
        className="w-6 h-6 rounded-full"
      />
      <LogOut className="w-4 h-4" />
    </button>
  )
}
