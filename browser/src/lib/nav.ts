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
  { to: '/math', label: 'Math', i18nKey: 'nav.math' },
  { to: '/quantities', label: 'Quantities', i18nKey: 'nav.quantities' },
  { to: '/kinds', label: 'Quantity Kinds', i18nKey: 'nav.kinds' },
  { to: '/units', label: 'Units', i18nKey: 'nav.units' },
  { to: '/dimensions', label: 'Dimensions', i18nKey: 'nav.dimensions' },
]

const _secondaryEntries: NavEntry[] = [
  {
    label: 'About',
    i18nKey: 'nav_group.about',
    items: [
      { to: '/about', label: 'About ISO 80000', i18nKey: 'nav_item.about' },
      { to: '/about/emblem', label: 'Emblem', i18nKey: 'page.about.nav.emblem' },
      { to: '/about/history', label: 'History', i18nKey: 'page.about.nav.history' },
      { to: '/about/ecosystem', label: 'Ecosystem', i18nKey: 'page.about.nav.ecosystem' },
    ],
  },
  {
    label: 'Methodology',
    i18nKey: 'nav_item.methodology',
    items: [
      { to: '/methodology', label: 'Overview', i18nKey: 'page.methodology.nav.overview' },
      { to: '/methodology/concept-system', label: 'Concept System', i18nKey: 'page.methodology.nav.concept_system' },
      { to: '/methodology/terminology', label: 'Terminology', i18nKey: 'nav_item.terminology' },
      { to: '/methodology/walkthrough', label: 'Walkthrough', i18nKey: 'page.methodology.nav.walkthrough' },
      { to: '/methodology/measurements', label: 'Measurement intake', i18nKey: 'page.methodology.nav.measurements' },
      { to: '/methodology/navigation', label: 'Navigation', i18nKey: 'page.methodology.nav.navigation' },
      { to: '/methodology/references', label: 'References', i18nKey: 'page.methodology.nav.references' },
    ],
  },
  {
    label: 'Resources',
    i18nKey: 'nav_group.resources',
    items: [
      { to: '/ontology', label: 'Ontology', i18nKey: 'nav_item.ontology' },
      { to: '/documents', label: 'Publications', i18nKey: 'nav_item.publications' },
      { to: '/presentations', label: 'Presentations', i18nKey: 'nav_item.presentations' },
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
