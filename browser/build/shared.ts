/**
 * Shared build constants — single source of truth for the build pipeline.
 *
 * Any constant used by more than one build stage lives here so that stages
 * never duplicate values that must stay in sync.
 */

/**
 * Human-readable titles for ISO/IEC 80000 parts.
 *
 * Used by:
 *   - build-xrefs   (xref map entries for `iso80000-N` / `iec80000-N`)
 *   - build-documents (publication document titles)
 *
 * Part 6 and Part 13 are IEC-published; the rest are ISO-published.
 */
export const PART_TITLES: Readonly<Record<string, string>> = {
  '1': 'General',
  '2': 'Mathematics',
  '3': 'Space and time',
  '4': 'Mechanics',
  '5': 'Thermodynamics',
  '6': 'Electromagnetism',
  '7': 'Light',
  '8': 'Acoustics',
  '9': 'Physical chemistry and molecular physics',
  '10': 'Atomic and nuclear physics',
  '11': 'Characteristic numbers',
  '12': 'Condensed matter physics',
  '13': 'Information science',
} as const
