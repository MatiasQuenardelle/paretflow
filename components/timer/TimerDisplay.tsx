'use client'

import { formatTime } from '@/lib/utils'

interface TimerDisplayProps {
  timeRemaining: number
  totalTime: number
  isRunning: boolean
  isBreak: boolean
}

export function TimerDisplay({ timeRemaining, totalTime, isRunning, isBreak }: TimerDisplayProps) {
  const progress = ((totalTime - timeRemaining) / totalTime) * 100
  const circumference = 2 * Math.PI * 140 // radius = 140
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Glow effect behind ring */}
      <div className={`absolute inset-4 rounded-full blur-2xl transition-all duration-500 ${
        isBreak
          ? 'bg-gradient-to-r from-green-500/20 via-emerald-500/20 to-green-500/20'
          : 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20'
      } ${isRunning ? 'animate-glow-pulse' : 'opacity-50'}`} />

      {/* Background ring */}
      <svg className="relative w-full h-full transform -rotate-90" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-white/10 dark:text-white/5"
        />
        {/* Progress ring */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
          style={{
            filter: isRunning ? `drop-shadow(0 0 8px ${isBreak ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'})` : 'none'
          }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            {isBreak ? (
              <>
                <stop offset="0%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#10b981" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </>
            )}
          </linearGradient>
        </defs>
      </svg>

      {/* Pulse animation when running */}
      {isRunning && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className={`w-72 h-72 rounded-full animate-pulse-ring ${
              isBreak ? 'bg-green-500/10' : 'bg-blue-500/10'
            }`}
          />
        </div>
      )}

      {/* Timer text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-6xl font-light tracking-wider text-foreground">
          {formatTime(timeRemaining)}
        </span>
        <span className={`text-sm font-medium mt-2 ${isBreak ? 'text-green-500' : 'text-muted'}`}>
          {isBreak ? 'Break Time' : 'Focus Time'}
        </span>
      </div>
    </div>
  )
}
