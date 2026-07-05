import { useResolvedPath, useMatch, NavLink, type NavLinkProps } from 'react-router-dom'

export function AppNavLink({ children, ...props }: NavLinkProps) {
  const resolved = useResolvedPath(props.to)
  const match = useMatch({ path: resolved.pathname, end: props.end })
  return (
    <NavLink {...props} aria-current={match ? 'page' : undefined}>
      {children}
    </NavLink>
  )
}
