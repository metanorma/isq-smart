/**
 * BuildContext — shared state threaded through the build pipeline.
 *
 * Replaces the pattern of each stage independently binding
 * `const isExcluded = SiteConfig.isExcluded` and threading `routes: Set<string>`
 * through return values. The context is created once in the plugin entry point
 * and passed to every stage.
 */

import { SiteConfig } from '../src/site.config'
import type { BuildPaths } from './types'

export interface BuildContext {
  /** Resolved filesystem paths for all data sources and output. */
  paths: BuildPaths
  /** Whether a part key (or its base part) is excluded from the build. */
  isExcluded: (partKey: string) => boolean
  /** Accumulating set of route paths for SSG / sitemap generation. */
  routes: Set<string>
}

export function createBuildContext(paths: BuildPaths): BuildContext {
  return {
    paths,
    isExcluded: SiteConfig.isExcluded,
    routes: new Set<string>([
      '/',
      '/quantities',
      '/reference',
      '/units',
      '/dimensions',
      '/smartsdu',
    ]),
  }
}
