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
  sections?: { label: string; labelKey: string; items: NavLink[] }[]
}

export type NavEntry = NavLink | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry
}

const _coreLinks: NavLink[] = [
  { to: '/quantities', label: 'Quantities', i18nKey: 'nav.quantities' },
  { to: '/math', label: 'Math', i18nKey: 'nav.math' },
  { to: '/units', label: 'Units', i18nKey: 'nav.units' },
  { to: '/ontology', label: 'Ontology', i18nKey: 'nav_item.ontology' },
]

const learnItems: NavLink[] = [
  { to: '/about', label: 'About ISO 80000', i18nKey: 'nav_item.about' },
  { to: '/about/emblem', label: 'Emblem', i18nKey: 'page.about.nav.emblem' },
  { to: '/about/history', label: 'History', i18nKey: 'page.about.nav.history' },
  { to: '/about/ecosystem', label: 'Ecosystem', i18nKey: 'page.about.nav.ecosystem' },
  { to: '/methodology', label: 'Methodology', i18nKey: 'nav_item.methodology' },
]

const serviceItems: NavLink[] = [
  { to: '/documents', label: 'Publications', i18nKey: 'nav_item.publications' },
  { to: '/presentations', label: 'Presentations', i18nKey: 'nav_item.presentations' },
  { to: '/reference', label: 'Reference', i18nKey: 'nav_item.reference' },
]

const _secondaryEntries: NavEntry[] = [
  {
    label: 'Explore',
    i18nKey: 'nav_group.explore',
    items: [...learnItems, ...serviceItems],
    sections: [
      { label: 'Learn', labelKey: 'nav_section.learn', items: learnItems },
      { label: 'Services', labelKey: 'nav_section.services', items: serviceItems },
    ],
  },
]

function applyAsset(entry: NavEntry): NavEntry {
  if (isNavGroup(entry)) {
    return {
      label: entry.label,
      i18nKey: entry.i18nKey,
      items: entry.items.map(i => ({ ...i, to: asset(i.to) })),
      sections: entry.sections?.map(s => ({ ...s, items: s.items.map(i => ({ ...i, to: asset(i.to) })) })),
    }
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
