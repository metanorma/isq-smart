import { asset } from './asset'

export interface NavLink {
  to: string
  label: string
}

export interface NavGroup {
  label: string
  items: NavLink[]
}

export type NavEntry = NavLink | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

const _coreLinks: NavLink[] = [
  { to: '/quantities', label: 'Quantities' },
  { to: '/kinds', label: 'Kinds' },
  { to: '/math', label: 'Math' },
  { to: '/units', label: 'Units' },
  { to: '/dimensions', label: 'Dimensions' },
]

const _secondaryEntries: NavEntry[] = [
  {
    label: 'Resources',
    items: [
      { to: '/methodology', label: 'Methodology' },
      { to: '/ontology', label: 'Ontology' },
      { to: '/documents', label: 'Publications' },
      { to: '/reference', label: 'Reference' },
    ],
  },
  { to: '/about', label: 'About' },
]

function applyAsset(entry: NavEntry): NavEntry {
  if (isNavGroup(entry)) {
    return { label: entry.label, items: entry.items.map(i => ({ ...i, to: asset(i.to) })) }
  }
  return { ...entry, to: asset(entry.to) }
}

export const coreLinks: readonly NavLink[] = _coreLinks.map(l => ({ ...l, to: asset(l.to) }))
export const secondaryEntries: readonly NavEntry[] = _secondaryEntries.map(applyAsset)

export const navLinks: readonly NavLink[] = [
  ...coreLinks,
  ...secondaryEntries.flatMap(e => (isNavGroup(e) ? e.items : [e])),
]

export function isActive(pathname: string, path: string): boolean {
  return pathname === path || pathname.startsWith(path + '/')
}
