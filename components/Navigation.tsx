'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Timer, ListTodo, Calendar, BarChart2, PanelLeftClose, PanelLeft } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { AuthButton } from './AuthButton'
import { useUIStore } from '@/stores/uiStore'

const navItems = [
  { href: '/', label: 'Tasks', icon: ListTodo },
  { href: '/progress', label: 'Progress', icon: BarChart2 },
  { href: '/timer', label: 'Timer', icon: Timer },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
]

export function Navigation() {
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-surface border-t border-border md:relative md:border-t-0 md:border-r md:h-screen z-50 transition-all duration-300 ${
      sidebarCollapsed ? 'md:w-16' : 'md:w-64'
    }`}>
      <div className="flex md:flex-col p-2 md:p-4 h-full">
        {/* Header with collapse button */}
        <div className={`hidden md:flex items-center mb-8 ${sidebarCollapsed ? 'justify-center' : 'justify-between px-4'} py-2`}>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-foreground">Paretflow</h1>
              <p className="text-sm text-muted">Focus. Simplify. Achieve.</p>
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-muted hover:bg-border/50 hover:text-foreground transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
          </button>
        </div>

        <div className="flex w-full justify-around md:flex-col md:space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                title={sidebarCollapsed ? label : undefined}
                className={`flex flex-col md:flex-row items-center md:gap-3 px-3 py-2 md:px-4 md:py-3 rounded-lg transition-colors ${
                  sidebarCollapsed ? 'md:justify-center' : ''
                } ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-muted hover:bg-border/50 hover:text-foreground'
                }`}
              >
                <Icon size={20} />
                <span className={`text-xs md:text-sm mt-1 md:mt-0 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                  {label}
                </span>
              </Link>
            )
          })}
        </div>

        <div className={`hidden md:flex md:flex-col md:gap-3 md:mt-auto md:pt-4 md:border-t md:border-border ${sidebarCollapsed ? 'items-center' : ''}`}>
          <AuthButton />
          <ThemeToggle collapsed={sidebarCollapsed} />
        </div>
      </div>
    </nav>
  )
}
