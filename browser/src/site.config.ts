/**
 * Site configuration — single source of truth for build and runtime.
 * Edit values here to control build behavior and deployment settings.
 */

import { basePartKey } from './data/partKey'

/** Parts to exclude from build and runtime. Base parts exclude sub-sections (e.g. '2' excludes '2-5', '2-6', …). */
const EXCLUDED_PARTS: readonly string[] = []

const excluded = new Set(EXCLUDED_PARTS)

export const SiteConfig = {
  excludedParts: excluded,

  isExcluded(partKey: string): boolean {
    if (excluded.has(partKey)) return true
    return excluded.has(basePartKey(partKey))
  },
} as const
