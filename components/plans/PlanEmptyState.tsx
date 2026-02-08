'use client'

import { Map } from 'lucide-react'
import { useTranslations } from '@/lib/i18n'

export function PlanEmptyState({ onCreate }: { onCreate: () => void }) {
  const t = useTranslations()

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-6">
          <Map className="w-10 h-10 text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">{t.plans.createYourPlan}</h2>
        <p className="text-muted mb-6">{t.plans.getStarted}</p>
        <button
          onClick={onCreate}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] hover:shadow-blue-500/50"
        >
          {t.plans.createPlan}
        </button>
      </div>
    </div>
  )
}
