import type { Domain, DomainInfo, PartMeta, PartKey } from './types'
import { SiteConfig } from '../site.config'

// ── Publisher determination (single source of truth) ──

const IEC_BASE_PARTS = new Set(['6', '13'])

export function publisherOf(partKey: string): 'ISO' | 'IEC' {
  const base = partKey.includes('-') ? partKey.split('-')[0] : partKey
  return IEC_BASE_PARTS.has(base) ? 'IEC' : 'ISO'
}

// ── Part Document model ──
// A PartDocument represents a published ISO/IEC 80000 standard document.

export interface PartDocument {
  partKey: string
  title: string
  publisher: 'ISO' | 'IEC'
  edition: string
  scope: string
  highlights: string[]
  note?: string
  bilingual: boolean
  storeUrl: string
}

// ── Part Section model ──
// A PartSection is a section within a document containing a group of entries.

export interface PartSection {
  partKey: string
  parentDocument: string
  title: string
  description: string
  icon: string
  accent: string
}

// ── Domain definitions ──

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

// ── Part documents (authoritative metadata for each published part) ──

const DOCUMENTS: readonly PartDocument[] = [
  { partKey: '2',  title: 'Mathematical Signs and Symbols',        publisher: 'ISO', edition: '2019 (2nd)', scope: 'Specifies mathematical symbols, explains their meanings, and gives verbal equivalents and applications. Covers symbols used across natural sciences and technology — from basic variables and functions through set theory, logic, calculus, vectors, tensors, and special functions.', highlights: ['Organized into 16 tables by topic area — each table provides the symbol, its meaning, and how it may be read aloud', 'Entries are for identification and communication, not complete mathematical definitions', 'Covers classical logic, axiomatic set theory, combinatorics, calculus, coordinate systems, and transforms', 'Replaces the first edition (2009) with clarifications on font types, scalars, vectors, and tensors'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64973.html' },
  { partKey: '3',  title: 'Space and Time',                        publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of space and time — the foundational dimensions of the ISQ. Covers length, area, volume, angle, curvature, duration, frequency, velocity, acceleration, and related quantities.', highlights: ['Defines base quantities length and time, along with their derived quantities', 'Covers both plane and solid angles, including the radian and steradian as units of dimension one', 'Includes conversion factors between common units (e.g., degree to radian, km/h to m/s)', 'Second edition simplifies the table and makes definitions more physically precise'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64974.html' },
  { partKey: '4',  title: 'Mechanics',                              publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of mechanics — mass, force, pressure, energy, power, momentum, and related quantities that describe the motion and equilibrium of physical bodies.', highlights: ['Defines base quantity mass and its extensive network of derived mechanical quantities', 'Covers both Newtonian (classical) and relativistic momentum and energy', 'Distinguishes between weight (a force) and mass — a common source of confusion', 'Includes pressure, stress, viscosity, and surface tension alongside energy and power'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64975.html' },
  { partKey: '5',  title: 'Thermodynamics',                         publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of thermodynamics — temperature, heat, entropy, enthalpy, and related quantities describing thermal energy and its transformations.', highlights: ['Defines the base quantity thermodynamic temperature and its derived quantity Celsius temperature', 'Covers extensive and specific thermodynamic properties — entropy, enthalpy, Gibbs energy, Helmholtz energy', 'Includes heat transfer coefficients, thermal conductivity, and thermal resistance', 'Connects to Part 4 (mechanics) through pressure-volume work and to Part 9 (chemistry) through chemical thermodynamics'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64976.html' },
  { partKey: '6',  title: 'Electromagnetism',                       publisher: 'IEC', edition: '2022 (2nd)', scope: "Names, symbols, and definitions for quantities and units of electromagnetism. Based on classical electromagnetism (Maxwell's equations) without reference to quantum field theories.", highlights: ['One of two IEC-published parts — developed by IEC/TC 25 in close cooperation with ISO/TC 12', 'Covers electric and magnetic fields, charge, current, voltage, resistance, capacitance, inductance, and electromagnetic waves', 'Second edition adds the elementary charge as a defined item and introduces induced voltage', 'Explains conventions for sinusoidal quantities, complex representations (phasors), and RMS values', 'Describes the unit hierarchy: SI units first, then accepted non-SI, then deprecated CGS units in informative annexes'], note: 'Conforms to the International Electrotechnical Vocabulary (IEC 60050) for terminology.', bilingual: false, storeUrl: 'https://webstore.iec.ch/publication/60010' },
  { partKey: '7',  title: 'Light and Radiation',                    publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of light and optical radiation in the wavelength range of approximately 1 nm to 1 mm — bridging radiometric, photometric, and photon-based measurements.', highlights: ['Distinguishes three categories of quantities: radiometric (all EM radiation), photometric (visible light, weighted by human vision), and photon (particle count based)', 'Uses subscript conventions: "e" for energetic/radiometric, "v" for visible/photometric, "p" for photon quantities', 'Covers spectral quantities — derivatives with respect to wavelength, frequency, or wavenumber — and their mathematical interrelations', 'Explains the three visual regimes: photopic (daylight), scotopic (night), and mesopic (intermediate), each with different luminous efficiency functions', 'Retains the steradian in photometry and radiometry for practical convenience'], note: 'Cross-references Part 10 for ionizing radiation quantities. The spectral luminous efficacy values are based on CIE standards from 1924 (photopic) and 1951 (scotopic).', bilingual: false, storeUrl: 'https://www.iso.org/standard/64977.html' },
  { partKey: '8',  title: 'Acoustics',                              publisher: 'ISO', edition: '2020',       scope: 'Names, symbols, definitions, and units for quantities of acoustics — sound pressure, intensity, power, impedance, and related quantities describing sound generation, propagation, and reception.', highlights: ['Covers sound pressure, particle velocity, sound intensity, sound power, and acoustic impedance', 'Includes logarithmic quantities (sound pressure level, sound power level) expressed in decibels', 'Addresses both airborne and structure-borne sound'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64978.html' },
  { partKey: '9',  title: 'Physical Chemistry and Molecular Physics', publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of physical chemistry and molecular physics — concentration, activity, reaction rates, transport properties, and molecular characteristics.', highlights: ['Uses specialized subscript and notation conventions: substance symbols as subscripts, state indicators in parentheses (s, l, g), asterisk for pure substances, plimsoll sign for standard states', 'Covers extensive and intensive thermodynamic properties alongside kinetic and transport quantities', 'Includes atomic and molecular properties — atomic number, mass number, relative atomic mass, electric dipole moment', 'Summation conventions ensure consistency across mixture and solution chemistry'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64979.html' },
  { partKey: '10', title: 'Atomic and Nuclear Physics',             publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities used in atomic and nuclear physics — particle energies, cross sections, decay rates, radiation dosimetry, and nuclear reaction parameters.', highlights: ['Numerical values of fundamental constants sourced from CODATA recommended values — users advised to check for updates', 'Defines the electronvolt (eV) as the energy gained by an electron crossing a 1 V potential difference in vacuum', 'Discusses the important distinction between stochastic quantities (following probability distributions) and non-stochastic quantities (based on expected values)', 'Second edition aligns definitions with ICRU Report 85a and makes remarks more physically precise'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64980.html' },
  { partKey: '11', title: 'Characteristic Numbers',                 publisher: 'ISO', edition: '2019',       scope: 'Names, symbols, and definitions for characteristic numbers (dimensionless quantities) used in the description of transport and transfer phenomena — Reynolds, Mach, Prandtl, Nusselt, and many more.', highlights: ['Characteristic numbers are quantities of dimension one that describe behavior of natural and technical processes or reveal similarities between different processes', 'Often expressed as ratios of forces, energy, or characteristic times', 'The same equation can define different numbers when applied to different physical processes', 'Organized by process type: dynamic similarity, heat and mass transfer, magnetohydrodynamics, radiation transfer, and turbulence', 'Includes only the most commonly used numbers — alternative forms (inversions, squared versions) are generally deprecated'], bilingual: false, storeUrl: 'https://www.iso.org/standard/64982.html' },
  { partKey: '12', title: 'Condensed Matter Physics',               publisher: 'ISO', edition: '2019 (2nd)', scope: 'Names, symbols, definitions, and units for quantities of condensed matter physics — electrical and thermal conductivity, magnetic properties, lattice parameters, and solid-state phenomena.', highlights: ['Covers quantities describing the electronic, magnetic, thermal, and structural properties of solids and liquids', 'Includes lattice parameters, Debye temperature, effective mass, carrier density, and mobility', 'Addresses both crystalline and non-crystalline materials'], bilingual: false, storeUrl: 'https://www.iso.org/standard/63480.html' },
  { partKey: '13', title: 'Information Science and Technology',      publisher: 'IEC', edition: '2025 (2nd)', scope: 'Names, symbols, and definitions for quantities and units used in information science and technology — information content, entropy, transfer rates, storage capacity, and prefixes for binary multiples.', highlights: ['One of two IEC-published parts — explicitly bilingual (English and French)', 'Defines binary prefixes: kibi (Ki), mebi (Mi), gibi (Gi), tebi (Ti), pebi (Pi), exbi (Ei), zebi (Zi), yobi (Yi)', 'Second edition adds robi (Ri) for 2⁹⁰ and quebi (Qi) for 2¹⁰⁰, matching the new SI prefixes ronna and quetta adopted at the 2022 CGPM', 'Succeeds subclauses 3.8 and 3.9 of IEC 60027-2:2005, the earlier standard for letter symbols in electrical technology'], bilingual: true, storeUrl: 'https://webstore.iec.ch/publication/87379' },
]

// ── Part sections (entry groups within a document) ──

const SECTIONS: readonly PartSection[] = [
  // ── Quantities (Parts 3–13) ──
  { partKey: '3',    parentDocument: '3',  title: 'Space and Time',         description: 'Length, area, volume, angle, time',            icon: '⏱', accent: 'sky' },
  { partKey: '4',    parentDocument: '4',  title: 'Mechanics',              description: 'Mass, force, pressure, energy, power',         icon: '⚙', accent: 'slate' },
  { partKey: '5',    parentDocument: '5',  title: 'Thermodynamics',         description: 'Temperature, heat, entropy',                   icon: '🌡', accent: 'orange' },
  { partKey: '6',    parentDocument: '6',  title: 'Electromagnetism',       description: 'Electric and magnetic quantities',              icon: '⚡', accent: 'amber' },
  { partKey: '7',    parentDocument: '7',  title: 'Light and Radiation',    description: 'Photometric and radiometric quantities',        icon: '☀', accent: 'yellow' },
  { partKey: '8',    parentDocument: '8',  title: 'Acoustics',              description: 'Sound pressure, intensity, power',              icon: '🔊', accent: 'teal' },
  { partKey: '9',    parentDocument: '9',  title: 'Physical Chemistry',     description: 'Atomic and molecular physics',                  icon: '⚗', accent: 'emerald' },
  { partKey: '10',   parentDocument: '10', title: 'Atomic and Nuclear',     description: 'Nuclear reactions, ionizing radiation',         icon: '⚛', accent: 'cyan' },
  { partKey: '11',   parentDocument: '11', title: 'Characteristic Numbers',  description: 'Dimensionless numbers for transport phenomena', icon: 'π', accent: 'indigo' },
  { partKey: '12',   parentDocument: '12', title: 'Condensed Matter',        description: 'Solid state physics quantities',                icon: '💎', accent: 'rose' },
  { partKey: '13',   parentDocument: '13', title: 'Information Science',    description: 'Information content and entropy',               icon: 'ℹ', accent: 'blue' },

  // ── Mathematical Notation (Part 2, sections 2-5 through 2-20) ──
  { partKey: '2-5',  parentDocument: '2', title: 'Variables & Functions',   description: 'Variables, functions, and operators',           icon: '𝝨', accent: 'violet' },
  { partKey: '2-6',  parentDocument: '2', title: 'Elementary Geometry',     description: 'Elementary and miscellaneous geometry',         icon: '𝝨', accent: 'violet' },
  { partKey: '2-7',  parentDocument: '2', title: 'Sets',                    description: 'Set theory notation',                           icon: '𝝨', accent: 'violet' },
  { partKey: '2-8',  parentDocument: '2', title: 'Classical Logic',         description: 'Classical logic notation',                      icon: '𝝨', accent: 'violet' },
  { partKey: '2-9',  parentDocument: '2', title: 'Axiomatic Set Theory',    description: 'Axiomatic theory of sets',                     icon: '𝝨', accent: 'violet' },
  { partKey: '2-10', parentDocument: '2', title: 'Numbers & Functions',     description: 'Numbers, functions, and special sets',          icon: '𝝨', accent: 'violet' },
  { partKey: '2-11', parentDocument: '2', title: 'Special Functions',       description: 'Constants and special functions',               icon: '𝝨', accent: 'violet' },
  { partKey: '2-12', parentDocument: '2', title: 'Number Theory',           description: 'Primes, composites, divisibility',              icon: '𝝨', accent: 'violet' },
  { partKey: '2-13', parentDocument: '2', title: 'Combinatorics',           description: 'Sums, products, factorials, binomials',         icon: '𝝨', accent: 'violet' },
  { partKey: '2-14', parentDocument: '2', title: 'Functions',               description: 'Function notation and operations',              icon: '𝝨', accent: 'violet' },
  { partKey: '2-15', parentDocument: '2', title: 'Combinatorial Analysis',  description: 'Combinatorial analysis notation',               icon: '𝝨', accent: 'violet' },
  { partKey: '2-16', parentDocument: '2', title: 'Calculus',                description: 'Limits, derivatives, and integrals',            icon: '𝝨', accent: 'violet' },
  { partKey: '2-17', parentDocument: '2', title: 'Vectors & Matrices',      description: 'Vector and matrix notation',                    icon: '𝝨', accent: 'violet' },
  { partKey: '2-18', parentDocument: '2', title: 'Coordinates & Tensors',   description: 'Coordinate systems and tensors',                icon: '𝝨', accent: 'violet' },
  { partKey: '2-19', parentDocument: '2', title: 'Transforms & Operators',  description: 'Transforms and operators notation',             icon: '𝝨', accent: 'violet' },
  { partKey: '2-20', parentDocument: '2', title: 'Special Functions II',    description: 'Additional special functions',                  icon: '𝝨', accent: 'violet' },
]

// ── Filter by site configuration ──

const VISIBLE_DOCUMENTS = DOCUMENTS.filter(d => !SiteConfig.isExcluded(d.partKey))
const VISIBLE_SECTIONS = SECTIONS.filter(
  s => !SiteConfig.isExcluded(s.partKey) && !SiteConfig.isExcluded(s.parentDocument),
)

// ── Derive PartMeta from PartSection (+ document metadata) ──
// PartMeta is the interface consumed by routing and display components.

const docLookup = new Map(DOCUMENTS.map(d => [d.partKey, d]))

function sectionToPartMeta(s: PartSection): PartMeta {
  const doc = docLookup.get(s.parentDocument)
  const domain: Domain = s.parentDocument === '2' ? 'math' : 'quantities'
  return {
    domain,
    partKey: s.partKey,
    title: s.title,
    description: s.description,
    icon: s.icon,
    accent: s.accent,
    parentPart: s.parentDocument === s.partKey ? undefined : s.parentDocument,
    parentTitle: doc?.title,
  }
}

const PARTS: readonly PartMeta[] = VISIBLE_SECTIONS.map(sectionToPartMeta)
const partMap = new Map(PARTS.map(p => [p.partKey, p]))
const documentMap = new Map(VISIBLE_DOCUMENTS.map(d => [d.partKey, d]))

// Pre-compute domain groups for O(1) lookup
const partsByDomainMap = new Map<Domain, PartMeta[]>()
for (const p of PARTS) {
  let list = partsByDomainMap.get(p.domain)
  if (!list) { list = []; partsByDomainMap.set(p.domain, list) }
  list.push(p)
}

function basePartKey(partKey: string): string {
  if (partMap.has(partKey)) return partKey
  const idx = partKey.indexOf('-')
  if (idx > 0) return partKey.slice(0, idx)
  return partKey
}

// ── Public API ──

export function getPartDocument(partKey: string): PartDocument | undefined {
  return documentMap.get(partKey)
}

export function getAllDocuments(): readonly PartDocument[] {
  return VISIBLE_DOCUMENTS
}

export function getDomains(): DomainInfo[] {
  const activeDomains = new Set(PARTS.map(p => p.domain))
  return DOMAINS.filter(d => activeDomains.has(d.key))
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
  return partsByDomainMap.get(domain) ?? []
}

export function partUrl(partKey: PartKey): string {
  const meta = getPartMeta(partKey)
  if (!meta) return '/'
  return `${meta.domain === 'math' ? '/math' : '/quantities'}/part-${meta.partKey}`
}

export function entryUrl(partKey: PartKey, id: string): string {
  return `${partUrl(partKey)}/${id}`
}

export function domainPath(domain: Domain): string {
  return domain === 'math' ? '/math' : '/quantities'
}

export function getSectionsForDocument(docKey: string): PartSection[] {
  return VISIBLE_SECTIONS.filter(s => s.parentDocument === docKey)
}
