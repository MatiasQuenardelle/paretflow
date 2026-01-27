'use client'

import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface TimerControlsProps {
  isRunning: boolean
  isBreak: boolean
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onSkip: () => void
}

export function TimerControls({
  isRunning,
  isBreak,
  onStart,
  onPause,
  onReset,
  onSkip,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <Button
        variant="ghost"
        size="lg"
        onClick={onReset}
        className="w-14 h-14 rounded-full"
        title="Reset"
      >
        <RotateCcw size={24} />
      </Button>

      <Button
        variant="primary"
        size="lg"
        onClick={isRunning ? onPause : onStart}
        className={`w-20 h-20 rounded-full ${
          isBreak ? 'bg-green-600 hover:bg-green-700' : ''
        }`}
      >
        {isRunning ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
      </Button>

      <Button
        variant="ghost"
        size="lg"
        onClick={onSkip}
        className="w-14 h-14 rounded-full"
        title={isBreak ? 'Skip to work' : 'Skip to break'}
      >
        <SkipForward size={24} />
      </Button>
    </div>
  )
}
