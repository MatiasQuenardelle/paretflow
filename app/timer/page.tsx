'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useTimerStore } from '@/stores/timerStore'
import { TimerDisplay } from '@/components/timer/TimerDisplay'
import { TimerControls } from '@/components/timer/TimerControls'
import { SessionCounter } from '@/components/timer/SessionCounter'
import { ModeSelector } from '@/components/timer/ModeSelector'
import { useTranslations } from '@/lib/i18n'

export default function TimerPage() {
  const t = useTranslations()
  const {
    mode,
    customWork,
    customBreak,
    timeRemaining,
    isRunning,
    isBreak,
    sessionsToday,
    setMode,
    setCustomTimes,
    start,
    pause,
    reset,
    tick,
    completeSession,
    switchToBreak,
    switchToWork,
    syncTime,
  } = useTimerStore()

  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Calculate total time based on mode
  const getTotalTime = useCallback(() => {
    if (isBreak) {
      switch (mode) {
        case '25/5': return 5 * 60
        case '50/10': return 10 * 60
        case 'custom': return customBreak * 60
      }
    }
    switch (mode) {
      case '25/5': return 25 * 60
      case '50/10': return 50 * 60
      case 'custom': return customWork * 60
    }
  }, [mode, customWork, customBreak, isBreak])

  // Play notification sound
  const playSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch(() => {
        // Audio play failed, likely due to autoplay policy
      })
    }
  }, [])

  // Timer effect
  useEffect(() => {
    if (!isRunning) return

    const interval = setInterval(() => {
      tick()
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, tick])

  // Handle timer completion
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      pause()
      playSound()

      if (!isBreak) {
        completeSession()
        // Show notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t.timer.focusComplete, {
            body: t.timer.timeForBreak,
            icon: '/favicon.ico',
          })
        }
        switchToBreak()
      } else {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t.timer.breakOver, {
            body: t.timer.readyToFocus,
            icon: '/favicon.ico',
          })
        }
        switchToWork()
      }
    }
  }, [timeRemaining, isRunning, isBreak, pause, playSound, completeSession, switchToBreak, switchToWork])

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Sync time on mount (handles case where user was away/closed browser)
  useEffect(() => {
    const remaining = syncTime()
    // If timer was running and completed while away, handle completion
    if (isRunning && remaining === 0) {
      pause()
      playSound()
      if (!isBreak) {
        completeSession()
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t.timer.focusComplete, {
            body: t.timer.timeForBreak,
            icon: '/favicon.ico',
          })
        }
        switchToBreak()
      } else {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(t.timer.breakOver, {
            body: t.timer.readyToFocus,
            icon: '/favicon.ico',
          })
        }
        switchToWork()
      }
    }
  }, []) // Only run on mount

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (isRunning) {
            pause()
          } else {
            start()
          }
          break
        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            reset()
          }
          break
        case 'KeyS':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault()
            handleSkip()
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isRunning, start, pause, reset])

  // Session count for today
  const todaySessionCount = sessionsToday.filter(
    s => new Date(s.completedAt).toDateString() === new Date().toDateString()
  ).length

  const handleSkip = () => {
    if (isBreak) {
      switchToWork()
    } else {
      switchToBreak()
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      <header className="text-center mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t.timer.pageTitle}</h1>
        <p className="text-muted">{t.timer.tagline}</p>
      </header>

      {/* Hidden audio element for notification sound */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/bell.mp3" type="audio/mpeg" />
        <source src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQN5mv/CiVwDA3mT4LB/RwsAb4H+q2gkCm57+aBpLxBthPS7hT0HZ4bpu4A0AGt/86l9Pwhpgf2kdEQVZ4H5qXRAGWWC+q9vPhllgfimcUMbZoL4qnJCGmWC+KlyQhpmgviqckIaZoL4qnJCGmaC+KpyQhpmgviqckIaZoL4qnJCGmaC+KpyQhpmgviqckIaZoL4qnJCGmaC+KpyQhpmgviqckIa" type="audio/wav" />
      </audio>

      <TimerDisplay
        timeRemaining={timeRemaining}
        totalTime={getTotalTime()}
        isRunning={isRunning}
        isBreak={isBreak}
      />

      <TimerControls
        isRunning={isRunning}
        isBreak={isBreak}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSkip={handleSkip}
      />

      <SessionCounter count={todaySessionCount} />

      <ModeSelector
        mode={mode}
        customWork={customWork}
        customBreak={customBreak}
        onModeChange={setMode}
        onCustomChange={setCustomTimes}
      />

      {/* Keyboard shortcuts hint */}
      <div className="mt-8 text-center text-xs text-muted space-x-3">
        <span><kbd className="px-1.5 py-0.5 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-md">Space</kbd> {t.timer.playPause}</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-md">R</kbd> {t.timer.reset.toLowerCase()}</span>
        <span><kbd className="px-1.5 py-0.5 bg-surface/60 backdrop-blur-sm border border-white/10 dark:border-white/5 rounded-md">S</kbd> {t.timer.skip.toLowerCase()}</span>
      </div>
    </div>
  )
}
