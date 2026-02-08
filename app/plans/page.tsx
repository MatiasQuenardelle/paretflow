'use client'

import { useState } from 'react'
import { Settings, Trash2, Target, Clock, BarChart3, Rocket } from 'lucide-react'
import { usePlanStore, PlanSection } from '@/stores/planStore'
import { useTranslations } from '@/lib/i18n'
import { PlanEmptyState } from '@/components/plans/PlanEmptyState'
import { CreatePlanModal } from '@/components/plans/CreatePlanModal'
import { BrandEcosystemTree } from '@/components/plans/BrandEcosystemTree'
import { PhaseTimeline } from '@/components/plans/PhaseTimeline'
import { PhaseCard } from '@/components/plans/PhaseCard'
import { WeeklyTemplateGrid } from '@/components/plans/WeeklyTemplateGrid'
import { PlatformCards } from '@/components/plans/PlatformCards'
import { ContentPillarsChart } from '@/components/plans/ContentPillarsChart'
import { QuickStartList } from '@/components/plans/QuickStartList'

const SECTION_ICONS: Record<PlanSection, React.ReactNode> = {
  overview: <BarChart3 size={16} />,
  phases: <Target size={16} />,
  weekly: <Clock size={16} />,
  platforms: <BarChart3 size={16} />,
  pillars: <BarChart3 size={16} />,
  quickstart: <Rocket size={16} />,
}

export default function PlansPage() {
  const {
    plan,
    activeSection,
    selectedPhaseId,
    setActiveSection,
    setSelectedPhaseId,
    createPlan,
    updatePlan,
    deletePlan,
    addPhase,
    updatePhase,
    deletePhase,
    addMilestone,
    toggleMilestone,
    deleteMilestone,
    addPlanItem,
    togglePlanItem,
    deletePlanItem,
    addQuickStartItem,
    toggleQuickStartItem,
    deleteQuickStartItem,
    addWeeklyBlock,
    deleteWeeklyBlock,
    addPlatform,
    deletePlatform,
    addPillar,
    deletePillar,
    pushItemToTasks,
    generateWeekTasks,
  } = usePlanStore()
  const t = useTranslations()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [generatedCount, setGeneratedCount] = useState<number | null>(null)

  const sections: { key: PlanSection; label: string }[] = [
    { key: 'overview', label: t.plans.overview },
    { key: 'phases', label: t.plans.phases },
    { key: 'weekly', label: t.plans.weekly },
    { key: 'platforms', label: t.plans.platforms },
    { key: 'pillars', label: t.plans.pillars },
    { key: 'quickstart', label: t.plans.quickStart },
  ]

  const handleGenerateTasks = async () => {
    const count = await generateWeekTasks()
    setGeneratedCount(count)
    setTimeout(() => setGeneratedCount(null), 3000)
  }

  const handleDeletePlan = () => {
    if (confirm(t.plans.confirmDelete)) {
      deletePlan()
    }
  }

  // No plan: show empty state
  if (!plan) {
    return (
      <>
        <PlanEmptyState onCreate={() => setShowCreateModal(true)} />
        {showCreateModal && (
          <CreatePlanModal
            onClose={() => setShowCreateModal(false)}
            onCreate={(title, desc) => createPlan(title, desc)}
          />
        )}
      </>
    )
  }

  // Compute overall progress
  const totalMilestones = plan.phases.reduce((sum, p) => sum + p.milestones.length, 0)
  const doneMilestones = plan.phases.reduce((sum, p) => sum + p.milestones.filter(m => m.completed).length, 0)
  const totalItems = plan.phases.reduce((sum, p) => sum + p.milestones.reduce((s, m) => s + m.items.length, 0), 0)
  const doneItems = plan.phases.reduce((sum, p) => sum + p.milestones.reduce((s, m) => s + m.items.filter(i => i.completed).length, 0), 0)
  const totalHours = plan.platforms.reduce((sum, p) => sum + p.hoursPerWeek, 0)

  // Get selected phase
  const selectedPhase = selectedPhaseId
    ? plan.phases.find(p => p.id === selectedPhaseId) || plan.phases[0]
    : plan.phases[0]

  // ─── Section content renderer ───────────────────────────

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Progress summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
                <p className="text-xl font-bold text-blue-400">{plan.phases.length}</p>
                <p className="text-xs text-muted">{t.plans.phases}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
                <p className="text-xl font-bold text-green-400">{doneMilestones}/{totalMilestones}</p>
                <p className="text-xs text-muted">{t.plans.milestonesCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
                <p className="text-xl font-bold text-purple-400">{doneItems}/{totalItems}</p>
                <p className="text-xs text-muted">{t.plans.itemsCompleted}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
                <p className="text-xl font-bold text-orange-400">{totalHours}</p>
                <p className="text-xs text-muted">{t.plans.hoursPerWeek}</p>
              </div>
            </div>

            {/* Overall progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{t.plans.overallProgress}</h3>
                <span className="text-sm text-muted">{totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0}%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${totalItems > 0 ? (doneItems / totalItems) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Brand ecosystem */}
            {plan.brandTree && (
              <div>
                <h3 className="font-semibold mb-3">{t.plans.brandEcosystem}</h3>
                <BrandEcosystemTree tree={plan.brandTree} />
              </div>
            )}

            {/* Content pillars mini */}
            {plan.contentPillars.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">{t.plans.contentPillars}</h3>
                <div className="h-4 rounded-full overflow-hidden flex">
                  {plan.contentPillars.map(p => {
                    const barColors: Record<string, string> = {
                      blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
                    }
                    return (
                      <div
                        key={p.id}
                        className={`${barColors[p.color] || 'bg-blue-500'} transition-all`}
                        style={{ width: `${p.percentage}%` }}
                        title={`${p.name}: ${p.percentage}%`}
                      />
                    )
                  })}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                  {plan.contentPillars.map(p => {
                    const dotColors: Record<string, string> = {
                      blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500', orange: 'bg-orange-500',
                    }
                    return (
                      <span key={p.id} className="flex items-center gap-1.5 text-xs text-muted">
                        <span className={`w-2 h-2 rounded-full ${dotColors[p.color] || 'bg-blue-500'}`} />
                        {p.name} ({p.percentage}%)
                      </span>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Phase timeline mini */}
            <div>
              <h3 className="font-semibold mb-3">{t.plans.phaseTimeline}</h3>
              <PhaseTimeline
                phases={plan.phases}
                selectedId={selectedPhaseId}
                onSelect={(id) => { setSelectedPhaseId(id); setActiveSection('phases') }}
              />
            </div>
          </div>
        )

      case 'phases':
        return (
          <div className="space-y-4">
            <PhaseTimeline
              phases={plan.phases}
              selectedId={selectedPhase?.id || null}
              onSelect={setSelectedPhaseId}
            />
            {selectedPhase && (
              <PhaseCard
                phase={selectedPhase}
                onToggleMilestone={(msId) => toggleMilestone(selectedPhase.id, msId)}
                onDeleteMilestone={(msId) => deleteMilestone(selectedPhase.id, msId)}
                onAddMilestone={(title) => addMilestone(selectedPhase.id, title)}
                onToggleItem={(msId, itemId) => togglePlanItem(selectedPhase.id, msId, itemId)}
                onDeleteItem={(msId, itemId) => deletePlanItem(selectedPhase.id, msId, itemId)}
                onAddItem={(msId, text) => addPlanItem(selectedPhase.id, msId, text)}
                onPushItem={(text, itemId, msId) => pushItemToTasks(text, itemId, selectedPhase.id, msId)}
              />
            )}
          </div>
        )

      case 'weekly':
        return (
          <WeeklyTemplateGrid
            template={plan.weeklyTemplate}
            onAddBlock={addWeeklyBlock}
            onDeleteBlock={deleteWeeklyBlock}
            onGenerateTasks={handleGenerateTasks}
            generatedCount={generatedCount}
          />
        )

      case 'platforms':
        return (
          <PlatformCards
            platforms={plan.platforms}
            onAdd={addPlatform}
            onDelete={deletePlatform}
          />
        )

      case 'pillars':
        return (
          <ContentPillarsChart
            pillars={plan.contentPillars}
            onAdd={addPillar}
            onDelete={deletePillar}
          />
        )

      case 'quickstart':
        return (
          <QuickStartList
            items={plan.quickStart}
            onToggle={toggleQuickStartItem}
            onDelete={deleteQuickStartItem}
            onAdd={addQuickStartItem}
            onPush={(text, itemId) => pushItemToTasks(text, itemId)}
          />
        )
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile: horizontal section tabs */}
      <div className="md:hidden border-b border-white/10 bg-surface/80 backdrop-blur-xl">
        <div className="flex overflow-x-auto scrollbar-hide px-2 py-2 gap-1">
          {sections.map(sec => (
            <button
              key={sec.key}
              onClick={() => setActiveSection(sec.key)}
              className={`shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                activeSection === sec.key
                  ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-foreground border border-blue-500/20'
                  : 'text-muted hover:text-foreground hover:bg-white/5'
              }`}
            >
              {SECTION_ICONS[sec.key]}
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop: two-panel layout */}
      <div className="hidden md:flex md:flex-1 md:p-6 md:gap-6 overflow-hidden">
        {/* Left sidebar */}
        <div className="w-[340px] shrink-0 overflow-auto rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 p-6 flex flex-col">
          {/* Plan title */}
          <div className="mb-6">
            <h1 className="text-xl font-bold">{plan.title}</h1>
            {plan.description && <p className="text-sm text-muted mt-1">{plan.description}</p>}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <p className="text-lg font-bold text-blue-400">{doneMilestones}/{totalMilestones}</p>
              <p className="text-[10px] text-muted">{t.plans.milestonesCompleted}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <p className="text-lg font-bold text-green-400">{doneItems}/{totalItems}</p>
              <p className="text-[10px] text-muted">{t.plans.itemsCompleted}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${totalItems > 0 ? (doneItems / totalItems) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted mt-1 text-right">
              {totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0}%
            </p>
          </div>

          {/* Section nav */}
          <div className="flex flex-col gap-1 flex-1">
            {sections.map(sec => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeSection === sec.key
                    ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-foreground'
                    : 'text-muted hover:text-foreground hover:bg-white/5'
                }`}
              >
                {SECTION_ICONS[sec.key]}
                {sec.label}
              </button>
            ))}
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-white/5 flex flex-col gap-2 mt-4">
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Settings size={16} />
              {t.plans.editPlan}
            </button>
            <button
              onClick={handleDeletePlan}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-muted hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <Trash2 size={16} />
              {t.plans.deletePlan}
            </button>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 overflow-auto rounded-2xl bg-surface/80 backdrop-blur-xl border border-white/10 p-6">
          {renderSection()}
        </div>
      </div>

      {/* Mobile content */}
      <div className="md:hidden flex-1 overflow-auto">
        <div className="max-w-lg mx-auto p-4">
          {renderSection()}
        </div>
      </div>

      {/* Edit modal */}
      {showEditModal && (
        <CreatePlanModal
          isEdit
          initialTitle={plan.title}
          initialDescription={plan.description}
          onClose={() => setShowEditModal(false)}
          onCreate={(title, desc) => updatePlan({ title, description: desc })}
        />
      )}
    </div>
  )
}
