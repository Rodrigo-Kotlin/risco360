import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/constants/app'
import { NavLink } from 'react-router-dom'
import { Logo } from '@/components/ui/Logo'
import { useSyncMetrics } from '@/hooks/useSyncMetrics'
import { ROUTES } from '@/routes/routes.constants'
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
      <div className="px-5 h-16 border-b border-border-light shrink-0 flex items-center">
        <Logo />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Navegação principal">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon]
            return (
              <li key={item.label}>
                <NavLink
                  to={item.href}
                  end
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-500 border-l-2 border-primary-500 rounded-l-none'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  )}
                >
                  {Icon && <Icon size={18} aria-hidden="true" />}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            )
          })}
        </ul>
      </nav>

      {pendingCount > 0 && (
        <NavLink
          to={ROUTES.sincronizacao}
          className="mx-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20 text-xs font-medium text-warning hover:bg-warning/20 transition-colors"
        >
          <CloudOff size={14} />
          <span className="flex-1">Sincronização</span>
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-warning text-white text-[10px] font-bold leading-none">
            {pendingCount}
          </span>
        </NavLink>
      )}
      {pendingCount === 0 && (
        <NavLink
          to={ROUTES.sincronizacao}
          className="mx-3 mb-1 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-muted hover:bg-surface-muted hover:text-text-secondary transition-colors"
        >
          <Cloud size={14} />
          <span>Sincronização</span>
        </NavLink>
      )}
      <div className="px-3 py-3 border-t border-border-light shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-2 h-2 rounded-full bg-success" aria-hidden="true" />
          <span className="text-xs text-text-muted">v1.0.0-beta</span>
        </div>
      </div>
    </aside>
  )
}
