/**
 * Site configuration — single source of truth for build and runtime.
 * Edit values here to control build behavior and deployment settings.
 */

/** Parts to exclude from build and runtime. Base parts exclude sub-sections (e.g. '2' excludes '2-5', '2-6', …). */
const EXCLUDED_PARTS: readonly string[] = ['2']

/** Base path for deployment. '/' for local dev, '/isq-smart/' for GitHub Pages. */
const BASE_PATH = '/isq-smart/'

const excluded = new Set(EXCLUDED_PARTS)

export const SiteConfig = {
  excludedParts: excluded,
  basePath: BASE_PATH,

  isExcluded(partKey: string): boolean {
    if (excluded.has(partKey)) return true
    const base = partKey.includes('-') ? partKey.split('-')[0] : partKey
    return excluded.has(base)
  },

  asset(path: string): string {
    return (BASE_PATH + path.replace(/^\//, '')).replace(/\/\//g, '/')
  },
} as const
