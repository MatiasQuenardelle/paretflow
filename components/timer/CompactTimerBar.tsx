'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, Pause, RotateCcw, Settings, Coffee, Brain, Clock, Zap, SkipForward, Sun, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { useTimerStore, TimerMode } from '@/stores/timerStore'
import { useTaskStore, Step, Task } from '@/stores/taskStore'
import { useUIStore } from '@/stores/uiStore'

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
  const { timerCollapsed, toggleTimer } = useUIStore()

  const [showMenu, setShowMenu] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const activeTask = tasks.find(t => t.id === activeTaskId)
  const incompleteTasks = tasks.filter(t => !t.completed)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Get steps scheduled for today with their parent task
  interface ScheduledStepItem {
    step: Step
    task: Task
    displayTime: string
  }

  const scheduledStepsForToday: ScheduledStepItem[] = tasks.flatMap(task =>
    task.steps
      .filter(step => step.scheduledDate === todayStr && step.scheduledTime && !step.completed && step.text)
      .map(step => {
        const [h, m] = (step.scheduledTime || '').split(':').map(Number)
        const displayTime = new Date(0, 0, 0, h, m).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        return { step, task, displayTime }
      })
  ).sort((a, b) => {
    const timeA = a.step.scheduledTime || ''
    const timeB = b.step.scheduledTime || ''
    return timeA.localeCompare(timeB)
  })

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

  // Mobile always shows compact bar (regardless of timerCollapsed state)
  // Desktop shows collapsed or expanded based on timerCollapsed
  const MobileCompactBar = () => (
    <div className={`md:hidden rounded-xl px-2 py-1.5 mb-2 transition-all duration-300 bg-gradient-to-r ${c.bg} border ${c.border}`}>
      <div className="flex items-center gap-2">
        {/* Small icon */}
        <div className="flex items-center justify-center">
          {isLongBreak ? (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          ) : isBreak ? (
            <Coffee className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Brain className="w-3.5 h-3.5 text-blue-500" />
          )}
        </div>

        {/* Time */}
        <span className={`font-mono text-base font-bold ${c.text}`}>
          {formatTime(timeRemaining)}
        </span>

        {/* Status badge - smaller on mobile */}
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}>
          {isLongBreak ? 'Long' : isBreak ? 'Break' : 'Focus'}
        </span>

        <div className="flex-1" />

        {/* Play/Pause */}
        <button
          onClick={isRunning ? pause : start}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 bg-gradient-to-br ${c.button} text-white`}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
      </div>
    </div>
  )

  // Desktop collapsed view - ultra minimal
  if (timerCollapsed) {
    return (
      <>
        <MobileCompactBar />
        <div className={`hidden md:block rounded-xl px-3 py-1.5 mb-4 transition-all duration-300 bg-gradient-to-r ${c.bg} border ${c.border}`}>
          <div className="flex items-center gap-2">
            {/* Status icon */}
            {isLongBreak ? (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            ) : isBreak ? (
              <Coffee className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Brain className="w-3.5 h-3.5 text-blue-500" />
            )}

            {/* Time */}
            <span className={`font-mono text-base font-bold ${c.text}`}>
              {formatTime(timeRemaining)}
            </span>

            <div className="flex-1" />

            {/* Play/Pause */}
            <button
              onClick={isRunning ? pause : start}
              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 bg-gradient-to-br ${c.button} text-white`}
            >
              {isRunning ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
            </button>

            {/* Expand button */}
            <button
              onClick={toggleTimer}
              className="w-7 h-7 rounded-lg flex items-center justify-center bg-surface/50 text-muted hover:text-foreground transition-all duration-200"
              title="Expand timer"
            >
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
      </>
    )
  }

  // Expanded view - hidden on mobile, only shows on desktop (minimalistic)
  return (
    <>
      <MobileCompactBar />
      <div className={`hidden md:block rounded-xl px-4 py-2.5 mb-4 transition-all duration-300 bg-gradient-to-r ${c.bg} border ${c.border}`}>
        <div className="flex items-center gap-4">
        {/* Compact Circular Progress with Time inside */}
        <div className="relative flex items-center justify-center">
          <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={c.strokeBg}
              strokeWidth="3"
            />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              className={`transition-all duration-1000 ${c.stroke}`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            {isLongBreak ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : isBreak ? (
              <Coffee className="w-4 h-4 text-emerald-500" />
            ) : (
              <Brain className="w-4 h-4 text-blue-500" />
            )}
          </div>
        </div>

        {/* Time and minimal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`font-mono text-xl font-bold tracking-tight ${c.text}`}>
              {formatTime(timeRemaining)}
            </span>
            <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${c.badge}`}>
              {isLongBreak ? 'Long' : isBreak ? 'Break' : 'Focus'}
            </span>
            {!isBreak && (
              <span className="text-xs text-muted">
                {pomodoroCount + 1}/{settings.pomodorosUntilLongBreak}
              </span>
            )}
          </div>

          {/* Compact task display or selector */}
          <div className="flex items-center gap-2 mt-0.5">
            {activeTask ? (
              <p className="text-xs text-muted truncate max-w-[200px]" title={activeTask.title}>
                {activeTask.title}
                <span className="ml-1 opacity-60">
                  ({activeTask.completedPomodoros || 0}/{activeTask.estimatedPomodoros || 1})
                </span>
              </p>
            ) : (incompleteTasks.length > 0 || scheduledStepsForToday.length > 0) ? (
              <select
                value=""
                onChange={(e) => {
                  const value = e.target.value
                  if (value.startsWith('step:')) {
                    const stepId = value.replace('step:', '')
                    const found = scheduledStepsForToday.find(s => s.step.id === stepId)
                    if (found) {
                      setActiveTask(found.task.id)
                      selectTask(found.task.id)
                    }
                  } else {
                    setActiveTask(value)
                    selectTask(value)
                  }
                }}
                className="text-xs bg-transparent border-none text-muted hover:text-foreground cursor-pointer focus:outline-none"
              >
                <option value="">Select task...</option>
                {scheduledStepsForToday.length > 0 && (
                  <optgroup label="Scheduled">
                    {scheduledStepsForToday.map(({ step, task, displayTime }) => (
                      <option key={step.id} value={`step:${step.id}`}>
                        {displayTime} - {step.text}
                      </option>
                    ))}
                  </optgroup>
                )}
                {incompleteTasks.length > 0 && (
                  <optgroup label="Tasks">
                    {incompleteTasks.map(task => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            ) : null}
          </div>
        </div>

        {/* Estimated finish - compact inline */}
        {estimate.remainingPomodoros > 0 && !isBreak && (
          <div className="hidden lg:flex items-center gap-1.5 text-muted">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-sm font-medium text-foreground">{estimate.finishTime}</span>
            <span className="text-xs">({estimate.remainingPomodoros})</span>
          </div>
        )}

        {/* Compact Controls */}
        <div className="flex items-center gap-1.5">
          {/* Play/Pause Button */}
          <button
            onClick={isRunning ? pause : start}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 bg-gradient-to-br ${c.button} text-white`}
          >
            {isRunning ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
          </button>

          {/* Skip/Reset Button */}
          {isBreak ? (
            <button
              onClick={skipBreak}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface/50 text-muted hover:text-foreground transition-all duration-200"
              title="Skip break"
            >
              <SkipForward size={15} />
            </button>
          ) : (
            <button
              onClick={reset}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface/50 text-muted hover:text-foreground transition-all duration-200"
              title="Reset timer"
            >
              <RotateCcw size={15} />
            </button>
          )}

          {/* Settings Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => { setShowMenu(!showMenu); setShowSettings(false) }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                showMenu
                  ? 'bg-border/50 text-foreground'
                  : 'bg-surface/50 text-muted hover:text-foreground'
              }`}
              title="Timer settings"
            >
              <Settings size={15} />
            </button>

            {/* Dropdown Menu - Compact */}
            {showMenu && !showSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                {/* Mode Selection */}
                <div className="p-2 border-b border-border">
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5 px-2">Mode</p>
                  <div className="space-y-0.5">
                    {modeOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setMode(opt.value)
                          setShowMenu(false)
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-lg transition-colors text-sm ${
                          mode === opt.value
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-border/50 text-foreground'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="p-2 border-b border-border">
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider mb-1.5 px-2">Actions</p>
                  <div className="space-y-0.5">
                    {isBreak ? (
                      <button
                        onClick={() => {
                          switchToWork()
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-border/50 transition-colors text-left text-sm"
                      >
                        <Brain size={14} className="text-blue-500" />
                        <span>Start Focus</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            switchToBreak()
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-border/50 transition-colors text-left text-sm"
                        >
                          <Coffee size={14} className="text-emerald-500" />
                          <span>Short Break</span>
                        </button>
                        <button
                          onClick={() => {
                            switchToLongBreak()
                            setShowMenu(false)
                          }}
                          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-border/50 transition-colors text-left text-sm"
                        >
                          <Sun size={14} className="text-amber-500" />
                          <span>Long Break</span>
                        </button>
                      </>
                    )}
                    {activeTask && (
                      <button
                        onClick={() => {
                          setActiveTask(null)
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-border/50 transition-colors text-left text-sm"
                      >
                        <RotateCcw size={14} className="text-muted" />
                        <span>Clear Task</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Settings Link */}
                <div className="p-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-border/50 transition-colors text-left text-sm"
                  >
                    <Settings size={14} className="text-muted" />
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            )}

            {/* Settings Panel */}
            {showMenu && showSettings && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-xs text-muted hover:text-foreground"
                  >
                    ← Back
                  </button>
                  <h3 className="text-sm font-medium">Settings</h3>
                  <div className="w-10" />
                </div>

                <div className="p-3 space-y-3">
                  {/* Long Break Duration */}
                  <div>
                    <label className="text-xs font-medium">Long Break</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="10"
                        max="30"
                        value={settings.longBreakDuration}
                        onChange={(e) => setSettings({ longBreakDuration: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs w-10 text-right">{settings.longBreakDuration}m</span>
                    </div>
                  </div>

                  {/* Pomodoros Until Long Break */}
                  <div>
                    <label className="text-xs font-medium">Pomodoros til Long Break</label>
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        type="range"
                        min="2"
                        max="6"
                        value={settings.pomodorosUntilLongBreak}
                        onChange={(e) => setSettings({ pomodorosUntilLongBreak: Number(e.target.value) })}
                        className="flex-1"
                      />
                      <span className="text-xs w-10 text-right">{settings.pomodorosUntilLongBreak}</span>
                    </div>
                  </div>

                  {/* Auto-start options */}
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartBreaks}
                        onChange={(e) => setSettings({ autoStartBreaks: e.target.checked })}
                        className="rounded w-3.5 h-3.5"
                      />
                      <span className="text-xs">Auto-start breaks</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoStartPomodoros}
                        onChange={(e) => setSettings({ autoStartPomodoros: e.target.checked })}
                        className="rounded w-3.5 h-3.5"
                      />
                      <span className="text-xs">Auto-start pomodoros</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Collapse Button */}
          <button
            onClick={toggleTimer}
            className="w-8 h-8 rounded-lg flex items-center justify-center bg-surface/50 text-muted hover:text-foreground transition-all duration-200"
            title="Minimize timer"
          >
            <ChevronUp size={15} />
          </button>
        </div>
      </div>
      </div>
    </>
  )
}
