'use client'

import { TimerMode } from '@/stores/timerStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'

interface ModeSelectorProps {
  mode: TimerMode
  customWork: number
  customBreak: number
  onModeChange: (mode: TimerMode) => void
  onCustomChange: (work: number, breakTime: number) => void
}

export function ModeSelector({
  mode,
  customWork,
  customBreak,
  onModeChange,
  onCustomChange,
}: ModeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [workValue, setWorkValue] = useState(customWork.toString())
  const [breakValue, setBreakValue] = useState(customBreak.toString())

  const modes: { value: TimerMode; label: string; description: string }[] = [
    { value: '25/5', label: '25/5', description: 'Classic Pomodoro' },
    { value: '50/10', label: '50/10', description: 'Deep Work' },
    { value: 'custom', label: 'Custom', description: 'Set your own' },
  ]

  const handleCustomSave = () => {
    const work = parseInt(workValue) || 25
    const breakTime = parseInt(breakValue) || 5
    onCustomChange(Math.max(1, Math.min(120, work)), Math.max(1, Math.min(60, breakTime)))
    setShowCustom(false)
  }

  return (
    <div className="mt-8">
      <div className="flex justify-center gap-2">
        {modes.map(({ value, label, description }) => (
          <Button
            key={value}
            variant={mode === value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => {
              onModeChange(value)
              if (value === 'custom') setShowCustom(true)
            }}
            className="flex-col h-auto py-2 px-4"
          >
            <span className="font-semibold">{label}</span>
            <span className="text-xs opacity-70">{description}</span>
          </Button>
        ))}
      </div>

      {showCustom && mode === 'custom' && (
        <div className="mt-4 p-4 bg-surface border border-border rounded-lg max-w-xs mx-auto">
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted block mb-1">Work (minutes)</label>
              <Input
                type="number"
                value={workValue}
                onChange={(e) => setWorkValue(e.target.value)}
                min="1"
                max="120"
              />
            </div>
            <div>
              <label className="text-sm text-muted block mb-1">Break (minutes)</label>
              <Input
                type="number"
                value={breakValue}
                onChange={(e) => setBreakValue(e.target.value)}
                min="1"
                max="60"
              />
            </div>
            <Button onClick={handleCustomSave} className="w-full">
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
