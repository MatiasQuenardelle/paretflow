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
      {/* Background ring */}
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-border"
        />
        {/* Progress ring */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-linear ${
            isBreak ? 'text-green-500' : 'text-blue-600'
          }`}
        />
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
        <span className={`text-sm font-medium mt-2 ${isBreak ? 'text-green-600' : 'text-muted'}`}>
          {isBreak ? 'Break Time' : 'Focus Time'}
        </span>
      </div>
    </div>
  )
}
