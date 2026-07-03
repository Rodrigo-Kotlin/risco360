import { cn } from '@/lib/utils'
import { isMockModeEnabled } from '@/lib/mock-mode'
import { Logo } from '@/components/ui/Logo'
import { User, LogOut, Wifi, WifiOff, Loader2, Beaker, Menu } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DropdownMenu } from '@/components/ui/DropdownMenu'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useLayout } from '@/contexts/LayoutContext'
import { ROUTES } from '@/routes/routes.constants'

interface HeaderProps {
  title?: string
  description?: string
  className?: string
}

export function Header({ title, description, className }: HeaderProps) {
  const { user, profile, logout } = useAuth()
  const { isOnline } = useOnlineStatus()
  const navigate = useNavigate()
  const { toggleDrawer } = useLayout()
  const [signingOut, setSigningOut] = useState(false)

  const displayName = profile?.nome || user?.email?.split('@')[0] || 'Usuário'
  const avatarInitial = (profile?.nome || user?.email || 'U')[0].toUpperCase()

  async function handleLogout() {
    setSigningOut(true)
    await logout()
    setSigningOut(false)
  }

  return (
    <header className={cn(
      'sticky top-0 z-30 flex items-center justify-between h-14 md:h-16 px-4 md:px-6 bg-white/80 backdrop-blur-sm border-b border-border-light',
      className
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <button type="button" onClick={toggleDrawer}
          className="lg:hidden w-12 h-12 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-muted hover:text-text-primary transition-colors"
          aria-label="Abrir menu">
          <Menu size={20} />
        </button>
        <span className="lg:hidden shrink-0">
          <Logo size="sm" showText={false} />
        </span>
        {title && (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-title-small md:text-title-medium font-semibold text-text-primary truncate">{title}</h2>
              {isMockModeEnabled && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-label-small font-bold uppercase bg-warning/10 text-warning border border-warning/20 shrink-0">
                  <Beaker size={10} />
                  Mock Dev
                </span>
              )}
            </div>
            {description && (
              <p className="text-label-medium text-text-muted truncate hidden sm:block">{description}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {isOnline ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-label-medium text-success font-medium bg-success-50 rounded-md">
            <Wifi size={12} /> Online
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-1 text-label-medium text-warning font-medium bg-warning-50 rounded-md">
            <WifiOff size={12} /> Offline
          </span>
        )}

        <DropdownMenu
          align="right"
          trigger={
            <span className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer min-h-[44px]">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-label-medium font-bold">
                {avatarInitial}
              </div>
              <span className="hidden sm:block text-body-medium text-text-secondary">{displayName}</span>
            </span>
          }
          items={[
            {
              label: 'Meu perfil',
              onClick: () => navigate(ROUTES.configuracoes),
              icon: <User size={16} />,
            },
            {
              label: signingOut ? 'Saindo\u2026' : 'Sair',
              onClick: handleLogout,
              icon: signingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />,
              variant: 'danger',
              disabled: signingOut,
            },
          ]}
        />
      </div>
    </header>
  )
}