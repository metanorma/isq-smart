import { asset } from './asset'

export interface NavLink {
  to: string
  label: string
}

const _coreLinks = [
  { to: '/quantities', label: 'Quantities' },
  { to: '/math', label: 'Math' },
  { to: '/units', label: 'Units' },
  { to: '/dimensions', label: 'Dimensions' },
]

const _secondaryLinks = [
  { to: '/documents', label: 'Publications' },
  { to: '/ontology', label: 'Ontology' },
  { to: '/reference', label: 'Reference' },
  { to: '/about', label: 'About' },
]

export const coreLinks: readonly NavLink[] = _coreLinks.map(l => ({ ...l, to: asset(l.to) }))
export const secondaryLinks: readonly NavLink[] = _secondaryLinks.map(l => ({ ...l, to: asset(l.to) }))
export const navLinks: readonly NavLink[] = [...coreLinks, ...secondaryLinks]

export function isActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/')
}
