import { asset } from './asset'

export interface NavLink {
  to: string
  label: string
  i18nKey: string
}

export interface NavGroup {
  label: string
  i18nKey: string
  items: NavLink[]
}

export type NavEntry = NavLink | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

const _coreLinks: NavLink[] = [
  { to: '/quantities', label: 'Quantities', i18nKey: 'nav.quantities' },
  { to: '/kinds', label: 'Kinds', i18nKey: 'nav.kinds' },
  { to: '/math', label: 'Math', i18nKey: 'nav.math' },
  { to: '/units', label: 'Units', i18nKey: 'nav.units' },
  { to: '/dimensions', label: 'Dimensions', i18nKey: 'nav.dimensions' },
]

const _secondaryEntries: NavEntry[] = [
  {
    label: 'About',
    i18nKey: 'nav_group.about',
    items: [
      { to: '/about', label: 'About ISO 80000', i18nKey: 'nav_item.about' },
      { to: '/methodology', label: 'Methodology', i18nKey: 'nav_item.methodology' },
      { to: '/terminology', label: 'Terminology', i18nKey: 'nav_item.terminology' },
    ],
  },
  {
    label: 'Resources',
    i18nKey: 'nav_group.resources',
    items: [
      { to: '/ontology', label: 'Ontology', i18nKey: 'nav_item.ontology' },
      { to: '/documents', label: 'Publications', i18nKey: 'nav_item.publications' },
      { to: '/reference', label: 'Reference', i18nKey: 'nav_item.reference' },
    ],
  },
]

function applyAsset(entry: NavEntry): NavEntry {
  if (isNavGroup(entry)) {
    return { label: entry.label, i18nKey: entry.i18nKey, items: entry.items.map(i => ({ ...i, to: asset(i.to) })) }
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
