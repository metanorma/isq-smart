import type { Lang } from './types'

export function langValue(obj: { en: string; fr?: string } | undefined, lang: Lang): string {
  if (!obj) return ''
  return lang === 'fr' ? (obj.fr ?? obj.en) : obj.en
}
