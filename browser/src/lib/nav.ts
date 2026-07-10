export interface NavLink {
  to: string
  label: string
}

export const coreLinks: readonly NavLink[] = [
  { to: '/quantities', label: 'Quantities' },
  { to: '/math', label: 'Math' },
  { to: '/units', label: 'Units' },
  { to: '/dimensions', label: 'Dimensions' },
]

export const secondaryLinks: readonly NavLink[] = [
  { to: '/documents', label: 'Publications' },
  { to: '/ontology', label: 'Ontology' },
  { to: '/reference', label: 'Reference' },
  { to: '/about', label: 'About' },
]

export const navLinks: readonly NavLink[] = [...coreLinks, ...secondaryLinks]

export function isActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/')
}
