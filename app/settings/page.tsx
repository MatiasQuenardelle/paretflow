'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun, Monitor, Globe, ChevronRight, User, LogIn, LogOut } from 'lucide-react'
import { useI18n, useTranslations, Locale } from '@/lib/i18n'
import { createClient } from '@/lib/supabase/client'
import { User as SupabaseUser } from '@supabase/supabase-js'

const languages: { code: Locale; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
]

type Theme = 'light' | 'dark' | 'system'

export default function SettingsPage() {
  const { locale, setLocale } = useI18n()
  const t = useTranslations()
  const [theme, setThemeState] = useState<Theme>('system')
  const [mounted, setMounted] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const stored = localStorage.getItem('paretflow-theme') as Theme | null
    if (stored === 'dark' || stored === 'light') {
      setThemeState(stored)
    } else {
      setThemeState('system')
    }

    // Load user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoadingUser(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (newTheme === 'system') {
      localStorage.removeItem('paretflow-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', prefersDark)
    } else {
      localStorage.setItem('paretflow-theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
    }
  }

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

  if (!mounted) {
    return (
      <div className="h-[calc(100dvh-5rem)] md:h-screen p-4 md:p-6 flex items-center justify-center">
        <div className="text-muted">{t.common.loading}</div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-screen p-4 md:p-6 overflow-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground">{t.settings.title}</h1>
          <p className="text-muted text-sm mt-1">{t.settings.subtitle}</p>
        </div>

        {/* Account Section */}
        <section className="bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-foreground flex items-center gap-2">
              <User size={16} className="text-muted" />
              {t.settings.account}
            </h2>
          </div>
          <div className="p-4">
            {loadingUser ? (
              <div className="h-12 bg-border/50 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.user_metadata.avatar_url}
                    alt=""
                    className="w-10 h-10 rounded-full border border-border"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{user.user_metadata.full_name || user.email}</p>
                    <p className="text-xs text-muted">{t.settings.signedInAs} {user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  {t.common.signOut}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.settings.guestMode}</p>
                  <p className="text-xs text-muted">{t.settings.guestModeDescription}</p>
                </div>
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn size={16} />
                  {t.common.signIn}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Appearance Section */}
        <section className="bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-foreground">{t.settings.appearance}</h2>
          </div>

          {/* Language */}
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-muted" />
                <span className="text-sm text-foreground">{t.settings.language}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLocale(lang.code)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                    locale === lang.code
                      ? 'border-blue-500 bg-blue-500/10 text-foreground'
                      : 'border-white/10 hover:border-white/20 text-muted hover:text-foreground'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{lang.nativeName}</p>
                    <p className="text-xs opacity-60">{lang.name}</p>
                  </div>
                  {locale === lang.code && (
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sun size={16} className="text-muted" />
              <span className="text-sm text-foreground">{t.settings.theme}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-500/10 text-foreground'
                    : 'border-white/10 hover:border-white/20 text-muted hover:text-foreground'
                }`}
              >
                <Sun size={20} />
                <span className="text-xs font-medium">{t.settings.lightTheme}</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-500/10 text-foreground'
                    : 'border-white/10 hover:border-white/20 text-muted hover:text-foreground'
                }`}
              >
                <Moon size={20} />
                <span className="text-xs font-medium">{t.settings.darkTheme}</span>
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg border transition-all ${
                  theme === 'system'
                    ? 'border-blue-500 bg-blue-500/10 text-foreground'
                    : 'border-white/10 hover:border-white/20 text-muted hover:text-foreground'
                }`}
              >
                <Monitor size={20} />
                <span className="text-xs font-medium">{t.settings.systemTheme}</span>
              </button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-surface/80 backdrop-blur-xl border border-white/10 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5">
            <h2 className="text-sm font-medium text-foreground">{t.settings.about}</h2>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{t.settings.version}</span>
              <span className="text-sm text-foreground">1.0.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
