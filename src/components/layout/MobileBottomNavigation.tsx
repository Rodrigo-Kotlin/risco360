import { cn } from '@/lib/utils'
import { BOTTOM_NAV_ITEMS } from '@/constants/app'
import { NavLink } from 'react-router-dom'
import {
  Building2, FileText, Layers, LayoutDashboard, ClipboardList,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Layers,
  FileText,
  LayoutDashboard,
  ClipboardList,
}

/**
 * Navegação inferior para mobile.
 * Inclui safe-area-inset-bottom para compatibilidade com iPhones com home indicator.
 */
export function MobileBottomNavigation() {
  const mainItems = BOTTOM_NAV_ITEMS

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-light shadow-lg"
      aria-label="Navegação mobile"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="flex items-center justify-around h-16 px-2">
        {mainItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <li key={item.label} className="flex-1">
              <NavLink
                to={item.href}
                end
                className={({ isActive }) => cn(
                  'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all w-full relative',
                  isActive
                    ? 'text-primary-600'
                    : 'text-text-muted hover:text-primary-500'
                )}
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary-500"
                        aria-hidden="true"
                      />
                    )}
                    {Icon && <Icon size={20} aria-hidden="true" />}
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
