import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface LayoutContextType {
  drawerOpen: boolean
  toggleDrawer: () => void
  closeDrawer: () => void
}

const LayoutContext = createContext<LayoutContextType>({
  drawerOpen: false,
  toggleDrawer: () => {},
  closeDrawer: () => {},
})

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const toggleDrawer = useCallback(() => setDrawerOpen((prev) => !prev), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])
  return (
    <LayoutContext.Provider value={{ drawerOpen, toggleDrawer, closeDrawer }}>
      {children}
    </LayoutContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLayout() {
  return useContext(LayoutContext)
}