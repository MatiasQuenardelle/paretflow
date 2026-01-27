'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, Clock, Zap, SkipForward, Sun } from 'lucide-react'
import { useTimerStore, TimerMode } from '@/stores/timerStore'
import { useTaskStore } from '@/stores/taskStore'

export function CompactTimerBar() {
  const {
    timeRemaining,
    isRunning,
    isBreak,
    isLongBreak,
    mode,
    customWork,
    customBreak,
    pomodoroCount,
    activeTaskId,
    settings,
    start,
    pause,
    reset,
    tick,
    completeSession,
    switchToBreak,
    switchToLongBreak,
    switchToWork,
    skipBreak,
    setMode,
    setActiveTask,
    setSettings,
  } = useTimerStore()

  const { tasks, incrementTaskPomodoro, selectTask } = useTaskStore()

  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const activeTask = tasks.find(t => t.id === activeTaskId)
  const incompleteTasks = tasks.filter(t => !t.completed)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setShowSettings(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        tick()
      }, 1000)
    } else if (timeRemaining === 0 && isRunning) {
      if (!isBreak) {
        // Complete focus session
        const needsLongBreak = completeSession(activeTaskId || undefined)
        if (activeTaskId) {
          incrementTaskPomodoro(activeTaskId)
        }
        // Switch to appropriate break
        if (needsLongBreak) {
          switchToLongBreak()
        } else {
          switchToBreak()
        }
      } else {
        // Break finished, switch to work
        switchToWork()
      }
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeRemaining, isBreak, activeTaskId, tick, completeSession, switchToBreak, switchToLongBreak, switchToWork, incrementTaskPomodoro])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const getTotalDuration = () => {
    if (isLongBreak) {
      return settings.longBreakDuration * 60
    } else if (isBreak) {
      switch (mode) {
        case '25/5': return 5 * 60
        case '50/10': return 10 * 60
        case 'custom': return customBreak * 60
      }
    } else {
      switch (mode) {
        case '25/5': return 25 * 60
        case '50/10': return 50 * 60
        case 'custom': return customWork * 60
      }
    }
  }

  const totalDuration = getTotalDuration()
  const progress = ((totalDuration - timeRemaining) / totalDuration) * 100
  const circumference = 2 * Math.PI * 20
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const modeOptions: { value: TimerMode; label: string; desc: string }[] = [
    { value: '25/5', label: '25/5', desc: '25 min focus, 5 min break' },
    { value: '50/10', label: '50/10', desc: '50 min focus, 10 min break' },
  ]

  // Calculate estimated finish time for all tasks
  const calculateEstimatedFinish = () => {
    const remainingPomodoros = incompleteTasks.reduce((acc, task) => {
      const remaining = Math.max(0, (task.estimatedPomodoros || 1) - (task.completedPomodoros || 0))
      return acc + remaining
    }, 0)

    const focusDuration = mode === '25/5' ? 25 : mode === '50/10' ? 50 : customWork
    const breakDuration = mode === '25/5' ? 5 : mode === '50/10' ? 10 : customBreak

    const totalMinutes = remainingPomodoros * (focusDuration + breakDuration)
    const finishTime = new Date(Date.now() + totalMinutes * 60 * 1000)

    return {
      remainingPomodoros,
      totalMinutes,
      finishTime: finishTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  }

  const estimate = calculateEstimatedFinish()

  const getStatusColor = () => {
    if (isLongBreak) return 'amber'
    if (isBreak) return 'emerald'
    return 'blue'
  }

  const color = getStatusColor()

  const colorClasses = {
    blue: {
      bg: 'from-blue-500/10 to-indigo-500/10',
      border: 'border-blue-500/20',
      stroke: 'stroke-blue-500',
      strokeBg: 'stroke-blue-500/20',
      text: 'text-blue-600 dark:text-blue-400',
      badge: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      button: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/10',
      border: 'border-emerald-500/20',
      stroke: 'stroke-emerald-500',
      strokeBg: 'stroke-emerald-500/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      button: 'from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700',
    },
    amber: {
      bg: 'from-amber-500/10 to-orange-500/10',
      border: 'border-amber-500/20',
      stroke: 'stroke-amber-500',
      strokeBg: 'stroke-amber-500/20',
      text: 'text-amber-600 dark:text-amber-400',
      badge: 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      button: 'from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700',
    },
  }

  const c = colorClasses[color]

  return (
    <div className={`rounded-2xl p-4 mb-4 transition-all duration-300 bg-gradient-to-r ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-5">
        {/* Circular Progress with Time */}
        <div className="relative flex items-center justify-center">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={c.strokeBg}
              strokeWidth="4"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={`transition-all duration-1000 ${c.stroke}`}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLongBreak ? (
              <Sun className={`w-5 h-5 text-amber-500`} />
            ) : isBreak ? (
              <Coffee className={`w-5 h-5 text-emerald-500`} />
            ) : (
              <Brain className={`w-5 h-5 text-blue-500`} />
            )}
          </div>
        </div>

        {/* Time and Status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`font-mono text-3xl font-bold tracking-tight ${c.text}`}>
              {formatTime(timeRemaining)}
            </span>
            <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${c.badge}`}>
              {isLongBreak ? 'Long Break' : isBreak ? 'Short Break' : 'Focus'}
            </span>
            {!isBreak && (
              <span className="text-xs text-muted">
                #{pomodoroCount + 1} of {settings.pomodorosUntilLongBreak}
              </span>
            )}
          </div>

          {/* Active task or task selector */}
          <div className="mt-1 flex items-center gap-2">
            {activeTask ? (
              <p className="text-sm text-foreground truncate">
                <span className="text-muted">Working on:</span> {activeTask.title}
                <span className="text-muted ml-2">
                  ({activeTask.completedPomodoros || 0}/{activeTask.estimatedPomodoros || 1})
                </span>
              </p>
            ) : incompleteTasks.length > 0 ? (
              <select
                value=""
                onChange={(e) => {
                  setActiveTask(e.target.value)
                  selectTask(e.target.value)
                }}
                className="text-sm bg-transparent border-none text-muted hover:text-foreground cursor-pointer focus:outline-none"
              >
                <option value="">Select a task to focus on...</option>
                {incompleteTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.title} ({task.completedPomodoros || 0}/{task.estimatedPomodoros || 1})
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-muted">Add tasks to get started</p>
            )}
          </div>
        </div>

        {/* Estimated finish time */}
        {estimate.remainingPomodoros > 0 && !isBreak && (
          <div className="hidden md:block text-right">
            <p className="text-xs text-muted">Est. finish</p>
            <p className="text-lg font-semibold">{estimate.finishTime}</p>
            <p className="text-xs text-muted">{estimate.remainingPomodoros} pomodoros left</p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Play/Pause Button */}
          <button
            onClick={isRunning ? pause : start}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 bg-gradient-to-br ${c.button} text-white`}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
          </button>

          {/* Skip/Reset Button */}
          {isBreak ? (
            <button
              onClick={skipBreak}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-border text-muted hover:text-foreground hover:bg-border/50 transition-all duration-200 active:scale-95"
              title="Skip break"
            >
              <SkipForward size={18} />
            </button>
          ) : (
            <button
              onClick={reset}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-surface border border-border text-muted hover:text-foreground hover:bg-border/50 transition-all duration-200 active:scale-95"
              title="Reset timer"
            >
              <RotateCcw size={18} />
            </button>
          )}

          {/* Settings Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setShowMenu(!showMenu); setShowSettings(false) }}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 active:scale-95 ${
                showMenu
                  ? 'bg-border/50 border-border text-foreground'
                  : 'bg-surface border-border text-muted hover:text-foreground hover:bg-border/50'
              }`}
              title="Timer settings"
            >
              <Settings size={18} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && !showSettings && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Mode Selection */}
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Clock size={12} />
                    Timer Mode
                  </p>
                  <div className="space-y-1">
                    {modeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setMode(opt.value)
                          setShowMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          mode === opt.value
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-border/50 text-foreground'
                        }`}
                      >
                        <span className="font-medium">{opt.label}</span>
                        <span className="text-xs text-muted ml-2">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-3 border-b border-border">
                  <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Zap size={12} />
                    Quick Actions
                  </p>
                  <div className="space-y-1">
                    {isBreak ? (
                      <button
                        onClick={() => {
                          switchToWork()
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 transition-colors text-left"
                      >
                        <Brain size={16} className="text-blue-500" />
                        <div>
                          <span className="font-medium">Start Focus</span>
                          <p className="text-xs text-muted">Switch to work session</p>
                        </div>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            switchToBreak()
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 transition-colors text-left"
                        >
                          <Coffee size={16} className="text-emerald-500" />
                          <div>
                            <span className="font-medium">Short Break</span>
                            <p className="text-xs text-muted">{mode === '25/5' ? '5' : mode === '50/10' ? '10' : customBreak} minutes</p>
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            switchToLongBreak()
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 transition-colors text-left"
                        >
                          <Sun size={16} className="text-amber-500" />
                          <div>
                            <span className="font-medium">Long Break</span>
                            <p className="text-xs text-muted">{settings.longBreakDuration} minutes</p>
                          </div>
                        </button>
                      </>
                    )}
                    {activeTask && (
                      <button
                        onClick={() => {
                          setActiveTask(null)
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 transition-colors text-left"
                      >
                        <RotateCcw size={16} className="text-muted" />
                        <div>
                          <span className="font-medium">Clear Active Task</span>
                          <p className="text-xs text-muted">Unlink current task</p>
                        </div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Settings Link */}
                <div className="p-3">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-border/50 transition-colors text-left"
                  >
                    <Settings size={16} className="text-muted" />
                    <div>
                      <span className="font-medium">Timer Settings</span>
                      <p className="text-xs text-muted">Customize durations & behavior</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showMenu && showSettings && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    &larr; Back
                  </button>
                  <h3 className="font-medium">Timer Settings</h3>
                  <div className="w-12" />
                </div>

                <div className="p-4 space-y-4">
                  {/* Long Break Duration */}
                  <div>
                    <label className="text-sm font-medium">Long Break Duration</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="10"
                        max="30"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings({ longBreakDuration: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{settings.longBreakDuration}m</span>
                    </div>
                  </div>

                  {/* Pomodoros Until Long Break */}
                  <div>
                    <label className="text-sm font-medium">Pomodoros Until Long Break</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={settings.pomodorosUntilLongBreak}
                        onChange={(e) => setSettings({ pomodorosUntilLongBreak: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-sm w-12 text-right">{settings.pomodorosUntilLongBreak}</span>
                    </div>
                  </div>

                  {/* Auto-start options */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings({ autoStartBreaks: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-start breaks</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings({ autoStartPomodoros: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">Auto-start pomodoros</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
