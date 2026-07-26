import { getEntry, type CollectionEntry } from 'astro:content'
import type { Lang } from '../i18n'

export type DocEntry = CollectionEntry<'docs'>

export async function getLocalizedDoc(
  slug: string,
  lang: Lang,
): Promise<DocEntry | undefined> {
  const entry = await getEntry('docs', `${slug}.${lang}`)
  if (entry) return entry
  return getEntry('docs', `${slug}.en`)
}
