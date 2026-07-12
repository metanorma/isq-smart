/**
 * Site configuration — single source of truth for build and runtime.
 * Edit values here to control build behavior and deployment settings.
 */

/** Parts to exclude from build and runtime. Base parts exclude sub-sections (e.g. '2' excludes '2-5', '2-6', …). */
const EXCLUDED_PARTS: readonly string[] = []

const excluded = new Set(EXCLUDED_PARTS)

export const SiteConfig = {
  excludedParts: excluded,

  isExcluded(partKey: string): boolean {
    if (excluded.has(partKey)) return true
    const base = partKey.includes('-') ? partKey.split('-')[0] : partKey
    return excluded.has(base)
  },
} as const
