/**
 * Shared text utilities for search highlighting and stem stripping.
 * Extracted from EntryBrowser.vue, PartEntryList.vue, and entry detail pages
 * where the same logic was duplicated.
 */

export function highlightText(text: string, query: string): string {
  const q = query.trim()
  if (!q) return text
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(re, '<mark class="bg-amber-200/80 text-amber-900 rounded-sm px-0.5 -mx-0.5">$1</mark>')
}

const STEM_RE = /^stem:\s*\[(.+)\]\s*$/

export function stripStem(text: string): string {
  return text.replace(STEM_RE, '$1')
}
