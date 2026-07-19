import { messages } from './messages'

export type Lang = 'en' | 'fr'

function lookup(lang: Lang, key: string): string | undefined {
  const parts = key.split('.')
  let result: unknown = (messages as Record<string, unknown>)[lang]
  for (const part of parts) {
    if (typeof result !== 'object' || result === null) return undefined
    result = (result as Record<string, unknown>)[part]
  }
  return typeof result === 'string' ? result : undefined
}

export function t(key: string, lang: Lang = 'en'): string {
  return lookup(lang, key) ?? lookup('en', key) ?? key
}

export function tMap(key: string): Record<Lang, string> {
  return {
    en: lookup('en', key) ?? key,
    fr: lookup('fr', key) ?? lookup('en', key) ?? key,
  }
}

export { messages }

export function getLangFromPath(pathname: string): Lang {
  return pathname.includes('/fr/') || pathname.startsWith('/fr') ? 'fr' : 'en'
}

export function allKeys(): string[] {
  const keys: string[] = []
  function flatten(obj: Record<string, unknown>, prefix = '') {
    for (const [k, v] of Object.entries(obj)) {
      const full = prefix ? `${prefix}.${k}` : k
      if (typeof v === 'object' && v !== null) flatten(v as Record<string, unknown>, full)
      else keys.push(full)
    }
  }
  flatten(messages.en as unknown as Record<string, unknown>)
  return keys
}
