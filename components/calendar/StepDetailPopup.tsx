'use client'

import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { X, Clock, Calendar, FileText, CheckCircle, Circle, Edit3, Save } from 'lucide-react'
import { Step, Task } from '@/stores/taskStore'

interface StepDetailPopupProps {
  isOpen: boolean
  onClose: () => void
  step: Step
  task: Task
  onToggleStep: () => void
  onUpdateStep: (updates: Partial<Step>) => void
  onSelectTask: () => void
}

export function StepDetailPopup({
  isOpen,
  onClose,
  step,
  task,
  onToggleStep,
  onUpdateStep,
  onSelectTask,
}: StepDetailPopupProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false)
  const [description, setDescription] = useState(step.description || '')

  useEffect(() => {
    setDescription(step.description || '')
  }, [step.description])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
    }
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatTime = (time: string | undefined) => {
    if (!time) return null
    const [h, m] = time.split(':').map(Number)
    return format(new Date(0, 0, 0, h, m), 'h:mm a')
  }

  const formatDate = (date: string | undefined) => {
    if (!date) return null
    return format(new Date(date), 'EEEE, MMMM d, yyyy')
  }

  const handleSaveDescription = () => {
    onUpdateStep({ description })
    setIsEditingDescription(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
        }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={onToggleStep}
                  className={`flex-shrink-0 transition-colors ${
                    step.completed
                      ? 'text-green-400 hover:text-green-300'
                      : 'text-white/40 hover:text-white/60'
                  }`}
                >
                  {step.completed ? (
                    <CheckCircle size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <h2 className={`text-xl font-semibold text-white ${
                  step.completed ? 'line-through opacity-60' : ''
                }`}>
                  {step.text || 'Untitled Step'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Task info */}
          <button
            onClick={() => {
              onSelectTask()
              onClose()
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #10b981)' }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/40 uppercase tracking-wider">Task</p>
              <p className="text-sm text-white font-medium truncate">{task.title}</p>
            </div>
            <span className="text-xs text-white/40">View task</span>
          </button>

          {/* Schedule info */}
          <div className="grid grid-cols-2 gap-3">
            {step.scheduledDate && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                <Calendar size={18} className="text-blue-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Date</p>
                  <p className="text-sm text-white">{formatDate(step.scheduledDate)}</p>
                </div>
              </div>
            )}
            {step.scheduledTime && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5">
                <Clock size={18} className="text-cyan-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-white/40">Time</p>
                  <p className="text-sm text-white">{formatTime(step.scheduledTime)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description/Notes */}
          <div className="rounded-xl bg-white/5 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-white/40" />
                <span className="text-xs text-white/40 uppercase tracking-wider">Notes & Details</span>
              </div>
              {!isEditingDescription ? (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Edit3 size={14} />
                </button>
              ) : (
                <button
                  onClick={handleSaveDescription}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-green-400 hover:bg-green-400/10 transition-colors text-xs"
                >
                  <Save size={12} />
                  Save
                </button>
              )}
            </div>
            <div className="p-4">
              {isEditingDescription ? (
                <textarea
                  autoFocus
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add notes, instructions, or details about this step..."
                  className="w-full h-32 bg-transparent text-white text-sm placeholder:text-white/30 resize-none focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setDescription(step.description || '')
                      setIsEditingDescription(false)
                    }
                    if (e.key === 'Enter' && e.metaKey) {
                      handleSaveDescription()
                    }
                  }}
                />
              ) : (
                <div className="min-h-[80px]">
                  {step.description ? (
                    <p className="text-sm text-white/80 whitespace-pre-wrap">{step.description}</p>
                  ) : (
                    <p className="text-sm text-white/30 italic">No notes yet. Click edit to add details.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/10 flex items-center justify-between">
          <span className="text-[10px] text-white/30">
            Press Esc to close
          </span>
          <button
            onClick={onToggleStep}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              step.completed
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'text-white hover:scale-105'
            }`}
            style={!step.completed ? {
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 50%, #10b981 100%)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            } : {}}
          >
            {step.completed ? 'Mark Incomplete' : 'Mark Complete'}
          </button>
        </div>
      </div>
    </div>
  )
}
