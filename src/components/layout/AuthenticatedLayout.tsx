import { useNavigate } from 'react-router-dom'
import { AppNavLink } from '@/components/ui/AppNavLink'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { MobileBottomNavigation } from './MobileBottomNavigation'
import { OfflineBanner } from '@/components/ui/OfflineBanner'
import { Logo } from '@/components/ui/Logo'
import { LayoutProvider, useLayout } from '@/contexts/LayoutContext'
import { DRAWER_NAV_ITEMS, ROUTES } from '@/constants/app'
import { SyncToastListener } from '@/components/sync/SyncToastListener'
import { PWAInstallBanner } from '@/components/pwa/PWAInstallBanner'
import { usePWAInstall } from '@/hooks/usePWAInstall'
import { PWAUpdateBanner } from '@/components/pwa/PWAUpdateBanner'
import { usePWAUpdate } from '@/hooks/usePWAUpdate'
import { X, Plus } from 'lucide-react'
import { useEffect, useRef } from 'react'
import {
  LayoutDashboard, ClipboardList, BookOpen, Settings, Layers, FileText,
  type LucideIcon
} from 'lucide-react'

const drawerIconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  ClipboardList,
  BookOpen,
  Settings,
  Layers,
  FileText,
}

function MobileDrawer() {
  const { drawerOpen, closeDrawer } = useLayout()
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!drawerOpen) return

    const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    )

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDrawer()
        return
      }
      if (e.key === 'Tab' && focusable && focusable.length > 0) {
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const current = document.activeElement
        if (e.shiftKey && current === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && current === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    if (focusable && focusable.length > 0) {
      focusable[0].focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen, closeDrawer])

  if (!drawerOpen) return null

  return (
    <div className="fixed inset-0 z-50 lg:hidden" ref={drawerRef}>
      <div className="absolute inset-0 bg-black/40" onClick={closeDrawer} aria-hidden="true" />
      <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-4 h-16 border-b border-border-light shrink-0">
          <Logo />
          <button type="button" onClick={closeDrawer}
            className="w-12 h-12 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted transition-colors"
            aria-label="Fechar menu">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 px-2" aria-label="Menu lateral">
          <ul className="space-y-0.5">
            {DRAWER_NAV_ITEMS.map((item) => {
              const Icon = drawerIconMap[item.icon]
              return (
                <li key={item.label}>
                  <AppNavLink
                    to={item.href}
                    end
                    onClick={closeDrawer}
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
      </aside>
    </div>
  )
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { canInstall, install, dismiss } = usePWAInstall()
  const { updateAvailable, update, dismiss: dismissUpdate } = usePWAUpdate()

  return (
    <div className="flex min-h-screen bg-surface-alt">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[60] focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
        Pular para o conteúdo
      </a>
      <Sidebar />
      <div id="main-content" role="main" className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <OfflineBanner />
        {updateAvailable && <PWAUpdateBanner onUpdate={update} onDismiss={dismissUpdate} />}
        {canInstall && <PWAInstallBanner onInstall={install} onDismiss={dismiss} />}
        {children}
        <MobileBottomNavigation />

        <button type="button" onClick={() => navigate(ROUTES.levantamentosNovo)}
          className="lg:hidden fixed right-4 z-40 w-14 h-14 rounded-full bg-primary-500 text-white shadow-fab flex items-center justify-center hover:bg-primary-600 active:scale-95 transition-all"
          style={{ bottom: 'calc(4.5rem + env(safe-area-inset-bottom))' }}
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
