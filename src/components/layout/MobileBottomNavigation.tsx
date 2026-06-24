import { cn } from '@/lib/utils'
import { BOTTOM_NAV_ITEMS } from '@/constants/app'
import { NavLink } from 'react-router-dom'
import {
  Building2, FileText, Layers,
  type LucideIcon
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  Building2,
  Layers,
  FileText,
}

export function MobileBottomNavigation() {
  const mainItems = BOTTOM_NAV_ITEMS

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border-light shadow-lg"
      aria-label="Navegação mobile"
    >
      <ul className="flex items-center justify-around h-16 px-2">
        {mainItems.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <li key={item.label}>
              <NavLink
                to={item.href}
                end
                className={({ isActive }) => cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors min-w-[3rem]',
                  isActive
                    ? 'text-primary-500'
                    : 'text-text-muted hover:text-primary-500'
                )}
              >
                {Icon && <Icon size={20} aria-hidden="true" />}
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
