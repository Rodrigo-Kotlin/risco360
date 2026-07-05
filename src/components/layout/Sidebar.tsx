import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants/app'
import { NavLink } from 'react-router-dom'
import { AppNavLink } from '@/components/ui/AppNavLink'
import { Logo } from '@/components/ui/Logo'
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
import { ROUTES } from '@/routes/routes.constants'
import { APP_VERSION } from '@/lib/app-version'
import {
  LayoutDashboard, Building2, ClipboardList, BookOpen, FileText, Settings, Layers,
  Cloud, CloudOff,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Building2,
  ClipboardList,
  BookOpen,
  FileText,
  Settings,
  Layers,
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { data: metrics } = useSyncMetrics()
  const pendingCount = metrics?.pending ?? 0

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-60 h-screen bg-white border-r border-border-light shrink-0 sticky top-0',
        className
      )}
    >
      <div className="px-4 h-16 border-b border-border-light shrink-0 flex items-center">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Navegação principal">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <li key={item.label}>
                  <AppNavLink
                    to={item.href}
                    end
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-label-large transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-semibold'
                        : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                    )}
                  >
                    {Icon && <Icon size={18} aria-hidden="true" />}
                    <span>{item.label}</span>
                  </AppNavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {pendingCount > 0 && (
        <NavLink
          to={ROUTES.sincronizacao}
          className="mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-warning-50 border border-warning/20 text-label-medium text-warning hover:bg-warning-100 transition-colors"
        >
          <CloudOff size={14} />
          <span className="flex-1">Sincronização</span>
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning text-white text-label-small font-bold leading-none" aria-label={`${pendingCount} pendente${pendingCount !== 1 ? 's' : ''} de sincronização`}>
            {pendingCount}
          </span>
        </NavLink>
      )}
      {pendingCount === 0 && (
        <NavLink
          to={ROUTES.sincronizacao}
          className="mx-2 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg text-label-medium text-text-muted hover:bg-surface-muted hover:text-text-secondary transition-colors"
        >
          <Cloud size={14} />
          <span>Sincronização</span>
        </NavLink>
      )}
      <div className="px-3 py-3 border-t border-border-light shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
          <span className="text-label-medium text-text-muted">v{APP_VERSION}</span>
        </div>
      </div>
    </aside>
  )
}