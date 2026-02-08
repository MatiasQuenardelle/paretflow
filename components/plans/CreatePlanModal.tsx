'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

interface CreatePlanModalProps {
  onClose: () => void
  onCreate: (title: string, description: string) => void
  initialTitle?: string
  initialDescription?: string
  isEdit?: boolean
}

export function CreatePlanModal({ onClose, onCreate, initialTitle = '', initialDescription = '', isEdit }: CreatePlanModalProps) {
  const [title, setTitle] = useState(initialTitle || '')
  const [description, setDescription] = useState(initialDescription || '')
  const t = useTranslations()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onCreate(title.trim(), description.trim())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold">{isEdit ? t.plans.editPlan : t.plans.createPlan}</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X size={18} className="text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-muted mb-1.5">{t.plans.planTitle}</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50 transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm text-muted mb-1.5">{t.plans.planDescription}</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-foreground placeholder:text-muted/50 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-sm font-medium"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              {isEdit ? t.common.save : t.plans.createPlan}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
