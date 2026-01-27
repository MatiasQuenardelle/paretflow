'use client'

import { Check } from 'lucide-react'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, onChange, className = '' }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
        checked
          ? 'bg-blue-600 border-blue-600 text-white'
          : 'border-muted hover:border-blue-400'
      } ${className}`}
    >
      {checked && <Check size={14} strokeWidth={3} />}
    </button>
  )
}
