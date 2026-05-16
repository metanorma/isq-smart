import type { Domain, DomainInfo, PartMeta, PartKey } from './types'

const DOMAINS: readonly DomainInfo[] = [
  {
    key: 'quantities',
    label: 'Quantities',
    description: 'Physical quantities, their definitions, symbols, and measurement units across Parts 3–13.',
    path: '/quantities',
    icon: '📐',
  },
  {
    key: 'math',
    label: 'Mathematical Notation',
    description: 'Mathematical signs, symbols, and operators defined in Part 2.',
    path: '/math',
    icon: '𝝨',
  },
]

const PARTS: readonly PartMeta[] = [
  // ── Quantities (Parts 3–13) ──
  { domain: 'quantities', partKey: '3',  title: 'Space and Time',         description: 'Length, area, volume, angle, time',            icon: '⏱', accent: 'sky' },
  { domain: 'quantities', partKey: '4',  title: 'Mechanics',              description: 'Mass, force, pressure, energy, power',         icon: '⚙', accent: 'slate' },
  { domain: 'quantities', partKey: '5',  title: 'Thermodynamics',         description: 'Temperature, heat, entropy',                   icon: '🌡', accent: 'orange' },
  { domain: 'quantities', partKey: '6',  title: 'Electromagnetism',       description: 'Electric and magnetic quantities',              icon: '⚡', accent: 'amber' },
  { domain: 'quantities', partKey: '7',  title: 'Light and Radiation',    description: 'Photometric and radiometric quantities',        icon: '☀', accent: 'yellow' },
  { domain: 'quantities', partKey: '8',  title: 'Acoustics',              description: 'Sound pressure, intensity, power',              icon: '🔊', accent: 'teal' },
  { domain: 'quantities', partKey: '9',  title: 'Physical Chemistry',     description: 'Atomic and molecular physics',                  icon: '⚗', accent: 'emerald' },
  { domain: 'quantities', partKey: '10', title: 'Atomic and Nuclear',     description: 'Nuclear reactions, ionizing radiation',         icon: '⚛', accent: 'cyan' },
  { domain: 'quantities', partKey: '11-4', title: 'Dynamic Similarity',   description: 'Characteristic numbers in fluid dynamics',      icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '11-5', title: 'Heat & Mass Transfer', description: 'Heat and mass transfer numbers',               icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '11-6', title: 'Transport Properties', description: 'Characteristic numbers for transport',          icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '11-7', title: 'Magnetohydrodynamics', description: 'MHD and plasma dynamics numbers',              icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '11-8', title: 'Radiation Transfer',   description: 'Radiation heat transfer numbers',               icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '11-9', title: 'Turbulence',           description: 'Turbulence characteristic numbers',             icon: 'π', accent: 'indigo', parentPart: '11', parentTitle: 'Characteristic Numbers' },
  { domain: 'quantities', partKey: '12', title: 'Condensed Matter',       description: 'Solid state physics quantities',                icon: '💎', accent: 'rose' },
  { domain: 'quantities', partKey: '13', title: 'Information Science',    description: 'Information content and entropy',               icon: 'ℹ', accent: 'blue' },

  // ── Mathematical Notation (Part 2, sections 2-5 through 2-20) ──
  { domain: 'math', partKey: '2-5',  title: 'Variables & Functions',     description: 'Variables, functions, and operators',           icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-6',  title: 'Elementary Geometry',       description: 'Elementary and miscellaneous geometry',         icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-7',  title: 'Sets',                      description: 'Set theory notation',                           icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-8',  title: 'Classical Logic',           description: 'Classical logic notation',                      icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-9',  title: 'Axiomatic Set Theory',      description: 'Axiomatic theory of sets',                     icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-10', title: 'Numbers & Functions',       description: 'Numbers, functions, and special sets',          icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-11', title: 'Special Functions',         description: 'Constants and special functions',               icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-12', title: 'Number Theory',             description: 'Primes, composites, divisibility',              icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-13', title: 'Combinatorics',             description: 'Sums, products, factorials, binomials',         icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-14', title: 'Functions',                 description: 'Function notation and operations',              icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-15', title: 'Combinatorial Analysis',    description: 'Combinatorial analysis notation',               icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-16', title: 'Calculus',                  description: 'Limits, derivatives, and integrals',            icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-17', title: 'Vectors & Matrices',        description: 'Vector and matrix notation',                    icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-18', title: 'Coordinates & Tensors',     description: 'Coordinate systems and tensors',                icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-19', title: 'Transforms & Operators',    description: 'Transforms and operators notation',             icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
  { domain: 'math', partKey: '2-20', title: 'Special Functions II',      description: 'Additional special functions',                  icon: '𝝨', accent: 'violet', parentPart: '2', parentTitle: 'Mathematical Notation' },
]

const partMap = new Map(PARTS.map(p => [p.partKey, p]))

function basePartKey(partKey: string): string {
  if (partMap.has(partKey)) return partKey
  const idx = partKey.indexOf('-')
  if (idx > 0) return partKey.slice(0, idx)
  return partKey
}

export function getDomains(): DomainInfo[] {
  return [...DOMAINS]
}

export function getDomain(key: Domain): DomainInfo | undefined {
  return DOMAINS.find(d => d.key === key)
}

export function getPartMeta(partKey: PartKey): PartMeta | undefined {
  return partMap.get(basePartKey(partKey))
}

export function getAllParts(): PartMeta[] {
  return [...PARTS]
}

export function getPartsByDomain(domain: Domain): PartMeta[] {
  return PARTS.filter(p => p.domain === domain)
}

export function partUrl(partKey: PartKey): string {
  const meta = partMap.get(partKey)
  if (!meta) return '/'
  return `${meta.domain === 'math' ? '/math' : '/quantities'}/part-${meta.partKey}`
}

export function entryUrl(partKey: PartKey, id: string): string {
  return `${partUrl(partKey)}/${id}`
}

export function domainPath(domain: Domain): string {
  return domain === 'math' ? '/math' : '/quantities'
}
