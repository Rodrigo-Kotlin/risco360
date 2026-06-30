import { NavLink, useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { MobileBottomNavigation } from './MobileBottomNavigation'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Logo } from '@/components/ui/Logo'
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext'
import { DRAWER_NAV_ITEMS, ROUTES } from '@/constants/app'
import { SyncToastListener } from '@/components/sync/SyncToastListener'
import { X, Plus } from 'lucide-react'
import {
  LayoutDashboard, ClipboardList, BookOpen, Settings,
  type LucideIcon
} from 'lucide-react'

const drawerIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Settings,
}

function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useLayout()

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-light shrink-0">
          <Logo />
          <button type="button" onClick={closeDrawer}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted transition-colors"
            aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Menu lateral">
          <ul className="space-y-0.5">
            {DRAWER_NAV_ITEMS.map((item) => {
              const Icon = drawerIconMap[item.icon]
              return (
                <li key={item.label}>
                  <NavLink
                    to={item.href}
                    end
                    onClick={closeDrawer}
                    className={({ isActive }) => cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary-50 text-primary-500'
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
      </aside>
    </div>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-surface-alt">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <OfflineBanner />
        {children}
        <MobileBottomNavigation />

        <button type="button" onClick={() => navigate(ROUTES.levantamentosNovo)}
          className="lg:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all"
          aria-label="Novo levantamento">
          <Plus size={24} />
        </button>
      </div>

      <MobileDrawer />
      <SyncToastListener />
    </div>
  )
}

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <LayoutProvider>
      <LayoutContent>{children}</LayoutContent>
    </LayoutProvider>
  )
}
